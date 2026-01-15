const express = require('express');
const router = express.Router();
const controller = require('../controllers/notificationSystemController');
const { requireAuthUser } = require('../middleware/authMiddleware');
const authLogMiddleware = require("../middleware/SystemeLogs/LogMiddleware");
const resolveCompanyActor = require("../middleware/resolveCompanyActor");

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
router.get('/GetMyNotification', resolveCompanyActor,controller.listForUser);

// GET /notification-system/:id — retrieve a notification
// router.get('/GetNotificationByID/:id', controller.getById);

// PATCH /notification-system/:id/read — mark as read
router.patch('/markAsRead/:id/read', resolveCompanyActor,controller.markAsRead);

// PATCH /notification-system/mark-all-read — mark all as read for user
router.patch('/mark-all-read', resolveCompanyActor,controller.markAllAsRead);

// PATCH /notification-system/archiveNotification/:id — archive a notification
router.patch('/archiveNotification/:id', resolveCompanyActor,controller.archiveNotification);

// PATCH /notification-system/archive-all — archive all notifications for current user
router.patch('/archive-all',resolveCompanyActor, controller.archiveAllNotifications);

// DELETE /notification-system/:id — delete
router.delete('/deleteNotification/:id',resolveCompanyActor, controller.deleteNotification);

module.exports = router;
