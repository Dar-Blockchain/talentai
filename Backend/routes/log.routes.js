/**
 * Application logs consultation routes
 *
 * Global middlewares applied:
 * - requireAuthUser: requires an authenticated user
 * - controledAcces('Admin'): reserved for administrators
 * - LogMiddleware("Log"): logs access to logs
 */
const express = require('express');
const router = express.Router();
const logController = require('../controllers/log.controller');

// Import des middlewares
const { requireAuthUser } = require('../middleware/security/auth.middleware');
const { controledAcces } = require('../middleware/authorize.middleware.js'); 
const authLogMiddleware = require("../middleware/security/request-log.middleware.js")


// All routes below require an authenticated admin
router.use(requireAuthUser, controledAcces('Admin'), authLogMiddleware("Log"));

// GET /logs/getAllLogs
// Description: Retrieves all logs with pagination/filtering according to implementation
router.get('/getAllLogs', logController.getAllLogs);

// GET /logs/logs/count
// Description: Returns the total number of logs
router.get('/logs/count', logController.getTotalLogsCount);

module.exports = router;
