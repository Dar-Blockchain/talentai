const Notification = require('../models/notificationModel');
const { io } = require('../app');

// Créer une notification et l'envoyer en temps réel
exports.createNotification = async (req, res) => {
  try {
    const { content, type, url, recipient } = req.body;
    const notification = await Notification.create({ content, type, url, recipient });
    // Émettre la notification à la room du destinataire
    io.to(recipient).emit('notification', notification);
    res.status(201).json(notification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
