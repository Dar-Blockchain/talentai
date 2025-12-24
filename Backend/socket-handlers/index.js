/**
 * Socket.IO Handlers Registry
 * Central entry point for all Socket.IO event handlers
 */

const { registerNotificationHandlers } = require('./notificationHandlers');

/**
 * Register all Socket.IO event handlers for a socket
 * @param {Socket} socket - Socket.IO socket instance
 */
function registerAllHandlers(socket) {
  // User join handler (common to all users)
  socket.on('join', (userId) => {
    const roomName = String(userId);
    socket.join(roomName);
  });

  // Register all domain-specific handlers
  registerNotificationHandlers(socket);

  // Disconnect handler
  socket.on('disconnect', () => {
    // Socket disconnected
  });
}

module.exports = {
  registerAllHandlers,
};
