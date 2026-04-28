const jwt = require("jsonwebtoken");
const userModel = require("../../models/User.model");
const ApiKey = require("../../models/apiKey.model");
const { getRedisClient, getClientIp, normalizeIp } = require("./api-key.middleware");

const requireAuthUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }

  try {
    const decodedToken = jwt.verify(token, process.env.Net_Secret);

    // USER principal
    const user = await userModel
      .findById(decodedToken.id)
      .populate("profile")
      .populate("companyMembership");

    if (!user) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    req.user = user; // ✅ ALWAYS the user

    // COMPANY CONTEXT (optional)
    if (decodedToken.companyId) {
      const company = await userModel
        .findById(decodedToken.companyId)
        .populate("profile");

      if (!company) {
        return res.status(401).json({ message: "Invalid or expired token" });
      }

      req.company = company; // ✅ separated
    }

    req.auth = {
      userId: decodedToken.id,
      companyId: decodedToken.companyId || null,
      role: decodedToken.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

/**
 * Unified authentication middleware
 * Accepts either API Key or JWT authentication
 * Priority: API Key first (if provided), then JWT
 * 
 * Includes:
 * - API Key validation (active, expired, etc.)
 * - Rate limiting (Redis)
 * - IP whitelist verification
 * - Scope checking support
 */
const requireAuth = async (req, res, next) => {
  // First try API Key verification
  const authHeader = req.headers.authorization;
  let apiKey = null;
  let isApiKeyFormat = false;

  // Check different sources for API key
  if (authHeader) {
    const parts = authHeader.split(" ");
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

  // Try API key first if format matches
  if (apiKey && isApiKeyFormat) {
    try {
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
      const user = await userModel.findById(apiKeyDoc.userId)
        .populate("profile")
        .populate("companyMembership")
        .populate("notifications");

      // Mark as API key auth
      req.isApiKeyAuth = true;
      req.apiKey = apiKeyDoc; // Store for checkScope middleware
      req.apiKeyId = apiKeyDoc._id;
      req.userId = apiKeyDoc.userId.toString();
      req.user = user;

      // Update lastUsed
      apiKeyDoc.lastUsed = new Date();
      await apiKeyDoc.save();

      return next();
    } catch (error) {
      console.error("Error verifying API key:", error);
      return res.status(500).json({
        success: false,
        message: "Error verifying API key",
        error: error.message,
      });
    }
  }

  // Fall back to JWT authentication
  return requireAuthUser(req, res, next);
};

module.exports = { requireAuthUser, requireAuth };
