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
const { requireAuth } = require('../middleware/security/auth.middleware');
const { controledAcces } = require('../middleware/authorize.middleware.js');
const authLogMiddleware = require("../middleware/security/request-log.middleware.js")

// All routes below require an authenticated admin
router.use(requireAuth, controledAcces('Admin'), authLogMiddleware("Log"));

/**
 * @openapi
 * /logs/getAllLogs:
 *   get:
 *     tags: [Logs]
 *     summary: Retrieve all application logs (Admin)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 50 }
 *       - in: query
 *         name: level
 *         schema: { type: string, enum: [info, warn, error] }
 *     responses:
 *       200:
 *         description: Paginated log entries
 *       403:
 *         description: Admin role required
 */
router.get('/getAllLogs', logController.getAllLogs);

module.exports = router;
