const express = require('express');
const path = require('path');
const http = require('http');
require('dotenv').config();

// Core setup
const app = express();
const server = http.createServer(app);

// Import configurations
const { registerMiddlewares } = require('./config/middleware');
const { registerRoutes } = require('./config/routes');
const socketHandlers = require('./socket-handlers');

// Import services
const connectDB = require('./config/database');
const socket = require('./socket');
const { initializeAgenda } = require('./services/Agent&AgendaServices/agendaService');
const intelligentInterviewService = require('./services/intelligentInterviewService');
const intelligentInterviewController = require('./controllers/intelligentInterviewController');

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

io.on('connection', (sock) => {
  console.log('👤 Utilisateur connecté à Socket.IO:', sock.id);
  socketHandlers.registerAllHandlers(sock);
});

/**
 * Application initialization sequence
 */
const initializeApp = async () => {
  console.log('🔄 Starting TalentAI Backend...');
  console.log('📦 Loading environment configuration...');

  try {
    // Step 1: Connect to database
    console.log('🔗 Connecting to database...');
    await connectDB();

    // Step 2: Initialize scheduler
    await initializeAgenda();

    // Step 3: Register middleware
    registerMiddlewares(app);

    // Step 4: Register routes
    registerRoutes(app);

    // Step 5: Initialize AI service
    console.log('🤖 Initializing intelligent interview service...');
    const serviceInitialized = await intelligentInterviewService.initialize();
    console.log(
      `${serviceInitialized ? '✅' : '⚠️ '} Interview service initialization ${
        serviceInitialized ? 'completed' : 'completed with warnings'
      }`
    );

    if (!serviceInitialized) {
      console.warn('⚠️  Interview features may be limited');
    }

    // Step 6: Start HTTP server
    console.log('⚡ Starting HTTP server...');
    const host = process.env.HOST || '0.0.0.0';
    const port = process.env.PORT || 5000;

    server.listen(port, host, () => {
      console.log('');
      console.log('🎉 TalentAI Backend successfully started!');
      console.log(`🚀 Server running on ${host}:${port}`);
      console.log(`🌐 Accessible from Windows at: http://172.23.207.114:${port}`);
      console.log(`🌐 Accessible from WSL at: http://localhost:${port}`);
      console.log('');

      // Step 7: Initialize WebSocket interview namespace
      console.log('🎙️  Initializing interview WebSocket namespace...');
      intelligentInterviewController.initializeHandlers(io);
      console.log('✅ Interview namespace /interview initialized and ready');
      console.log(`🔌 WebSocket endpoint: ws://172.23.207.114:${port}/socket.io/`);
      console.log('');

      console.log(`📖 API Documentation: http://localhost:${port}/api/docs`);
      console.log(`💡 Hedera clients will initialize on first use (lazy loading)`);
      console.log('');
    });
  } catch (error) {
    console.error('❌ Failed to initialize application:', error);
    process.exit(1);
  }
};

// Start application
initializeApp();

module.exports = app;
