const ApiKey = require("../../models/apiKey.model");
const User = require("../../models/User.model");
const { createClient } = require("redis");

// Initialiser le client Redis
let redisClient = null;

/**
 * Get or create Redis client
 */
async function getRedisClient() {
  if (!redisClient) {
    redisClient = createClient({
      host: process.env.REDIS_HOST || "localhost",
      port: process.env.REDIS_PORT || 6379,
    });
    redisClient.on("error", (err) => console.error("Redis Client Error", err));
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  }
  return redisClient;
}

/**
 * Get the real client IP address (handles proxies)
 */
function getClientIp(req) {
  // Check for IP from proxy headers
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, get the first one
    return forwarded.split(",")[0].trim();
  }

  // Check other proxy headers
  if (req.headers["x-real-ip"]) {
    return req.headers["x-real-ip"];
  }

  // Check CF-Connecting-IP (Cloudflare)
  if (req.headers["cf-connecting-ip"]) {
    return req.headers["cf-connecting-ip"];
  }

  // Fallback to req.ip or connection.remoteAddress
  return req.ip || req.connection.remoteAddress || req.socket.remoteAddress || "unknown";
}

/**
 * Normalize IP address (handle IPv6-mapped IPv4)
 */
function normalizeIp(ip) {
  // Handle IPv6-mapped IPv4 addresses like ::ffff:192.168.1.1
  if (ip && ip.startsWith("::ffff:")) {
    return ip.substring(7);
  }
  return ip;
}

/**
 * Middleware to verify API key
 * Usage:
 * - In header: Authorization: Bearer sk_xxxxx
 * - In query: ?apiKey=sk_xxxxx
 * - In custom header: X-API-Key: sk_xxxxx
 */
const verifyApiKey = async (req, res, next) => {
  try {
    let apiKey = null;
    let isApiKeyFormat = false;

    // Check different sources for API key
    if (req.headers.authorization) {
      const parts = req.headers.authorization.split(" ");
      if (parts.length === 2 && parts[0] === "Bearer") {
        apiKey = parts[1];
        // Check if it's an API key (starts with sk_)
        isApiKeyFormat = apiKey.startsWith("sk_");
      }
    } else if (req.headers["x-api-key"]) {
      apiKey = req.headers["x-api-key"];
      isApiKeyFormat = true;
    } else if (req.query.apiKey) {
      apiKey = req.query.apiKey;
      isApiKeyFormat = true;
    }

    // If no key or not an API key format, skip
    if (!apiKey || !isApiKeyFormat) {
      return next();
    }

    // It's an API key, validate it
    const keyHash = ApiKey.hashKey(apiKey);
    const apiKeyDoc = await ApiKey.findOne({ keyHash });

    if (!apiKeyDoc) {
      return res.status(401).json({
        success: false,
        message: "Invalid API key",
      });
    }

    // Check if key is active
    if (!apiKeyDoc.isActive) {
      return res.status(401).json({
        success: false,
        message: "API key disabled",
      });
    }

    // Check expiration
    if (apiKeyDoc.expiresAt && new Date() > apiKeyDoc.expiresAt) {
      return res.status(401).json({
        success: false,
        message: "API key expired",
      });
    }

    // Check IP whitelist (optional)
    if (apiKeyDoc.ipWhitelist && apiKeyDoc.ipWhitelist.length > 0) {
      const clientIp = normalizeIp(getClientIp(req));
      const isIpAllowed = apiKeyDoc.ipWhitelist.some(whitelistedIp => {
        return normalizeIp(whitelistedIp) === clientIp;
      });

      if (!isIpAllowed) {
        return res.status(403).json({
          success: false,
          message: "IP not whitelisted",
          clientIp: clientIp,
          allowedIps: apiKeyDoc.ipWhitelist,
        });
      }
    }

    // ===== CHECK RATE LIMIT =====
    try {
      const redis = await getRedisClient();
      const now = new Date();
      const hour = Math.floor(now.getTime() / (1000 * 60 * 60)); // Current hour
      const rateLimitKey = `api-key:${apiKeyDoc._id}:hour:${hour}`;
      
      // Increment request counter for this hour
      const requestCount = await redis.incr(rateLimitKey);
      
      // If first request of the hour, set expiration to 1 hour
      if (requestCount === 1) {
        await redis.expire(rateLimitKey, 3600);
      }
      
      // Check if rate limit is exceeded
      if (requestCount > apiKeyDoc.rateLimit) {
        res.set("X-RateLimit-Limit", apiKeyDoc.rateLimit);
        res.set("X-RateLimit-Remaining", "0");
        res.set("X-RateLimit-Reset", new Date(hour * 1000 * 60 * 60 + 3600 * 1000).toISOString());
        
        return res.status(429).json({
          success: false,
          message: "Rate limit exceeded",
          rateLimit: apiKeyDoc.rateLimit,
          remaining: 0,
          resetAt: new Date(hour * 1000 * 60 * 60 + 3600 * 1000).toISOString(),
        });
      }
      
      // Add rate limit info to response headers
      res.set("X-RateLimit-Limit", apiKeyDoc.rateLimit);
      res.set("X-RateLimit-Remaining", apiKeyDoc.rateLimit - requestCount);
      res.set("X-RateLimit-Reset", new Date(hour * 1000 * 60 * 60 + 3600 * 1000).toISOString());
    } catch (rateLimitError) {
      console.error("Error checking rate limit:", rateLimitError);
      // Don't block request if Redis is down, but log the error
    }

    // Load user with all data
    const user = await User.findById(apiKeyDoc.userId)
      .populate("profile")
      .populate("companyMembership")
      .populate("notifications");

    // Add key and user to request context
    req.apiKey = apiKeyDoc;
    req.userId = apiKeyDoc.userId.toString();
    req.user = user;
    req.isApiKeyAuth = true;

    // Update lastUsed
    apiKeyDoc.lastUsed = new Date();
    await apiKeyDoc.save();

    next();
  } catch (error) {
    console.error("Error verifying API key:", error);
    res.status(500).json({
      success: false,
      message: "Error verifying API key",
      error: error.message,
    });
  }
};

/**
 * Middleware to verify scopes/permissions
 * Usage: checkScope(['read:posts', 'write:posts'])
 */
const checkScope = (requiredScopes) => {
  return (req, res, next) => {
    if (!req.isApiKeyAuth) {
      return next(); // Let other auth middlewares handle it
    }

    const apiKey = req.apiKey;

    // Check if all required scopes are present
    const hasAllScopes = requiredScopes.every((scope) =>
      apiKey.scopes.includes(scope)
    );

    if (!hasAllScopes) {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions",
        requiredScopes,
        availableScopes: apiKey.scopes,
      });
    }

    next();
  };
};

module.exports = {
  verifyApiKey,
  checkScope,
  getRedisClient,
  getClientIp,
  normalizeIp,
};
