/**
 * Socket.IO Event Handlers for Notifications
 * Centralized handlers for notification-related Socket.IO events
 */

const notificationService = require('../services/notificationSystemService');

/**
 * Register notification event handlers
 * @param {Socket} socket - Socket.IO socket instance
 */
function registerNotificationHandlers(socket) {
  // Handle single notification creation
  socket.on('sendSystemNotification', async (data) => {
    try {
      const { recipient, content } = data || {};

      if (!recipient || !content) {
        socket.emit('notificationError', { error: 'recipient and content are required' });
        return;
      }

      const notification = await notificationService.createSystemNotification(recipient, content);
      // Acknowledge to sender
      socket.emit('notificationCreated', notification);
    } catch (err) {
      console.error('Failed to create system notification via socket:', err.message || err);
      socket.emit('notificationError', { error: err.message || 'Unknown error' });
    }
  });

  // Handle broadcast to multiple recipients
  socket.on('broadcastSystemNotification', async (data) => {
    try {
      const { recipients, content } = data || {};

      if (!recipients || !Array.isArray(recipients) || recipients.length === 0 || !content) {
        socket.emit('notificationError', { error: 'recipients (array) and content are required' });
        return;
      }

      const results = await notificationService.broadcastSystemNotification(recipients, content);
      socket.emit('broadcastCreated', { created: results.length });
    } catch (err) {
      console.error('Failed to broadcast system notifications via socket:', err.message || err);
      socket.emit('notificationError', { error: err.message || 'Unknown error' });
    }
  });
}

module.exports = {
  registerNotificationHandlers,
};
