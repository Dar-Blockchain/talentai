const mongoose = require("mongoose");
const dbMonitor = require("../utils/database-monitor.service");

// Track reconnect state so we don't flood Atlas with parallel attempts
let isReconnecting = false;

const MONGO_OPTIONS = {
  maxPoolSize: 10,
  minPoolSize: 2,

  // Give Atlas up to 30s to wake from a paused/cold state
  serverSelectionTimeoutMS: 30000,
  connectTimeoutMS: 30000,
  socketTimeoutMS: 60000,

  // Heartbeat: check server health every 5s so we detect drops quickly
  heartbeatFrequencyMS: 5000,

  // Buffer commands while connecting/reconnecting so in-flight requests
  // don't throw "Client must be connected before running operations"
  bufferCommands: true,

  // Keep idle connections alive — removing maxIdleTimeMS prevents the pool
  // from draining to zero, which is the root cause of the error in production
};

async function attemptReconnect(uri) {
  if (isReconnecting) return;
  isReconnecting = true;

  const delays = [2000, 5000, 10000, 20000, 30000]; // back-off ladder
  for (let i = 0; i < delays.length; i++) {
    try {
      await new Promise((r) => setTimeout(r, delays[i]));
      console.log(`🔄 MongoDB reconnect attempt ${i + 1}/${delays.length}…`);
      await mongoose.connect(uri, MONGO_OPTIONS);
      console.log("✅ MongoDB reconnected successfully");
      isReconnecting = false;
      return;
    } catch (err) {
      console.error(`❌ Reconnect attempt ${i + 1} failed: ${err.message}`);
    }
  }

  // All retries exhausted — log and let the process manager (PM2 / Docker)
  // restart the server; don't call process.exit() here so existing
  // connections can drain cleanly.
  console.error("💀 MongoDB reconnect exhausted after all retries — process will exit");
  isReconnecting = false;
  process.exit(1);
}

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    console.error("❌ MONGODB_URI environment variable is required");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, MONGO_OPTIONS);
    console.log("✅ MongoDB Connected");

    // ── Connection event listeners ──────────────────────────────────────

    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err.message);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️ MongoDB disconnected — scheduling reconnect…");
      attemptReconnect(process.env.MONGODB_URI);
    });

    mongoose.connection.on("reconnected", () => {
      console.log("🔄 MongoDB reconnected");
      isReconnecting = false;
    });

    mongoose.connection.on("connected", () => {
      console.log("✅ MongoDB connection ready");
    });

    // ── Performance monitoring (dev only) ──────────────────────────────
    setTimeout(() => {
      if (process.env.NODE_ENV === "development") {
        dbMonitor.enableQueryLogging();
      }
      dbMonitor.monitorConnectionPool();
      setInterval(() => dbMonitor.logPerformanceSummary(), 300_000);
    }, 5000);

  } catch (error) {
    console.error(`❌ Database connection failed: ${error.message}`);
    console.error("Connection details:", {
      uri: process.env.MONGODB_URI ? "URI provided" : "URI missing",
      error: error.name,
    });
    process.exit(1);
  }
};

/**
 * Express middleware — returns 503 if the DB is not yet ready.
 * Mount this early in the middleware chain (before routes) in app.js.
 *
 * Usage in app.js:
 *   const { dbReadyMiddleware } = require('./config/mongo.connection');
 *   app.use(dbReadyMiddleware);
 */
const dbReadyMiddleware = (req, res, next) => {
  // readyState 1 = connected; 2 = connecting (bufferCommands keeps it safe)
  if (mongoose.connection.readyState === 0 || mongoose.connection.readyState === 3) {
    return res.status(503).json({
      error: "Service temporarily unavailable",
      detail: "Database connection is not ready — please retry in a moment",
    });
  }
  next();
};

module.exports = connectDB;
module.exports.dbReadyMiddleware = dbReadyMiddleware;
