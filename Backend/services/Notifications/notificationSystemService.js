const Notification = require('../../models/notificationModel');
const socket = require('../../socket');

/**
 * Notification System Service
 * Handles all business logic for system notifications
 */

class NotificationSystemService {
  /**
   * Create a system notification
   * @param {string} recipientId - User ID of the recipient
   * @param {string} content - Notification content
   * @param {string} url - Optional URL link
   * @returns {Promise<Object>} Created notification document
   */
  static async createSystemNotification(recipientId, content, url = null) {
    if (!recipientId || !content) {
      throw new Error('Recipient ID and content are required.');
    }

    const notification = await Notification.createSystem(recipientId, content, url);

    // Emit real-time notification via socket.io
    try {
      socket.getIO().to(recipientId).emit('notification', notification);
    } catch (error) {
      console.warn('Socket emit failed for system notification:', error.message || error);
    }

    return notification;
  }

  /**
   * Get all notifications for a user
   * @param {string} userId - User ID
   * @param {Object} options - Filter options (unread, limit, offset)
   * @returns {Promise<Array>} Array of notifications
   */
  static async getUserNotifications(userId, options = {}) {
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

  /**
   * Get a notification by ID with access control
   * @param {string} notificationId - Notification ID
   * @param {string} userId - User ID requesting the notification
   * @param {string} userRole - User role for admin override
   * @returns {Promise<Object>} Notification document
   */
  static async getNotificationById(notificationId, userId, userRole = null) {
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

  /**
   * Mark a notification as read
   * @param {string} notificationId - Notification ID
   * @param {string} userId - User ID requesting the action
   * @param {string} userRole - User role for admin override
   * @returns {Promise<Object>} Updated notification document
   */
  static async markNotificationAsRead(notificationId, userId, userRole = null) {
    const notification = await this.getNotificationById(notificationId, userId, userRole);
    notification.read = true;
    await notification.save();
    return notification;
  }

  /**
   * Mark all notifications as read for a user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Result with modified count
   */
  static async markAllAsRead(userId) {
    if (!userId) {
      throw new Error('User ID is required.');
    }

    const result = await Notification.updateMany(
      { recipient: userId, type: 'system', read: false },
      { read: true }
    );

    return { modifiedCount: result.modifiedCount };
  }

  /**
   * Delete a notification
   * @param {string} notificationId - Notification ID
   * @param {string} userId - User ID requesting the action
   * @param {string} userRole - User role for admin override
   * @returns {Promise<Object>} Deleted notification document
   */
  static async deleteNotification(notificationId, userId, userRole = null) {
    const notification = await this.getNotificationById(notificationId, userId, userRole);
    await notification.remove();
    return notification;
  }

  /**
   * Get unread notification count for a user
   * @param {string} userId - User ID
   * @returns {Promise<number>} Count of unread notifications
   */
  static async getUnreadCount(userId) {
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

  /**
   * Broadcast a system notification to multiple users
   * @param {Array<string>} recipientIds - Array of user IDs
   * @param {string} content - Notification content
   * @param {string} url - Optional URL link
   * @returns {Promise<Array>} Array of created notifications
   */
  static async broadcastSystemNotification(recipientIds, content, url = null) {
    if (!Array.isArray(recipientIds) || recipientIds.length === 0) {
      throw new Error('At least one recipient ID is required.');
    }
    if (!content) {
      throw new Error('Notification content is required.');
    }

    const notifications = [];
    for (const recipientId of recipientIds) {
      try {
        const notif = await this.createSystemNotification(recipientId, content, url);
        notifications.push(notif);
      } catch (error) {
        console.error(`Failed to create notification for user ${recipientId}:`, error.message);
      }
    }

    return notifications;
  }

  /**
   * Delete old notifications (e.g., older than 30 days)
   * @param {number} daysOld - Number of days to consider old
   * @returns {Promise<Object>} Result with deleted count
   */
  static async deleteOldNotifications(daysOld = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await Notification.deleteMany({
      type: 'system',
      createdAt: { $lt: cutoffDate },
    });

    return { deletedCount: result.deletedCount };
  }
}

module.exports = NotificationSystemService;
