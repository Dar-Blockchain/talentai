const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');  // Importer le contrôleur des logs

// Route GET pour récupérer tous les logs
router.get('/getAllLogs', logController.getAllLogs);

// Route GET pour récupérer le nombre total de logs
router.get('/logs/count', logController.getTotalLogsCount);

module.exports = router;
