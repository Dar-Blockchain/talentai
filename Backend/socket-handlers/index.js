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
    socket.join(userId);
    console.log(`✅ Utilisateur ${userId} a rejoint sa room`);
  });

  // Register all domain-specific handlers
  registerNotificationHandlers(socket);

  // Disconnect handler
  socket.on('disconnect', () => {
    console.log('🔌 Utilisateur déconnecté de Socket.IO:', socket.id);
  });
}

module.exports = {
  registerAllHandlers,
};
