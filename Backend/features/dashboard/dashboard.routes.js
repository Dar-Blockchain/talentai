/**
 * Dashboard routes (statistics)
 */
const express = require("express");
const router = express.Router();
const dashboardController = require("./dashboard.controller");

const { requireAuth } = require("../../middleware/security/auth.middleware");
const { verifyApiKey, checkScope } = require("../../middleware/security/api-key.middleware");
const authLogMiddleware = require("../../middleware/security/request-log.middleware.js");
const { controledAcces } = require('../../middleware/authorize.middleware.js');
const resolveCompanyActor = require('../../middleware/resolve-company-actor.middleware');

router.use(requireAuth);

/**
 * @openapi
 * /dashboard/getAllUsers:
 *   get:
 *     tags: [Dashboard]
 *     summary: List all users (paginated)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: username
 *         schema: { type: string }
 *       - in: query
 *         name: email
 *         schema: { type: string }
 *       - in: query
 *         name: role
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Paginated list of users
 */
router.get("/getAllUsers", dashboardController.getAllUsers);

/**
 * @openapi
 * /dashboard/getCounts:
 *   get:
 *     tags: [Dashboard]
 *     summary: Global platform counters
 *     responses:
 *       200:
 *         description: Aggregated counts
 */
router.get("/getCounts", dashboardController.getCounts);

/**
 * @openapi
 * /dashboard/statsCards:
 *   get:
 *     tags: [Dashboard]
 *     summary: Card statistics for the dashboard
 *     responses:
 *       200:
 *         description: Stats cards data
 */
router.get("/statsCards", resolveCompanyActor, dashboardController.getStatsCards);

/**
 * @openapi
 * /dashboard/richStats:
 *   get:
 *     tags: [Dashboard]
 *     summary: Rich/extended dashboard statistics
 *     responses:
 *       200:
 *         description: Extended stats
 */
router.get("/richStats", resolveCompanyActor, dashboardController.getRichStats);

/**
 * @openapi
 * /dashboard/getUserCountsByDay:
 *   get:
 *     tags: [Dashboard]
 *     summary: Daily counts for users, posts, and assessments
 *     responses:
 *       200:
 *         description: Array of daily data points
 */
router.get("/getUserCountsByDay", dashboardController.getCountsByDay);

/**
 * @openapi
 * /dashboard/adminRevenueSummary:
 *   get:
 *     tags: [Dashboard]
 *     summary: Platform-wide MRR and active-subscriptions breakdown by plan
 *     responses:
 *       200:
 *         description: Revenue summary
 */
router.get("/adminRevenueSummary", dashboardController.getAdminRevenueSummary);

/**
 * @openapi
 * /dashboard/recentSignups:
 *   get:
 *     tags: [Dashboard]
 *     summary: Most recently registered users
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 8 }
 *     responses:
 *       200:
 *         description: Recent signups list
 */
router.get("/recentSignups", dashboardController.getRecentSignups);

module.exports = router;
