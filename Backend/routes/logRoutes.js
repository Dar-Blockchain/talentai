const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');  

// Importez les middlewares
const { requireAuthUser } = require('../middleware/authMiddleware');
const { controledAcces } = require('../middleware/controledAcces'); 
const authLogMiddleware = require("../middleware/SystemeLogs/LogMiddleware")


router.use(requireAuthUser, controledAcces('Admin'), authLogMiddleware("Log"));


// Route GET pour récupérer tous les logs
router.get('/getAllLogs', logController.getAllLogs);

// Route GET pour récupérer le nombre total de logs
router.get('/logs/count', logController.getTotalLogsCount);

module.exports = router;
