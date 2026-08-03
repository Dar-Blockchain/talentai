const notificationService = require('./notification.service');

exports.createSystemNotification = async (req, res) => {
  try {
    const { recipient, content } = req.body;
    const notification = await notificationService.createSystemNotification(recipient, content);
    res.status(201).json(notification);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const createNotificationByType = (type) => async (req, res) => {
  try {
    const notification = await notificationService.createNotification(req.user._id, req.body.content, type);
    res.status(201).json(notification);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.createInfoNotification    = createNotificationByType('info');
exports.createSuccessNotification = createNotificationByType('success');
exports.createWarningNotification = createNotificationByType('warning');
exports.createErrorNotification   = createNotificationByType('error');
exports.createCustomNotification  = createNotificationByType('custom');

exports.listForUser = async (req, res) => {
  try {
    const userId = req.user._id;
    if (!userId) return res.status(400).json({ error: 'User ID is required' });
    await notificationService.autoArchiveOldNotifications(userId, 15);
    const nonArchivedList = await notificationService.getNonArchivedNotifications(userId);
    const archivedList    = await notificationService.getArchivedNotifications(userId);
    const unreadCount     = await notificationService.getUnreadCount(userId);
    res.json({
      nonArchived: { count: nonArchivedList.length, notifications: nonArchivedList },
      archived:    { count: archivedList.length,    notifications: archivedList },
      unreadCount,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const notification = await notificationService.getNotificationById(req.params.id, req.user?._id, req.user?.role);
    res.json(notification);
  } catch (err) {
    res.status(err.message === 'Access denied.' ? 403 : 404).json({ error: err.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notification = await notificationService.markNotificationAsRead(req.params.id, req.user?._id);
    res.json({ message: 'Marked as read.', notification });
  } catch (err) {
    res.status(err.message === 'Access denied.' ? 403 : 404).json({ error: err.message });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    if (!userId) return res.status(400).json({ error: 'userId is required' });
    const result = await notificationService.markAllAsRead(userId);
    res.json({ message: 'All notifications marked as read.', result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const notification = await notificationService.deleteNotification(req.params.id, req.user?._id, req.user?.role);
    res.json({ message: 'Notification deleted.', notification });
  } catch (err) {
    res.status(err.message === 'Access denied.' ? 403 : 404).json({ error: err.message });
  }
};

exports.archiveNotification = async (req, res) => {
  try {
    const notification = await notificationService.archiveNotification(req.params.id, req.user?._id, req.user?.role);
    res.json({ message: 'Notification archived.', notification });
  } catch (err) {
    res.status(err.message === 'Access denied.' ? 403 : 404).json({ error: err.message });
  }
};

exports.archiveAllNotifications = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(400).json({ error: 'User ID is required' });
    const result = await notificationService.archiveAllNotifications(userId);
    res.json({ message: 'All notifications archived.', archivedCount: result.archivedCount });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteAllNotifications = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(400).json({ error: 'User ID is required' });
    const result = await notificationService.deleteAllNotifications(userId);
    res.json({ message: 'All active notifications deleted.', deletedCount: result.deletedCount });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteAllArchivedNotifications = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(400).json({ error: 'User ID is required' });
    const result = await notificationService.deleteAllArchivedNotifications(userId);
    res.json({ message: 'All archived notifications deleted.', deletedCount: result.deletedCount });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.broadcastSystemNotification = async (req, res) => {
  try {
    const { content, recipientIds } = req.body;
    if (!content) return res.status(400).json({ error: 'Content is required' });
    const result = await notificationService.broadcastSystemNotification(content, recipientIds);
    res.status(201).json({ message: 'Notification broadcasted to all users.', result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
