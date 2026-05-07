const express = require("express");
const path = require("path");
const http = require("http");
require("dotenv").config();

// Core setup
const app = express();
const server = http.createServer(app);

// Import utilities & logger
const logger = require("./utils/logger");
const {
  errorHandler,
  notFoundHandler,
} = require("./middleware/global-error.middleware");

// Import configurations
const { registerMiddlewares } = require("./config/register-middlewares");
const { registerRoutes } = require("./config/register-routes");
const { initializeSocketServer } = require("./socket-handlers/socket-server");

// Import services
const connectDB = require("./config/mongo.connection");
const socket = require("./socket");
//const { initializeAgenda } = require("./services/Agent&AgendaServices/agenda.service");
const intelligentInterviewService = require("./services/intelligentInterview.service");
const intelligentInterviewController = require("./controllers/intelligentInterview.controller");
const campaignInterviewService = require("./services/campaignInterview.service");
const campaignInterviewController = require("./controllers/campaignInterview.controller");
const chatSocketHandler = require("./socket-handlers/chatSocketHandler");
const { seedDefaultPlans } = require("./seeders/planLimits.seeder");
const { scheduleAutoInvites } = require("./cron/autoInviteScheduler.cron");
const { scheduleReminders } = require("./cron/reminderScheduler.cron");
const { scheduleCampaignReminders } = require("./cron/campaignReminderScheduler.cron");
//const backupService = require('./services/backupService');
//const { scheduleDailyBackup } = require('./cron/dailyBackup');

// Auto-load CRON jobs
// ⛔ DISABLED: All cron jobs disabled
const { initializeCronJobs } = require("./cron");
initializeCronJobs();

/**
 * Suppress deprecation warnings for punycode module
 */
process.on("warning", (warning) => {
  try {
    if (
      warning.name === "DeprecationWarning" &&
      /punycode/.test(warning.stack || warning.message)
    ) {
      return;
    }
  } catch (e) {
    // Fallback to default logging
  }
  console.warn(warning.name + ": " + warning.message);
});

// Initialize Socket.IO
const io = socket.init(server);
initializeSocketServer(io);


/**
 * Application initialization sequence
 */
const initializeApp = async () => {
  logger.info("🔄 Starting TalentAI Backend...");
  logger.info("📦 Loading environment configuration...");

  try {
    // Step 1: Connect to database
    logger.section("Connecting to database...");
    await connectDB();

    // Step 1.2: Deduplicate InterviewApplicant records (one-time fix)
    try {
      const InterviewApplicant = require('./models/InterviewApplicant.model');
      const dupes = await InterviewApplicant.aggregate([
        { $group: { _id: { jobId: '$jobId', email: '$email' }, ids: { $push: '$_id' }, count: { $sum: 1 } } },
        { $match: { count: { $gt: 1 } } },
      ]);
      for (const { ids } of dupes) {
        const [, ...toDelete] = ids; // keep oldest, delete the rest
        await InterviewApplicant.deleteMany({ _id: { $in: toDelete } });
      }
      if (dupes.length > 0) logger.success(`Removed ${dupes.reduce((s, d) => s + d.ids.length - 1, 0)} duplicate InterviewApplicant records`);
    } catch (e) {
      logger.warn('InterviewApplicant dedup failed: ' + e.message);
    }

    // Step 1.5: Seed PlanLimits only if DB has no plans yet
    try {
      const PlanLimits = require("./models/PlanLimits.model");
      const count = await PlanLimits.countDocuments();
      if (count === 0) {
        logger.section("No plans found — seeding default plans...");
        await seedDefaultPlans();
        logger.success("PlanLimits seeded");
      } else {
        logger.info(`Plans already exist (${count}) — skipping seed`);
      }
    } catch (e) {
      logger.warn("PlanLimits seed check failed: " + e.message);
    }

    // Step 2: Initialize scheduler
    //await initializeAgenda();

    // Step 2.5: Initialize daily backup scheduler
    // const agenda = require('agenda');
    // const mongoConnectionString = process.env.MONGODB_URI || 'mongodb://localhost:27017/talentai';
    // const agendaInstance = new agenda.Agenda({ mongo: { url: mongoConnectionString } });

    // await agendaInstance.start();
    // await scheduleDailyBackup(agendaInstance);
    // logger.success('Daily backup scheduler initialized');

    // Step 3: Register middleware
    registerMiddlewares(app);

    // Step 4: Register routes
    registerRoutes(app);

    // Step 5: Register error handlers (MUST be last)
    app.use(notFoundHandler);
    app.use(errorHandler);

    // Step 6: Initialize AI service
    logger.section("Initializing intelligent interview service...");
    const serviceInitialized = await intelligentInterviewService.initialize();

    if (serviceInitialized) {
      logger.success("Interview service initialization completed");
    } else {
      logger.warn(
        "Interview service initialization completed with warnings - Interview features may be limited",
      );
    }

    // Step 6.5: Initialize campaign interview service
    logger.section("Initializing campaign interview service...");
    await campaignInterviewService.initialize();
    logger.success("Campaign interview service initialization completed");

    // Step 6.6: Initialize backup service
    // logger.section('Initializing database backup service...');
    // await backupService.initializeDailyBackup();
    // logger.success('Database backup service initialized');

    // Step 7: Start HTTP server
    logger.section("Starting HTTP server...");
    const host = process.env.HOST || "0.0.0.0";
    const port = process.env.PORT || 5000;

    server.listen(port, host, () => {
      logger.header("TalentAI Backend successfully started!");
      logger.success(`Server running on ${host}:${port}`);
      logger.info(`Accessible from Windows at: http://172.23.207.114:${port}`);
      logger.info(`Accessible from WSL at: http://localhost:${port}`);
      logger.info(`API Documentation: http://localhost:${port}/api/docs`);
      logger.info(`WebSocket endpoint: ws://172.23.207.114:${port}/socket.io/`);

      // Step 8: Initialize WebSocket namespaces
      logger.section("Initializing WebSocket namespaces...");

      // Initialize chat namespace
      chatSocketHandler.initializeChatNamespace(io);
      logger.success("Chat namespace /chat initialized and ready");

      // Initialize interview namespace
      intelligentInterviewController.initializeHandlers(io);
      logger.success("Interview namespace /interview initialized and ready");

      // Initialize campaign interview namespace
      campaignInterviewController.initializeHandlers(io);
      logger.success("Campaign interview namespace /campaign-interview initialized and ready");
      logger.info(
        "💡 Hedera clients will initialize on first use (lazy loading)",
      );

      // Step 9: Initialize auto-invite scheduler for job applications
      logger.section("Initializing auto-invite scheduler...");
      scheduleAutoInvites();
      logger.success("Auto-invite scheduler initialized (checks hourly between 12:00 - 21:00)");

      // Step 10: Initialize interview reminder scheduler
      logger.section("Initializing interview reminder scheduler...");
      scheduleReminders();
      logger.success("Interview reminder scheduler initialized (24h + 48h reminders)");

      // Step 11: Initialize campaign deadline reminder scheduler
      logger.section("Initializing campaign reminder scheduler...");
      scheduleCampaignReminders();
      logger.success("Campaign reminder scheduler initialized (48h deadline reminders)");
    });
  } catch (error) {
    logger.error("Failed to initialize application", error.message);
    process.exit(1);
  }
};

// Start application
initializeApp();

module.exports = app;
