/**
 * Middleware Configuration
 * Centralized middleware setup
 */

const express = require("express");
const cors = require("cors");
const path = require("path");
const logger = require("morgan");
const cookieParser = require("cookie-parser");

/**
 * Register all middlewares on the Express app
 * @param {Express} app - Express application instance
 */
function registerMiddlewares(app) {
  // JSON & URL-encoded body parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // CORS Configuration with preflight support
  app.use(
    cors({
      origin: [
        "https://staging.talentai.bid",
        "https://backend.staging.talentai.bid",
        "http://localhost:3000",
        "http://localhost:5173",
      ],
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: [
        "Origin",
        "X-Requested-With",
        "Content-Type",
        "Accept",
        "Authorization",
      ],
      credentials: true,
      preflightContinue: false,
      optionsSuccessStatus: 204,
    }),
  );

  // Enable pre-flight for all routes
  app.options("*", cors());

  // Static files
  app.use(express.static(path.join(__dirname, "../public")));

  // Request logging
  app.use(logger("dev"));

  // Cookie parsing
  app.use(cookieParser());
}

module.exports = {
  registerMiddlewares,
};
