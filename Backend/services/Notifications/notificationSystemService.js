const Notification = require('../../models/notificationModel');
const socket = require('../../socket');

/**
 * Notification System Service (functional API)
 * Exports functions that mirror the previous static class methods.
 */

async function createSystemNotification(recipientId, content) {
  /**
   * Create a system notification
   * @param {string} recipientId - User ID of the recipient
   * @param {string} content - Notification content
   * @returns {Promise<Object>} Created notification document
   */
  if (!recipientId || !content) {
    throw new Error('Recipient ID and content are required.');
  }

  const notification = await Notification.createSystem(recipientId, content);

  try {
    const io = socket.getIO();
    const roomName = String(recipientId);
    const notificationData = notification.toObject ? notification.toObject() : notification;

    io.to(roomName).emit('notification', notificationData);
  } catch (error) {
    console.error('Socket emit failed for system notification:', error.message || error);
  }

  return notification;
}

async function createNotification(recipientId, content, type = 'info') {
  /**
   * Create a notification with a specific type
   * @param {string} recipientId - User ID of the recipient
   * @param {string} content - Notification content
   * @param {string} type - Type of notification (info, success, warning, error, custom, system)
   * @returns {Promise<Object>} Created notification document
   */
  if (!recipientId || !content) {
    throw new Error('Recipient ID and content are required.');
  }

  const notification = new Notification({
    recipient: recipientId,
    content,
    type,
    read: false,
  });

  await notification.save();

  try {
    const io = socket.getIO();
    const roomName = String(recipientId);
    const notificationData = notification.toObject ? notification.toObject() : notification;

    io.to(roomName).emit('notification', notificationData);
  } catch (error) {
    console.error('Socket emit failed for notification:', error.message || error);
  }

  return notification;
}

  return notification;
}

async function getUserNotifications(userId, options = {}) {
  if (!userId) {
    throw new Error('User ID is required.');
  }

  const filter = { recipient: userId, type: 'system' };
  if (options.unread === true) {
    filter.read = false;
  }

  const query = Notification.find(filter).sort({ createdAt: -1 });

  if (options.limit) {
    query.limit(parseInt(options.limit, 10));
  }
  if (options.offset) {
    query.skip(parseInt(options.offset, 10));
  }

  return query.exec();
}

async function getNotificationById(notificationId, userId, userRole = null) {
  if (!notificationId) {
    throw new Error('Notification ID is required.');
  }

  const notification = await Notification.findById(notificationId);
  if (!notification) {
    throw new Error('Notification not found.');
  }

  // Check access: owner or admin
  const isOwner = notification.recipient.toString() === String(userId);
  const isAdmin = userRole === 'admin';

  if (!isOwner && !isAdmin) {
    throw new Error('Access denied.');
  }

  return notification;
}

async function markNotificationAsRead(notificationId, userId) {
  const notification = await getNotificationById(notificationId, userId);
  notification.read = true;
  await notification.save();
  // Emit update to recipient via Socket.IO
  try {
    const io = socket.getIO();
    io.to(String(notification.recipient)).emit('notificationRead', { id: notification._id, notification });
    // Also emit updated unread count
    const unread = await getUnreadCount(notification.recipient);
    io.to(String(notification.recipient)).emit('unreadCountUpdated', { unreadCount: unread });
  } catch (err) {
    console.warn('Socket emit failed on markNotificationAsRead:', err.message || err);
  }

  return notification;
}

async function markAllAsRead(userId) {
  if (!userId) {
    throw new Error('User ID is required.');
  }

  const result = await Notification.updateMany(
    { recipient: userId, type: 'system', read: false },
    { read: true }
  );

  // Emit to the user's room that all notifications were marked as read
  try {
    const io = socket.getIO();
    io.to(String(userId)).emit('notificationsMarkedRead', { modifiedCount: result.modifiedCount });
    const unread = await getUnreadCount(userId);
    io.to(String(userId)).emit('unreadCountUpdated', { unreadCount: unread });
  } catch (err) {
    console.warn('Socket emit failed on markAllAsRead:', err.message || err);
  }

  return { modifiedCount: result.modifiedCount };
}

async function deleteNotification(notificationId, userId, userRole = null) {
  const notification = await getNotificationById(notificationId, userId, userRole);
  await notification.remove();
  // Emit deletion event
  try {
    const io = socket.getIO();
    io.to(String(notification.recipient)).emit('notificationDeleted', { id: notification._id });
    const unread = await getUnreadCount(notification.recipient);
    io.to(String(notification.recipient)).emit('unreadCountUpdated', { unreadCount: unread });
  } catch (err) {
    console.warn('Socket emit failed on deleteNotification:', err.message || err);
  }

  return notification;
}

async function getUnreadCount(userId) {
  if (!userId) {
    throw new Error('User ID is required.');
  }

  const count = await Notification.countDocuments({
    recipient: userId,
    type: 'system',
    read: false,
  });

  return count;
}

async function broadcastSystemNotification(recipientIds, content) {
  if (!Array.isArray(recipientIds) || recipientIds.length === 0) {
    throw new Error('At least one recipient ID is required.');
  }
  if (!content) {
    throw new Error('Notification content is required.');
  }

  const notifications = [];
  for (const recipientId of recipientIds) {
    try {
      const notif = await createSystemNotification(recipientId, content);
      notifications.push(notif);
    } catch (error) {
      console.error(`Failed to create notification for user ${recipientId}:`, error.message);
    }
  }

  return notifications;
}

  async function archiveNotification(notificationId, userId, userRole = null) {
    const notification = await getNotificationById(notificationId, userId, userRole);
    notification.archived = true;
    await notification.save();

    try {
      const io = socket.getIO();
      io.to(String(notification.recipient)).emit('notificationArchived', { id: notification._id, notification });
    } catch (err) {
      console.warn('Socket emit failed on archiveNotification:', err.message || err);
    }

    return notification;
  }

async function deleteOldNotifications(daysOld = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const result = await Notification.deleteMany({
    type: 'system',
    createdAt: { $lt: cutoffDate },
  });

  return { deletedCount: result.deletedCount };
}

module.exports = {
  createSystemNotification,
  createNotification,
  getUserNotifications,
  getNotificationById,
  markNotificationAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
  broadcastSystemNotification,
  archiveNotification,
  deleteOldNotifications,
};
