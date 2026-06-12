const ApiKey = require("../../models/ApiKey.model");
const User   = require("../../features/users/user.model");
const { createClient } = require("redis");

// ─── Redis client ─────────────────────────────────────────────────────────────

let redisClient = null;
let redisAvailable = false;

async function getRedisClient() {
  if (!redisClient) {
    redisClient = createClient({
      socket: {
        host: process.env.REDIS_HOST || "localhost",
        port: parseInt(process.env.REDIS_PORT || "6379", 10),
      },
    });
    redisClient.on("error", (err) => {
      redisAvailable = false;
      console.error("Redis Client Error:", err.message);
    });
    redisClient.on("ready", () => { redisAvailable = true; });
    try {
      await redisClient.connect();
      redisAvailable = true;
    } catch (err) {
      redisAvailable = false;
      console.error("Redis connect failed:", err.message);
    }
  }
  return { client: redisClient, available: redisAvailable };
}

// ─── In-process fallback rate limiter (used when Redis is down) ───────────────
// Simple token-bucket per API key ID, stored in process memory.
// Resets automatically via Map TTL cleanup.

const _fallbackBuckets = new Map(); // keyId → { count, resetAt }

function fallbackRateLimit(keyId, limit) {
  const now = Date.now();
  const hourMs = 60 * 60 * 1000;
  let bucket = _fallbackBuckets.get(keyId);

  if (!bucket || now >= bucket.resetAt) {
    bucket = { count: 0, resetAt: now + hourMs };
    _fallbackBuckets.set(keyId, bucket);
  }

  bucket.count++;
  const remaining = Math.max(0, limit - bucket.count);
  const exceeded  = bucket.count > limit;

  return { count: bucket.count, remaining, resetAt: new Date(bucket.resetAt).toISOString(), exceeded };
}

// Periodically clean up expired buckets (every hour)
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of _fallbackBuckets) {
    if (now >= bucket.resetAt) _fallbackBuckets.delete(key);
  }
}, 60 * 60 * 1000);

// ─── Shared rate-limit enforcement ───────────────────────────────────────────

async function enforceRateLimit(req, res, apiKeyDoc) {
  const limit = apiKeyDoc.rateLimit;
  const keyId = apiKeyDoc._id.toString();
  let count, remaining, resetAt, exceeded;

  const { client, available } = await getRedisClient();

  if (available) {
    try {
      const hour           = Math.floor(Date.now() / (1000 * 60 * 60));
      const rateLimitKey   = `api-key:${keyId}:hour:${hour}`;
      count                = await client.incr(rateLimitKey);
      if (count === 1) await client.expire(rateLimitKey, 3600);
      resetAt   = new Date(hour * 1000 * 60 * 60 + 3600 * 1000).toISOString();
      remaining = Math.max(0, limit - count);
      exceeded  = count > limit;
    } catch (err) {
      // Redis went down mid-request — fall back to in-process
      console.error("Redis rate-limit error, using fallback:", err.message);
      ({ count, remaining, resetAt, exceeded } = fallbackRateLimit(keyId, limit));
    }
  } else {
    // Redis unavailable — use in-process bucket (fail-closed, not fail-open)
    ({ count, remaining, resetAt, exceeded } = fallbackRateLimit(keyId, limit));
  }

  res.set("X-RateLimit-Limit",     limit);
  res.set("X-RateLimit-Remaining", remaining);
  res.set("X-RateLimit-Reset",     resetAt);

  if (exceeded) {
    res.status(429).json({ success: false, message: "Rate limit exceeded", rateLimit: limit, remaining: 0, resetAt });
    return false;
  }
  return true;
}

// ─── IP helpers ───────────────────────────────────────────────────────────────

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) return forwarded.split(",")[0].trim();
  if (req.headers["x-real-ip"]) return req.headers["x-real-ip"];
  if (req.headers["cf-connecting-ip"]) return req.headers["cf-connecting-ip"];
  return req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || "unknown";
}

function normalizeIp(ip) {
  return ip?.startsWith("::ffff:") ? ip.substring(7) : ip;
}

// ─── verifyApiKey middleware ──────────────────────────────────────────────────

/**
 * Middleware to verify API key
 * Usage:
 * - Authorization: Bearer sk_xxxxx
 * - X-API-Key: sk_xxxxx
 */
const verifyApiKey = async (req, res, next) => {
  try {
    let apiKey = null;
    let isApiKeyFormat = false;

    if (req.headers.authorization) {
      const parts = req.headers.authorization.split(" ");
      if (parts.length === 2 && parts[0] === "Bearer") {
        apiKey = parts[1];
        isApiKeyFormat = apiKey.startsWith("sk_");
      }
    } else if (req.headers["x-api-key"]) {
      apiKey = req.headers["x-api-key"];
      isApiKeyFormat = true;
    }

    if (!apiKey || !isApiKeyFormat) return next();

    const keyHash  = ApiKey.hashKey(apiKey);
    const apiKeyDoc = await ApiKey.findOne({ keyHash });

    if (!apiKeyDoc)             return res.status(401).json({ success: false, message: "Invalid API key" });
    if (!apiKeyDoc.isActive)    return res.status(401).json({ success: false, message: "API key disabled" });
    if (apiKeyDoc.expiresAt && new Date() > apiKeyDoc.expiresAt)
                                return res.status(401).json({ success: false, message: "API key expired" });

    if (apiKeyDoc.ipWhitelist?.length) {
      const clientIp = normalizeIp(getClientIp(req));
      if (!apiKeyDoc.ipWhitelist.some((ip) => normalizeIp(ip) === clientIp))
        return res.status(403).json({ success: false, message: "IP not whitelisted" });
    }

    const allowed = await enforceRateLimit(req, res, apiKeyDoc);
    if (!allowed) return;

    const user = await User.findById(apiKeyDoc.userId)
      .populate("profile")
      .populate("companyMembership")
      .populate("notifications");

    req.apiKey      = apiKeyDoc;
    req.userId      = apiKeyDoc.userId.toString();
    req.user        = user;
    req.isApiKeyAuth = true;

    apiKeyDoc.lastUsed = new Date();
    await apiKeyDoc.save();

    next();
  } catch (error) {
    console.error("Error verifying API key:", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─── checkScope middleware ────────────────────────────────────────────────────

const checkScope = (requiredScopes) => (req, res, next) => {
  if (!req.isApiKeyAuth) return next();
  const hasAllScopes = requiredScopes.every((s) => req.apiKey.scopes.includes(s));
  if (!hasAllScopes)
    return res.status(403).json({ success: false, message: "Insufficient permissions", requiredScopes, availableScopes: req.apiKey.scopes });
  next();
};

module.exports = { verifyApiKey, checkScope, getRedisClient, getClientIp, normalizeIp, enforceRateLimit };
