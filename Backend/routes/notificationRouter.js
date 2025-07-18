const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// Créer une notification
router.post('/', notificationController.createNotification);

module.exports = router;
