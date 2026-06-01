const jwt = require("jsonwebtoken");
const userModel = require("../../models/User.model");
const ApiKey    = require("../../models/ApiKey.model");
const { getRedisClient, getClientIp, normalizeIp, enforceRateLimit } = require("./api-key.middleware");

// ─── JWT revocation check ─────────────────────────────────────────────────────
// Tokens are added to this blocklist via revokeToken() at logout / ban time.
// Key: `revoked:<jti>`  Value: "1"  TTL: matches original token TTL (7d)

const TOKEN_REVOKE_PREFIX = "revoked:";
const TOKEN_TTL_SECONDS   = 7 * 24 * 60 * 60; // must match generateToken expiry

async function isTokenRevoked(jti) {
  if (!jti) return false;
  try {
    const { client, available } = await getRedisClient();
    if (!available) return false; // fail-open for revocation: if Redis is down, trust the token
    const val = await client.get(`${TOKEN_REVOKE_PREFIX}${jti}`);
    return val !== null;
  } catch {
    return false;
  }
}

/**
 * Call this at logout or when banning a user to immediately invalidate their token.
 * `jti` comes from the decoded JWT payload.
 */
async function revokeToken(jti) {
  if (!jti) return;
  try {
    const { client, available } = await getRedisClient();
    if (!available) return;
    await client.set(`${TOKEN_REVOKE_PREFIX}${jti}`, "1", { EX: TOKEN_TTL_SECONDS });
  } catch (err) {
    console.error("Failed to revoke token:", err.message);
  }
}

// ─── requireAuthUser ──────────────────────────────────────────────────────────

const requireAuthUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ code: "TOKEN_MISSING", message: "Authentication required" });

  try {
    const decoded = jwt.verify(token, process.env.Net_Secret);

    // Revocation check — blocks immediately invalidated tokens
    if (await isTokenRevoked(decoded.jti)) {
      return res.status(401).json({ code: "TOKEN_REVOKED", message: "Token has been revoked" });
    }

    const user = await userModel
      .findById(decoded.id)
      .populate("profile")
      .populate("companyMembership");

    if (!user) return res.status(401).json({ code: "TOKEN_INVALID", message: "Invalid or expired token" });

    req.user = user;

    if (decoded.companyId) {
      const company = await userModel.findById(decoded.companyId).populate("profile");
      if (!company) return res.status(401).json({ code: "TOKEN_INVALID", message: "Invalid or expired token" });
      req.company = company;
    }

    req.auth = {
      userId:    decoded.id,
      companyId: decoded.companyId || null,
      role:      decoded.role,
      jti:       decoded.jti,
    };

    next();
  } catch (error) {
    return res.status(401).json({ code: "TOKEN_INVALID", message: "Invalid or expired token" });
  }
};

// ─── requireAuth (API key OR JWT) ────────────────────────────────────────────

const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  let apiKey = null;
  let isApiKeyFormat = false;

  if (authHeader) {
    const parts = authHeader.split(" ");
    if (parts.length === 2 && parts[0] === "Bearer") {
      apiKey = parts[1];
      isApiKeyFormat = apiKey.startsWith("sk_");
    }
  } else if (req.headers["x-api-key"]) {
    apiKey = req.headers["x-api-key"];
    isApiKeyFormat = true;
  }

  if (apiKey && isApiKeyFormat) {
    try {
      const keyHash   = ApiKey.hashKey(apiKey);
      const apiKeyDoc = await ApiKey.findOne({ keyHash });

      if (!apiKeyDoc)          return res.status(401).json({ success: false, message: "Invalid API key" });
      if (!apiKeyDoc.isActive) return res.status(401).json({ success: false, message: "API key disabled" });
      if (apiKeyDoc.expiresAt && new Date() > apiKeyDoc.expiresAt)
                               return res.status(401).json({ success: false, message: "API key expired" });

      if (apiKeyDoc.ipWhitelist?.length) {
        const clientIp = normalizeIp(getClientIp(req));
        if (!apiKeyDoc.ipWhitelist.some((ip) => normalizeIp(ip) === clientIp))
          return res.status(403).json({ success: false, message: "IP not whitelisted" });
      }

      // Shared rate-limit enforcement (fail-closed via in-process fallback)
      const allowed = await enforceRateLimit(req, res, apiKeyDoc);
      if (!allowed) return;

      const user = await userModel.findById(apiKeyDoc.userId)
        .populate("profile")
        .populate("companyMembership")
        .populate("notifications");

      req.isApiKeyAuth = true;
      req.apiKey       = apiKeyDoc;
      req.apiKeyId     = apiKeyDoc._id;
      req.userId       = apiKeyDoc.userId.toString();
      req.user         = user;

      apiKeyDoc.lastUsed = new Date();
      await apiKeyDoc.save();

      return next();
    } catch (error) {
      console.error("Error verifying API key:", error.message);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  }

  return requireAuthUser(req, res, next);
};

module.exports = { requireAuthUser, requireAuth, revokeToken };
