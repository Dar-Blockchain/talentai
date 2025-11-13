/**
 * Routes de consultation des logs applicatifs
 *
 * Middlewares globaux appliqués:
 * - requireAuthUser: nécessite un utilisateur authentifié
 * - controledAcces('Admin'): réservé aux administrateurs
 * - LogMiddleware("Log"): journalise l'accès aux logs
 */
const express = require('express');
const router = express.Router();
const logController = require('../controllers/DashbordController/logController');  

// Import des middlewares
const { requireAuthUser } = require('../middleware/authMiddleware');
const { controledAcces } = require('../middleware/controledAcces'); 
const authLogMiddleware = require("../middleware/SystemeLogs/LogMiddleware")


// Toutes les routes ci-dessous nécessitent un admin authentifié
router.use(requireAuthUser, controledAcces('Admin'), authLogMiddleware("Log"));


// GET /logs/getAllLogs
// Description: Récupère tous les logs paginés/filtrés selon implémentation
router.get('/getAllLogs', logController.getAllLogs);

// GET /logs/logs/count
// Description: Retourne le nombre total de logs
router.get('/logs/count', logController.getTotalLogsCount);

module.exports = router;
