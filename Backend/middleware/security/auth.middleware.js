const jwt       = require("jsonwebtoken");
const userModel = require("../../features/users/user.model");
const ApiKey    = require("../../features/api-keys/api-key.model");
const logger    = require("../../utils/logger");
const { getRedisClient, getClientIp, normalizeIp, enforceRateLimit } = require("./api-key.middleware");

// ─── JWT revocation ───────────────────────────────────────────────────────────

const TOKEN_REVOKE_PREFIX = "revoked:";
const TOKEN_TTL_SECONDS   = 7 * 24 * 60 * 60;

async function isTokenRevoked(jti) {
  if (!jti) return false;
  try {
    const { client, available } = await getRedisClient();
    if (!available) return false;
    return (await client.get(`${TOKEN_REVOKE_PREFIX}${jti}`)) !== null;
  } catch {
    return false;
  }
}

async function revokeToken(jti) {
  if (!jti) return;
  try {
    const { client, available } = await getRedisClient();
    if (!available) return;
    await client.set(`${TOKEN_REVOKE_PREFIX}${jti}`, "1", { EX: TOKEN_TTL_SECONDS });
  } catch (err) {
    logger.error("Failed to revoke token:", err.message);
  }
}

// ─── requireAuthUser ──────────────────────────────────────────────────────────

const requireAuthUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  // Cookie fallback: browser sessions send jwt_token automatically
  const token = bearerToken || req.cookies?.jwt_token || null;
  if (!token) return res.status(401).json({ code: "TOKEN_MISSING", message: "Authentication required" });

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.Net_Secret);
  } catch {
    return res.status(401).json({ code: "TOKEN_INVALID", message: "Invalid or expired token" });
  }

  // Revocation + user fetch in parallel — saves one round-trip
  const [revoked, user] = await Promise.all([
    isTokenRevoked(decoded.jti),
    userModel
      .findById(decoded.id)
      // Lean projection — only fields auth logic actually needs
      .select("_id email username role user_image isBanned profile companyMembership")
      .populate({ path: "profile",           select: "_id type companyDetails planLimits" })
      .populate({ path: "companyMembership", select: "_id role company" })
      .lean(),
  ]);

  if (revoked) return res.status(401).json({ code: "TOKEN_REVOKED", message: "Token has been revoked" });
  if (!user)   return res.status(401).json({ code: "TOKEN_INVALID", message: "Invalid or expired token" });

  req.user = user;

  // Company context — only when token carries a companyId and it differs from the user
  if (decoded.companyId && decoded.companyId !== decoded.id) {
    const company = await userModel
      .findById(decoded.companyId)
      .select("_id username email user_image profile")
      .populate({ path: "profile", select: "_id companyDetails" })
      .lean();
    if (!company) return res.status(401).json({ code: "TOKEN_INVALID", message: "Invalid or expired token" });
    req.company = company;
  }

  req.auth = { userId: decoded.id, companyId: decoded.companyId || null, role: decoded.role, jti: decoded.jti };
  next();
};

// ─── attachUserIfPresent ──────────────────────────────────────────────────────
// For routes that are public by default but behave differently for a logged-in
// admin (e.g. previewing a draft). Never rejects — just populates req.user
// when a valid session is present, and silently continues otherwise.
const attachUserIfPresent = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const token = bearerToken || req.cookies?.jwt_token || null;
  if (!token) return next();

  try {
    const decoded = jwt.verify(token, process.env.Net_Secret);
    if (await isTokenRevoked(decoded.jti)) return next();
    req.user = await userModel.findById(decoded.id).select("_id role").lean();
  } catch {
    // Invalid/expired token on an otherwise-public route — treat as anonymous
  }
  next();
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
      const apiKeyDoc = await ApiKey.findOne({ keyHash })
        .select("_id userId isActive expiresAt ipWhitelist rateLimit lastUsed scopes");

      if (!apiKeyDoc)            return res.status(401).json({ success: false, message: "Invalid API key" });
      if (!apiKeyDoc.isActive)   return res.status(401).json({ success: false, message: "API key disabled" });
      if (apiKeyDoc.expiresAt && new Date() > apiKeyDoc.expiresAt)
                                 return res.status(401).json({ success: false, message: "API key expired" });

      if (apiKeyDoc.ipWhitelist?.length) {
        const clientIp = normalizeIp(getClientIp(req));
        if (!apiKeyDoc.ipWhitelist.some((ip) => normalizeIp(ip) === clientIp))
          return res.status(403).json({ success: false, message: "IP not whitelisted" });
      }

      const allowed = await enforceRateLimit(req, res, apiKeyDoc);
      if (!allowed) return;

      // User fetch — lean, select only what routes need
      const user = await userModel
        .findById(apiKeyDoc.userId)
        .select("_id email username role user_image profile companyMembership")
        .populate({ path: "profile",           select: "_id type companyDetails planLimits" })
        .populate({ path: "companyMembership", select: "_id role company" })
        .lean();

      req.isApiKeyAuth = true;
      req.apiKey       = apiKeyDoc;
      req.apiKeyId     = apiKeyDoc._id;
      req.userId       = apiKeyDoc.userId.toString();
      req.user         = user;

      // Fire-and-forget lastUsed update — does not block the response
      ApiKey.updateOne({ _id: apiKeyDoc._id }, { lastUsed: new Date() }).catch(() => {});

      return next();
    } catch (error) {
      logger.error("Error verifying API key:", error.message);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  }

  return requireAuthUser(req, res, next);
};

module.exports = { requireAuthUser, requireAuth, attachUserIfPresent, revokeToken };
