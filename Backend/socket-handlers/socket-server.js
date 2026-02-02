/**
 * Socket.IO Server Setup
 * Centralizes Socket.IO initialization and connection handling
 */

const socketHandlers = require('./index');
const logger = require('../utils/logger');

/**
 * Initialize Socket.IO with handlers
 * @param {SocketIO.Server} io - Socket.IO instance
 * @returns {SocketIO.Server} - Configured Socket.IO instance
 */
function initializeSocketServer(io) {
  io.on('connection', (sock) => {
    logger.info(`Socket connected: ${sock.id}`);
    
    // Register all event handlers for this socket
    socketHandlers.registerAllHandlers(sock);

    sock.on('disconnect', () => {
      logger.info(`Socket disconnected: ${sock.id}`);
    });
  });

  logger.success('Socket.IO server initialized');
  return io;
}

module.exports = {
  initializeSocketServer,
};
