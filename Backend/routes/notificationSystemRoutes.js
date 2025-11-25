const express = require('express');
const router = express.Router();
const controller = require('../controllers/notificationSystemController');
const { requireAuthUser } = require('../middleware/authMiddleware');
const authLogMiddleware = require("../middleware/SystemeLogs/LogMiddleware");

// Toutes les routes nécessitent un utilisateur authentifié
router.use(requireAuthUser, authLogMiddleware('NotificationSystem'));

// POST /notification-system/ — créer une notification système
router.post('/', controller.createSystemNotification);

// GET /notification-system/ — lister les notifications système du user courant
router.get('/', controller.listForUser);

// GET /notification-system/:id — récupérer une notification
router.get('/:id', controller.getById);

// PATCH /notification-system/:id/read — marquer comme lue
router.patch('/:id/read', controller.markAsRead);

// DELETE /notification-system/:id — supprimer
router.delete('/:id', controller.deleteNotification);

module.exports = router;
