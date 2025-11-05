/**
 * Routes de notifications
 *
 * Remarque: authentification non imposée ici. Si nécessaire, appliquer `requireAuthUser`
 * et éventuellement un middleware de rôles + journalisation.
 */
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// POST /notifications/ — crée une notification
router.post('/', notificationController.createNotification);

module.exports = router;
