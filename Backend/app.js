const express = require('express');
const path = require('path');
const http = require('http');
require('dotenv').config();

// Core setup
const app = express();
const server = http.createServer(app);

// Import utilities & logger
const logger = require('./utils/logger');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Import configurations
const { registerMiddlewares } = require('./config/middleware');
const { registerRoutes } = require('./config/routes');
const { initializeSocketServer } = require('./socket-handlers/socketServer');

// Import services
const connectDB = require('./config/database');
const socket = require('./socket');
const { initializeAgenda } = require('./services/Agent&AgendaServices/agenda.service');
const intelligentInterviewService = require('./services/intelligentInterview.service');
const intelligentInterviewController = require('./controllers/intelligentInterviewController');
const chatSocketHandler = require('./controllers/ChatControllers/chatSocketHandler');
//const backupService = require('./services/backupService');
//const { scheduleDailyBackup } = require('./cron/dailyBackup');

// Auto-load CRON jobs
require('./cron/resetQuota');
require('./cron/DailyExchangeRateUpdate');

/**
 * Suppress deprecation warnings for punycode module
 */
process.on('warning', (warning) => {
  try {
    if (warning.name === 'DeprecationWarning' && /punycode/.test(warning.stack || warning.message)) {
      return;
    }
  } catch (e) {
    // Fallback to default logging
  }
  console.warn(warning.name + ': ' + warning.message);
});

// Initialize Socket.IO
const io = socket.init(server);
initializeSocketServer(io);

/**
 * Application initialization sequence
 */
const initializeApp = async () => {
  logger.info('🔄 Starting TalentAI Backend...');
  logger.info('📦 Loading environment configuration...');

  try {
    // Step 1: Connect to database
    logger.section('Connecting to database...');
    await connectDB();

    // Step 2: Initialize scheduler
    await initializeAgenda();

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
    logger.section('Initializing intelligent interview service...');
    const serviceInitialized = await intelligentInterviewService.initialize();
    
    if (serviceInitialized) {
      logger.success('Interview service initialization completed');
    } else {
      logger.warn('Interview service initialization completed with warnings - Interview features may be limited');
    }

    // Step 6.5: Initialize backup service
    // logger.section('Initializing database backup service...');
    // await backupService.initializeDailyBackup();
    // logger.success('Database backup service initialized');

    // Step 7: Start HTTP server
    logger.section('Starting HTTP server...');
    const host = process.env.HOST || '0.0.0.0';
    const port = process.env.PORT || 5000;

    server.listen(port, host, () => {
      logger.header('TalentAI Backend successfully started!');
      logger.success(`Server running on ${host}:${port}`);
      logger.info(`Accessible from Windows at: http://172.23.207.114:${port}`);
      logger.info(`Accessible from WSL at: http://localhost:${port}`);
      logger.info(`API Documentation: http://localhost:${port}/api/docs`);
      logger.info(`WebSocket endpoint: ws://172.23.207.114:${port}/socket.io/`);

      // Step 8: Initialize WebSocket namespaces
      logger.section('Initializing WebSocket namespaces...');

      // Initialize chat namespace
      chatSocketHandler.initializeChatNamespace(io);
      logger.success('Chat namespace /chat initialized and ready');

      // Initialize interview namespace
      intelligentInterviewController.initializeHandlers(io);
      logger.success('Interview namespace /interview initialized and ready');
      logger.info('💡 Hedera clients will initialize on first use (lazy loading)');
    });
  } catch (error) {
    logger.error('Failed to initialize application', error.message);
    process.exit(1);
  }
};

// Start application
initializeApp();

module.exports = app;
