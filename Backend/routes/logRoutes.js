const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');  // Importer le contrôleur des logs
const authLogMiddleware = require("../middleware/SystemeLogs/LogMiddleware")

// Route GET pour récupérer tous les logs
router.get('/getAllLogs',authLogMiddleware('log'), logController.getAllLogs);

// Route GET pour récupérer le nombre total de logs
router.get('/logs/count',authLogMiddleware('log'), logController.getTotalLogsCount);

module.exports = router;
