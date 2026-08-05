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

  // ── CORS must come before rate limiting so preflight OPTIONS requests
  //    receive proper CORS headers even when the rate limit is exceeded.
  const corsOrigins = [
    process.env.BASE_URL,
    "https://test-1-yw74.onrender.com",
  ];
  if (process.env.BASE_URL && !corsOrigins.includes(process.env.BASE_URL)) {
    corsOrigins.push(process.env.BASE_URL);
  }
  app.use(
    cors({
      origin: corsOrigins,
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

  // ── IP-level rate limiting on auth routes (B-20) ────────────────────────────
  app.use("/auth", authLimiter);

  // ── Body parsing ────────────────────────────────────────────────────────────
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // ── Static files ────────────────────────────────────────────────────────────
  app.use("/uploads/images", express.static(path.join(__dirname, "../uploads/images")));

  // ── Request logging (dev only) ───────────────────────────────────────────────
  if (process.env.NODE_ENV !== "production") {
    app.use(morgan("dev"));
  }

  // ── Cookie parsing ──────────────────────────────────────────────────────────
  app.use(cookieParser());
}

module.exports = { registerMiddlewares };
