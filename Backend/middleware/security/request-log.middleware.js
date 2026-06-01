const jwt = require("jsonwebtoken");
const fs = require("fs");
const userModel = require("../../models/User.model");
const path = require("path");
const Log = require("../../models/Logs.model");
const ipinfo = require("ipinfo");

// Keys whose values must never appear in logs
const REDACTED_BODY_KEYS  = new Set(["otp", "password", "token", "code", "secret", "apikey", "api_key"]);
const REDACTED_HDR_KEYS   = new Set(["authorization", "cookie", "x-api-key", "x-auth-token"]);
const REDACTED_QUERY_KEYS = new Set(["token", "apikey", "api_key", "key", "secret", "password"]);

function sanitiseBody(body) {
  if (!body || typeof body !== "object") return "N/A";
  const out = { ...body };
  REDACTED_BODY_KEYS.forEach((k) => { if (k in out) out[k] = "[REDACTED]"; });
  return JSON.stringify(out);
}

function sanitiseHeaders(headers) {
  if (!headers || typeof headers !== "object") return "N/A";
  const out = { ...headers };
  REDACTED_HDR_KEYS.forEach((k) => { if (k in out) out[k] = "[REDACTED]"; });
  return JSON.stringify(out);
}

function sanitiseQuery(query) {
  if (!query || typeof query !== "object") return "N/A";
  const out = { ...query };
  REDACTED_QUERY_KEYS.forEach((k) => { if (k in out) out[k] = "[REDACTED]"; });
  return JSON.stringify(out);
}

function authLogMiddleware(logType) {
  return function (req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    const startTime = new Date();
    const ip = req.ip;

    // Resolve geolocation fire-and-forget — never blocks next()
    ipinfo(ip, (err, response) => {
      req.location = err
        ? { city: "Unknown", region: "Unknown", country: "Unknown" }
        : response;
    });

    if (token) {
      if (token.startsWith("sk_")) {
        if (!req.isApiKeyAuth) req.user = null;
        appendLog(req, res, startTime, logType);
        next();
      } else {
        jwt.verify(token, process.env.Net_Secret, async (err, decodedToken) => {
          if (err) {
            req.user = null;
          } else {
            req.user = await userModel.findById(decodedToken.id).select("_id username role").lean();
          }
          appendLog(req, res, startTime, logType);
          next();
        });
      }
    } else {
      req.user = null;
      appendLog(req, res, startTime, logType);
      next();
    }
  };
}

async function appendLog(req, res, startTime, logType) {
  const endTime       = new Date();
  const executionTime = endTime - startTime;
  const location      = req.location || { city: "Unknown", region: "Unknown", country: "Unknown" };
  const safeBody      = sanitiseBody(req.body);
  const safeHeaders   = sanitiseHeaders(req.headers);
  const referer       = req.headers.referer || "N/A";
  const origin        = req.get("Origin") || "N/A";
  const userAgent     = req.get("User-Agent");
  const queryParams   = sanitiseQuery(req.query);
  const contentType   = req.get("Content-Type");
  const locationStr   = `${location.city}, ${location.region}, ${location.country}`;

  const log = new Log({
    type:          logType,
    method:        req.method,
    url:           req.originalUrl,
    ip:            req.ip,
    referer,
    statusCode:    res.statusCode,
    user_id:       req.user?._id   ?? "N/A",
    user_nom:      req.user?.username ?? "N/A",
    headers:       safeHeaders,
    executionTime,
    body:          safeBody,
    location:      locationStr,
    timestamp:     new Date(),
  });

  try {
    await log.save();
  } catch (err) {
    console.error("Error saving log to database:", err);
  }

  const logsDirectory = path.join(__dirname, "..", "..", "logs");
  const logFilePath   = path.join(logsDirectory, "auth.log");
  const fileLog = `${new Date().toISOString()} - ${req.method} - ${req.originalUrl} - ${req.ip} - Location: ${locationStr} - Referer: ${referer} - Origin: ${origin} - User-Agent: ${userAgent} - ${res.statusCode} - User_id: ${req.user?._id ?? "N/A"}\nHeaders: ${safeHeaders}\nExecution Time: ${executionTime} ms\nBody: ${safeBody}\nQuery: ${queryParams}\nContent-Type: ${contentType}\n\n`;

  if (!fs.existsSync(logsDirectory)) fs.mkdirSync(logsDirectory);

  try {
    fs.appendFileSync(logFilePath, fileLog);
  } catch (err) {
    console.error("Error saving log to file:", err);
  }
}

module.exports = authLogMiddleware;
