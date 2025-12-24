const express = require('express');
const router = express.Router();
const controller = require('../controllers/Notifications/notificationSystemController');
const { requireAuthUser } = require('../middleware/authMiddleware');
const authLogMiddleware = require("../middleware/SystemeLogs/LogMiddleware");

// All routes require an authenticated user
router.use(requireAuthUser, authLogMiddleware('NotificationSystem'));

// POST /notification-system/AddNotification — create a system notification
router.post('/AddNotification', controller.createSystemNotification);

// GET /notification-system/GetMyNotification — list system notifications for current user
router.get('/GetMyNotification', controller.listForUser);

// GET /notification-system/:id — retrieve a notification
// router.get('/GetNotificationByID/:id', controller.getById);

// PATCH /notification-system/:id/read — mark as read
router.patch('/markAsRead/:id/read', controller.markAsRead);

// PATCH /notification-system/mark-all-read — mark all as read for user
router.patch('/mark-all-read', controller.markAllAsRead);

// PATCH /notification-system/archiveNotification/:id — archive a notification
router.patch('/archiveNotification/:id', controller.archiveNotification);

// DELETE /notification-system/:id — delete
router.delete('/deleteNotification/:id', controller.deleteNotification);

module.exports = router;
