const express = require("express");
const path = require("path");
const http = require("http");
const fs = require("fs");
require("dotenv").config();

// Ensure upload directories exist and are writable at startup
["uploads/resumes", "uploads/images", "uploads/temp"].forEach((dir) => {
  const abs = path.join(__dirname, dir);
  fs.mkdirSync(abs, { recursive: true });
  fs.chmodSync(abs, 0o775);
});

const app = express();
// Disable ETag so live endpoints (chat, etc.) never return 304 — 304 strips the
// body and can surface as a CORS error when the client expects JSON.
app.set("etag", false);
const server = http.createServer(app);

const logger = require("./utils/logger");
const { errorHandler, notFoundHandler } = require("./middleware/global-error.middleware");
const { registerMiddlewares } = require("./config/register-middlewares");
const { registerRoutes } = require("./config/register-routes");
const { initializeSocketServer, registerAllNamespaces } = require("./socket/socket-server");
const connectDB = require("./database/mongo.connection");
const { dbReadyMiddleware } = connectDB;
const socket = require("./socket/io");
const { seedPlans } = require("./seeders/plans.seeder");
const { initializeCronJobs } = require("./cron");

// Suppress noisy punycode deprecation warnings
process.on("warning", (warning) => {
  if (warning.name === "DeprecationWarning" && /punycode/.test(warning.stack || warning.message)) return;
  console.warn(warning.name + ": " + warning.message);
});

// Initialize Socket.IO before DB connects so namespaces are ready
const io = socket.init(server);
initializeSocketServer(io);

const initializeApp = async () => {
  logger.info("Starting TalentAI Backend...");

  try {
    await connectDB();

    await seedPlans();

    initializeCronJobs();

    registerMiddlewares(app);
    app.use(dbReadyMiddleware);
    registerRoutes(app);
    app.use(notFoundHandler);
    app.use(errorHandler);

    const host = process.env.HOST || "0.0.0.0";
    const port = process.env.PORT || 5000;

    server.listen(port, host, () => {
      logger.success(`Server running on http://localhost:${port}`);
      logger.info(`API docs: http://localhost:${port}/api/docs`);

      registerAllNamespaces(io);
    });
  } catch (error) {
    logger.error("Failed to initialize application: " + error.message);
    process.exit(1);
  }
};

initializeApp();

module.exports = app;