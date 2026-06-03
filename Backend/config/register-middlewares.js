const express     = require("express");
const cors        = require("cors");
const path        = require("path");
const morgan      = require("morgan");
const cookieParser = require("cookie-parser");
const helmet      = require("helmet");
const rateLimit   = require("express-rate-limit");

// ─── Auth endpoint rate limiter ───────────────────────────────────────────────
// 20 requests per 15 minutes per IP — stops brute-force at the HTTP layer
// before any application logic runs.
const authLimiter = rateLimit({
  windowMs:         15 * 60 * 1000,
  max:              20,
  standardHeaders:  true,   // Return rate limit info in RateLimit-* headers
  legacyHeaders:    false,
  message:          { success: false, message: "Too many requests. Please try again later." },
  skipSuccessfulRequests: false,
});

function registerMiddlewares(app) {
  // ── Security headers (B-19) ─────────────────────────────────────────────────
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // allow static assets cross-origin
  }));

  // ── IP-level rate limiting on auth routes (B-20) ────────────────────────────
  app.use("/auth", authLimiter);

  // ── Body parsing ────────────────────────────────────────────────────────────
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // ── CORS ────────────────────────────────────────────────────────────────────
  app.use(
    cors({
      origin: [
        "https://staging.talentai.bid",
        "https://backend.staging.talentai.bid",
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5173",
        "https://app.talentai.bid",
      ],
      methods:      ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: [
        "Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization",
        "Cache-Control", "Pragma", "Expires",
      ],
      credentials:          true,
      preflightContinue:    false,
      optionsSuccessStatus: 204,
    }),
  );

  // ── Static files ────────────────────────────────────────────────────────────
  app.use(express.static(path.join(__dirname, "../public")));

  // ── Request logging (dev only) ───────────────────────────────────────────────
  if (process.env.NODE_ENV !== "production") {
    app.use(morgan("dev"));
  }

  // ── Cookie parsing ──────────────────────────────────────────────────────────
  app.use(cookieParser());
}

module.exports = { registerMiddlewares };
