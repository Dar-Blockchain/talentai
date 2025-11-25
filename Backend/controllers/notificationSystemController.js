const Notification = require('../models/notificationModel');
const socket = require('../socket');

// Créer une notification système
exports.createSystemNotification = async (req, res) => {
  try {
    const { recipient, content, url } = req.body;
    if (!recipient || !content) {
      return res.status(400).json({ message: 'Recipient et content requis.' });
    }
    const notification = await Notification.createSystem(recipient, content, url);
    // Emit via socket.io
    try {
      socket.getIO().to(recipient).emit('notification', notification);
    } catch (e) {
      // ne pas bloquer la réponse si l'émission échoue
      console.warn('Socket emit failed for system notification', e.message || e);
    }
    res.status(201).json(notification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lister les notifications système (optionnel: filtrer par non-lues)
exports.listForUser = async (req, res) => {
  try {
    const userId = req.user && req.user._id ? req.user._id : req.query.userId;
    if (!userId) return res.status(400).json({ message: 'userId requis.' });
    const filter = { recipient: userId, type: 'system' };
    if (req.query.unread === 'true') filter.read = false;
    const list = await Notification.find(filter).sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Récupérer une notification par id
exports.getById = async (req, res) => {
  try {
    const notif = await Notification.findById(req.params.id);
    if (!notif) return res.status(404).json({ message: 'Notification non trouvée.' });
    // Autoriser l'accès si destinataire ou admin (si role présent)
    const userId = req.user && req.user._id;
    if (notif.recipient.toString() !== String(userId) && !(req.user && req.user.role === 'admin')) {
      return res.status(403).json({ message: 'Accès refusé.' });
    }
    res.json(notif);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Marquer comme lue
exports.markAsRead = async (req, res) => {
  try {
    const notif = await Notification.findById(req.params.id);
    if (!notif) return res.status(404).json({ message: 'Notification non trouvée.' });
    const userId = req.user && req.user._id;
    if (notif.recipient.toString() !== String(userId) && !(req.user && req.user.role === 'admin')) {
      return res.status(403).json({ message: 'Accès refusé.' });
    }
    notif.read = true;
    await notif.save();
    res.json({ message: 'Marqué comme lu.', notification: notif });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Supprimer une notification
exports.deleteNotification = async (req, res) => {
  try {
    const notif = await Notification.findById(req.params.id);
    if (!notif) return res.status(404).json({ message: 'Notification non trouvée.' });
    const userId = req.user && req.user._id;
    if (notif.recipient.toString() !== String(userId) && !(req.user && req.user.role === 'admin')) {
      return res.status(403).json({ message: 'Accès refusé.' });
    }
    await notif.remove();
    res.json({ message: 'Notification supprimée.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
