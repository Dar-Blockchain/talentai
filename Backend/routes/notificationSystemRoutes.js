const express = require('express');
const router = express.Router();
const controller = require('../controllers/Notifications/notificationSystemController');
const { requireAuthUser } = require('../middleware/authMiddleware');
const authLogMiddleware = require("../middleware/SystemeLogs/LogMiddleware");

// All routes require an authenticated user
router.use(requireAuthUser, authLogMiddleware('NotificationSystem'));

// POST /notification-system/AddNotification — create a system notification
router.post('/AddNotification', controller.createSystemNotification);

// POST /notification-system/AddNotification/info — create info notification
router.post('/AddNotification/info', controller.createInfoNotification);

// POST /notification-system/AddNotification/success — create success notification
router.post('/AddNotification/success', controller.createSuccessNotification);

// POST /notification-system/AddNotification/warning — create warning notification
router.post('/AddNotification/warning', controller.createWarningNotification);

// POST /notification-system/AddNotification/error — create error notification
router.post('/AddNotification/error', controller.createErrorNotification);

// POST /notification-system/AddNotification/custom — create custom notification
router.post('/AddNotification/custom', controller.createCustomNotification);

// POST /notification-system/broadcastSystemNotification — broadcast notification to all users
router.post('/broadcastSystemNotification', controller.broadcastSystemNotification);

// GET /notification-system/GetMyNotification — list system notifications for current user
router.get('/GetMyNotification', controller.listForUser);

// GET /notification-system/GetArchivedNotifications — list archived notifications for current user
router.get('/GetArchivedNotifications', controller.getArchivedNotifications);

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
