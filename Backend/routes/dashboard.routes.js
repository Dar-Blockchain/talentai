/**
 * Dashboard routes (statistics and exports)
 *
 * Global middlewares applied:
 * - requireAuthUser: requires an authenticated user
 * - controledAcces('Admin'): restricted to administrators
 * - LogMiddleware("Dashboard"): logs dashboard access
 */
const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboard.controller");

// Import des middlewares
const { requireAuth } = require("../middleware/security/auth.middleware");
const { verifyApiKey, checkScope } = require("../middleware/security/api-key.middleware");

const authLogMiddleware = require("../middleware/security/request-log.middleware.js")
const { controledAcces } = require('../middleware/authorize.middleware.js'); // Importez le middleware
const resolveCompanyActor = require('../middleware/resolve-company-actor.middleware');


// All routes below require an authenticated admin
//router.use(requireAuthUser, authLogMiddleware("Dashboard"));
// Auth required + logs for all routes
// Accepts either JWT (requireAuthUser) or API key (verifyApiKey)
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
 *     summary: Global platform counters (users, posts, assessments, skills …)
 *     responses:
 *       200:
 *         description: Aggregated counts and percentages
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
 * /dashboard/getUserCountsByLocation:
 *   get:
 *     tags: [Dashboard]
 *     summary: User statistics grouped by location
 *     responses:
 *       200:
 *         description: Location breakdown
 */
router.get("/getUserCountsByLocation", dashboardController.getUserCountsByLocation);

/**
 * @openapi
 * /dashboard/job-assessment-results-grouped:
 *   get:
 *     tags: [Dashboard]
 *     summary: Assessment results grouped by job ID
 *     responses:
 *       200:
 *         description: Grouped results
 */
router.get("/job-assessment-results-grouped", dashboardController.getJobAssessmentResultsGroupedByJobId);

/**
 * @openapi
 * /dashboard/getJobAssessmentsBySkill:
 *   post:
 *     tags: [Dashboard]
 *     summary: Retrieve assessments filtered by skill
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [skill]
 *             properties:
 *               skill: { type: string }
 *     responses:
 *       200:
 *         description: Matching assessments
 */
router.post("/getJobAssessmentsBySkill", dashboardController.getJobAssessmentsBySkill);

/**
 * @openapi
 * /dashboard/downloadUserExcel:
 *   get:
 *     tags: [Dashboard]
 *     summary: Download Excel export of all users
 *     responses:
 *       200:
 *         description: Excel file
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get("/downloadUserExcel", dashboardController.downloadUserExcel);

/**
 * @openapi
 * /dashboard/download-users-with-assessment-zero:
 *   get:
 *     tags: [Dashboard]
 *     summary: Download Excel of users with no assessment score
 *     responses:
 *       200:
 *         description: Excel file
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get("/download-users-with-assessment-zero", dashboardController.downloadUserExcelWithAssessmentZero);

/**
 * @openapi
 * /dashboard/download-users-with-assessment-Above50:
 *   get:
 *     tags: [Dashboard]
 *     summary: Download Excel of users with assessment score > 50
 *     responses:
 *       200:
 *         description: Excel file
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get("/download-users-with-assessment-Above50", dashboardController.downloadUserExcelWithAssessmentAbove50);

module.exports = router;