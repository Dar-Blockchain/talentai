/**
 * Socket.IO Server Setup
 * Centralizes Socket.IO initialization and connection handling
 */

const { registerAllHandlers, registerAllNamespaces } = require('./index');
const logger = require('../utils/logger');

function initializeSocketServer(io) {
  io.on('connection', (sock) => {
    registerAllHandlers(sock);
    sock.on('disconnect', () => {} );
  });
}

module.exports = { initializeSocketServer, registerAllNamespaces };
