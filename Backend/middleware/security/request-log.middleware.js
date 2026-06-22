const fs   = require("fs");
const path = require("path");

// Keys whose values must never appear in logs
const REDACTED_BODY_KEYS  = new Set(["otp", "password", "token", "code", "secret", "apikey", "api_key"]);
const REDACTED_HDR_KEYS   = new Set(["authorization", "cookie", "x-api-key", "x-auth-token"]);
const REDACTED_QUERY_KEYS = new Set(["token", "apikey", "api_key", "key", "secret", "password"]);

function sanitise(obj, keys) {
  if (!obj || typeof obj !== "object") return "N/A";
  const out = { ...obj };
  keys.forEach((k) => { if (k in out) out[k] = "[REDACTED]"; });
  return JSON.stringify(out);
}

const logsDirectory = path.join(__dirname, "..", "..", "logs");
if (!fs.existsSync(logsDirectory)) fs.mkdirSync(logsDirectory, { recursive: true });
const logFilePath = path.join(logsDirectory, "auth.log");

function writeToFile(line) {
  // Non-blocking append — schedules I/O without blocking the event loop
  fs.appendFile(logFilePath, line, () => {});
}

/**
 * Auth log middleware.
 * Calls next() immediately — all logging is asynchronous and never delays
 * the HTTP response.
 */
function authLogMiddleware(logType) {
  return function (req, res, next) {
    const startTime = Date.now();

    // Call next() right away — logging happens after the response
    next();

    res.on("finish", () => {
      const executionTime = Date.now() - startTime;
      const location      = req.location || { city: "Unknown", region: "Unknown", country: "Unknown" };
      const locationStr   = `${location.city}, ${location.region}, ${location.country}`;
      const safeBody      = sanitise(req.body,    REDACTED_BODY_KEYS);
      const safeHeaders   = sanitise(req.headers, REDACTED_HDR_KEYS);
      const safeQuery     = sanitise(req.query,   REDACTED_QUERY_KEYS);
      const referer       = req.headers.referer || "N/A";
      const origin        = req.get("Origin")    || "N/A";
      const userAgent     = req.get("User-Agent");
      const contentType   = req.get("Content-Type");

      // Re-use req.user set by auth middleware — no extra DB lookup
      const userId  = req.user?._id    ?? "N/A";
      const userNom = req.user?.username ?? "N/A";

      writeToFile(
        `${new Date().toISOString()} - ${req.method} ${req.originalUrl} - ${req.ip}` +
        ` - ${res.statusCode} - ${executionTime}ms - Location: ${locationStr}` +
        ` - Referer: ${referer} - Origin: ${origin} - User-Agent: ${userAgent}` +
        ` - User_id: ${userId}\nHeaders: ${safeHeaders}\nBody: ${safeBody}` +
        `\nQuery: ${safeQuery}\nContent-Type: ${contentType}\n\n`
      );
    });
  };
}

module.exports = authLogMiddleware;
