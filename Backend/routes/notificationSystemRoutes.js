const express = require('express');
const router = express.Router();
const controller = require('../controllers/notificationSystemController');
const { requireAuthUser } = require('../middleware/authMiddleware');
const authLogMiddleware = require("../middleware/SystemeLogs/LogMiddleware");

// All routes require an authenticated user
router.use(requireAuthUser, authLogMiddleware('NotificationSystem'));

// POST /notification-system/ — create a system notification
router.post('/', controller.createSystemNotification);

// GET /notification-system/ — list system notifications for current user
router.get('/', controller.listForUser);

// GET /notification-system/:id — retrieve a notification
router.get('/:id', controller.getById);

// PATCH /notification-system/:id/read — mark as read
router.patch('/:id/read', controller.markAsRead);

// DELETE /notification-system/:id — delete
router.delete('/:id', controller.deleteNotification);

module.exports = router;
