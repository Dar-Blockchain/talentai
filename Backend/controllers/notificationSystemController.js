const Notification = require('../models/notificationModel');
const socket = require('../socket');

// Create a system notification
exports.createSystemNotification = async (req, res) => {
  try {
    const { recipient, content, url } = req.body;
    if (!recipient || !content) {
      return res.status(400).json({ message: 'Recipient and content are required.' });
    }
    const notification = await Notification.createSystem(recipient, content, url);
    // Emit via socket.io
    try {
      socket.getIO().to(recipient).emit('notification', notification);
    } catch (e) {
      // Do not block the response if emit fails
      console.warn('Socket emit failed for system notification', e.message || e);
    }
    res.status(201).json(notification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// List system notifications (optional: filter by unread)
exports.listForUser = async (req, res) => {
  try {
    const userId = req.user && req.user._id ? req.user._id : req.query.userId;
    if (!userId) return res.status(400).json({ message: 'userId is required.' });
    const filter = { recipient: userId, type: 'system' };
    if (req.query.unread === 'true') filter.read = false;
    const list = await Notification.find(filter).sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Retrieve a notification by ID
exports.getById = async (req, res) => {
  try {
    const notif = await Notification.findById(req.params.id);
    if (!notif) return res.status(404).json({ message: 'Notification not found.' });
    // Allow access if recipient or admin (if role is present)
    const userId = req.user && req.user._id;
    if (notif.recipient.toString() !== String(userId) && !(req.user && req.user.role === 'admin')) {
      return res.status(403).json({ message: 'Access denied.' });
    }
    res.json(notif);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Mark as read
exports.markAsRead = async (req, res) => {
  try {
    const notif = await Notification.findById(req.params.id);
    if (!notif) return res.status(404).json({ message: 'Notification not found.' });
    const userId = req.user && req.user._id;
    if (notif.recipient.toString() !== String(userId) && !(req.user && req.user.role === 'admin')) {
      return res.status(403).json({ message: 'Access denied.' });
    }
    notif.read = true;
    await notif.save();
    res.json({ message: 'Marked as read.', notification: notif });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a notification
exports.deleteNotification = async (req, res) => {
  try {
    const notif = await Notification.findById(req.params.id);
    if (!notif) return res.status(404).json({ message: 'Notification not found.' });
    const userId = req.user && req.user._id;
    if (notif.recipient.toString() !== String(userId) && !(req.user && req.user.role === 'admin')) {
      return res.status(403).json({ message: 'Access denied.' });
    }
    await notif.remove();
    res.json({ message: 'Notification deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
