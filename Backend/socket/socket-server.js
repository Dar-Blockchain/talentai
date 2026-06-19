/**
 * Socket.IO Server Setup
 * Centralizes Socket.IO initialization and connection handling
 */

const { registerAllHandlers, registerAllNamespaces } = require('./index');
const logger = require('../utils/logger');

function initializeSocketServer(io) {
  io.on('connection', (sock) => {
    logger.info(`Socket connected: ${sock.id}`);
    registerAllHandlers(sock);
    sock.on('disconnect', () => logger.info(`Socket disconnected: ${sock.id}`));
  });
}

module.exports = { initializeSocketServer, registerAllNamespaces };
