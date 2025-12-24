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

// List system notifications (optional: filter by unread)
exports.listForUser = async (req, res) => {
  try {
    const userId = req.user && req.user._id ? req.user._id : req.query.userId;
    const options = {
      unread: req.query.unread === 'true',
      limit: req.query.limit,
      offset: req.query.offset,
    };
    const list = await notificationSystemService.getUserNotifications(userId, options);
    res.json(list);
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
    const userRole = req.user && req.user.role;
    const notification = await notificationSystemService.markNotificationAsRead(req.params.id, userId, userRole);
    res.json({ message: 'Marked as read.', notification });
  } catch (err) {
    const statusCode = err.message === 'Access denied.' ? 403 : 404;
    res.status(statusCode).json({ error: err.message });
  }
};

// Mark all notifications as read for a user
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user && req.user._id ? req.user._id : req.query.userId;
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
