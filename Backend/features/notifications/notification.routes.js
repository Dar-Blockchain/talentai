const express = require('express');
const router = express.Router();
const controller = require('./notification.controller');
const { requireAuth } = require('../../middleware/security/auth.middleware');
const authLogMiddleware = require('../../middleware/security/request-log.middleware');
const resolveCompanyActor = require('../../middleware/resolve-company-actor.middleware');

router.use(requireAuth, authLogMiddleware('NotificationSystem'));

router.post('/AddNotification', controller.createSystemNotification);
router.post('/AddNotification/info', controller.createInfoNotification);
router.post('/AddNotification/success', controller.createSuccessNotification);
router.post('/AddNotification/warning', controller.createWarningNotification);
router.post('/AddNotification/error', controller.createErrorNotification);
router.post('/AddNotification/custom', controller.createCustomNotification);
router.post('/broadcastSystemNotification', controller.broadcastSystemNotification);

router.get('/GetMyNotification', resolveCompanyActor, controller.listForUser);
router.patch('/markAsRead/:id/read', resolveCompanyActor, controller.markAsRead);
router.patch('/mark-all-read', resolveCompanyActor, controller.markAllAsRead);
router.patch('/archiveNotification/:id', resolveCompanyActor, controller.archiveNotification);
router.patch('/archive-all', resolveCompanyActor, controller.archiveAllNotifications);
router.delete('/deleteNotification/:id', resolveCompanyActor, controller.deleteNotification);
router.delete('/delete-all', resolveCompanyActor, controller.deleteAllNotifications);
router.delete('/delete-all-archived', resolveCompanyActor, controller.deleteAllArchivedNotifications);

module.exports = router;
