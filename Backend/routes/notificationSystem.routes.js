const express = require('express');
const router = express.Router();
const controller = require('../controllers/notificationSystem.controller');
const { requireAuth } = require('../middleware/security/auth.middleware');
const authLogMiddleware = require("../middleware/security/request-log.middleware");
const resolveCompanyActor = require("../middleware/resolve-company-actor.middleware");

// All routes require an authenticated user
router.use(requireAuth, authLogMiddleware('NotificationSystem'));

/**
 * @openapi
 * /notification/AddNotification:
 *   post:
 *     tags: [Notifications]
 *     summary: Create a system notification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, message]
 *             properties:
 *               userId: { type: string }
 *               message: { type: string }
 *               type: { type: string }
 *     responses:
 *       201:
 *         description: Notification created
 */
router.post('/AddNotification', controller.createSystemNotification);

/**
 * @openapi
 * /notification/AddNotification/info:
 *   post:
 *     tags: [Notifications]
 *     summary: Create an info notification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, message]
 *             properties:
 *               userId: { type: string }
 *               message: { type: string }
 *     responses:
 *       201:
 *         description: Notification created
 */
router.post('/AddNotification/info', controller.createInfoNotification);

/**
 * @openapi
 * /notification/AddNotification/success:
 *   post:
 *     tags: [Notifications]
 *     summary: Create a success notification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, message]
 *             properties:
 *               userId: { type: string }
 *               message: { type: string }
 *     responses:
 *       201:
 *         description: Notification created
 */
router.post('/AddNotification/success', controller.createSuccessNotification);

/**
 * @openapi
 * /notification/AddNotification/warning:
 *   post:
 *     tags: [Notifications]
 *     summary: Create a warning notification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, message]
 *             properties:
 *               userId: { type: string }
 *               message: { type: string }
 *     responses:
 *       201:
 *         description: Notification created
 */
router.post('/AddNotification/warning', controller.createWarningNotification);

/**
 * @openapi
 * /notification/AddNotification/error:
 *   post:
 *     tags: [Notifications]
 *     summary: Create an error notification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, message]
 *             properties:
 *               userId: { type: string }
 *               message: { type: string }
 *     responses:
 *       201:
 *         description: Notification created
 */
router.post('/AddNotification/error', controller.createErrorNotification);

/**
 * @openapi
 * /notification/AddNotification/custom:
 *   post:
 *     tags: [Notifications]
 *     summary: Create a custom notification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Notification created
 */
router.post('/AddNotification/custom', controller.createCustomNotification);

/**
 * @openapi
 * /notification/broadcastSystemNotification:
 *   post:
 *     tags: [Notifications]
 *     summary: Broadcast a notification to all users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [message]
 *             properties:
 *               message: { type: string }
 *               type: { type: string }
 *     responses:
 *       200:
 *         description: Broadcast sent
 */
router.post('/broadcastSystemNotification', controller.broadcastSystemNotification);

/**
 * @openapi
 * /notification/GetMyNotification:
 *   get:
 *     tags: [Notifications]
 *     summary: Get all notifications for the current user
 *     responses:
 *       200:
 *         description: List of notifications
 */
router.get('/GetMyNotification', resolveCompanyActor,controller.listForUser);

/**
 * @openapi
 * /notification/markAsRead/{id}/read:
 *   patch:
 *     tags: [Notifications]
 *     summary: Mark a notification as read
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Notification marked as read
 */
router.patch('/markAsRead/:id/read', resolveCompanyActor,controller.markAsRead);

/**
 * @openapi
 * /notification/mark-all-read:
 *   patch:
 *     tags: [Notifications]
 *     summary: Mark all notifications as read for current user
 *     responses:
 *       200:
 *         description: All notifications marked as read
 */
router.patch('/mark-all-read', resolveCompanyActor,controller.markAllAsRead);

/**
 * @openapi
 * /notification/archiveNotification/{id}:
 *   patch:
 *     tags: [Notifications]
 *     summary: Archive a notification
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Notification archived
 */
router.patch('/archiveNotification/:id', resolveCompanyActor,controller.archiveNotification);

/**
 * @openapi
 * /notification/archive-all:
 *   patch:
 *     tags: [Notifications]
 *     summary: Archive all notifications for the current user
 *     responses:
 *       200:
 *         description: All notifications archived
 */
router.patch('/archive-all',resolveCompanyActor, controller.archiveAllNotifications);

/**
 * @openapi
 * /notification/deleteNotification/{id}:
 *   delete:
 *     tags: [Notifications]
 *     summary: Delete a notification
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Notification deleted
 */
router.delete('/deleteNotification/:id',resolveCompanyActor, controller.deleteNotification);

// DELETE /notification/delete-all — delete all active (non-archived) notifications
router.delete('/delete-all', resolveCompanyActor, controller.deleteAllNotifications);

// DELETE /notification/delete-all-archived — delete all archived notifications
router.delete('/delete-all-archived', resolveCompanyActor, controller.deleteAllArchivedNotifications);

module.exports = router;
