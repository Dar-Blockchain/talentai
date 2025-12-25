const notificationSystemService = require('../../services/Notifications/notificationSystemService');

// Create a system notification
exports.createSystemNotification = async (req, res) => {
  try {
    const { recipient, content } = req.body;
    const notification = await notificationSystemService.createSystemNotification(recipient, content);
    res.status(201).json(notification);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Generic create notification by type
const createNotificationByType = (type) => {
  return async (req, res) => {
    try {
      const { content } = req.body;
      const recipient = req.user._id;
      const notification = await notificationSystemService.createNotification(recipient, content, type);
      res.status(201).json(notification);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  };
};

// Create notifications for each type
exports.createInfoNotification = createNotificationByType('info');
exports.createSuccessNotification = createNotificationByType('success');
exports.createWarningNotification = createNotificationByType('warning');
exports.createErrorNotification = createNotificationByType('error');
exports.createCustomNotification = createNotificationByType('custom');

// List system notifications (optional: filter by unread)
exports.listForUser = async (req, res) => {
  try {
    const userId = req.user._id;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    const list = await notificationSystemService.getUserNotifications(userId);
    const unreadCount = await notificationSystemService.getUnreadCount(userId);
    res.json({ notifications: list, unreadCount });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Retrieve a notification by ID
exports.getById = async (req, res) => {
  try {
    const userId = req.user && req.user._id;
    const userRole = req.user && req.user.role;
    const notification = await notificationSystemService.getNotificationById(req.params.id, userId, userRole);
    res.json(notification);
  } catch (err) {
    const statusCode = err.message === 'Access denied.' ? 403 : 404;
    res.status(statusCode).json({ error: err.message });
  }
};

// Mark as read
exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user && req.user._id;
    const notification = await notificationSystemService.markNotificationAsRead(req.params.id, userId);
    res.json({ message: 'Marked as read.', notification });
  } catch (err) {
    const statusCode = err.message === 'Access denied.' ? 403 : 404;
    res.status(statusCode).json({ error: err.message });
  }
};

// Mark all notifications as read for a user
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log('markAllAsRead called with userId:', userId);
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    const result = await notificationSystemService.markAllAsRead(userId);
    res.json({ message: 'All notifications marked as read.', result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a notification
exports.deleteNotification = async (req, res) => {
  try {
    const userId = req.user && req.user._id;
    const userRole = req.user && req.user.role;
    const notification = await notificationSystemService.deleteNotification(req.params.id, userId, userRole);
    res.json({ message: 'Notification deleted.', notification });
  } catch (err) {
    const statusCode = err.message === 'Access denied.' ? 403 : 404;
    res.status(statusCode).json({ error: err.message });
  }
};

// Archive a notification
exports.archiveNotification = async (req, res) => {
  try {
    const userId = req.user && req.user._id;
    const userRole = req.user && req.user.role;
    const notification = await notificationSystemService.archiveNotification(req.params.id, userId, userRole);
    console.log('archiveNotification succeeded for id:', notification);
    res.json({ message: 'Notification archived.', notification });
  } catch (err) {
    const statusCode = err.message === 'Access denied.' ? 403 : 404;
    res.status(statusCode).json({ error: err.message });
  }
};

// Broadcast system notification to all users
exports.broadcastSystemNotification = async (req, res) => {
  try {
    const { content, recipientIds} = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }
    const result = await notificationSystemService.broadcastSystemNotification(content, recipientIds);
    res.status(201).json({ message: 'Notification broadcasted to all users.', result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
