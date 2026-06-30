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

// Platform-wide stats/PII routes are admin-only — statsCards/richStats below
// stay open to any authenticated company (they're scoped to that company's
// own data via resolveCompanyActor), but every route returning cross-tenant
// data (all users, global counts, revenue, signups) must be admin-gated.
const adminOnly = controledAcces("Admin");

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
router.get("/getAllUsers", adminOnly, dashboardController.getAllUsers);

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
router.get("/getCounts", adminOnly, dashboardController.getCounts);

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
router.get("/getUserCountsByDay", adminOnly, dashboardController.getCountsByDay);

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
router.get("/adminRevenueSummary", adminOnly, dashboardController.getAdminRevenueSummary);

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
router.get("/recentSignups", adminOnly, dashboardController.getRecentSignups);

// ========== ADMIN MODERATION — Posts ==========
router.get("/posts", adminOnly, dashboardController.getAllPostsForAdmin);
router.patch("/posts/:id/archive", adminOnly, dashboardController.archivePostAdmin);
router.patch("/posts/:id/unarchive", adminOnly, dashboardController.unarchivePostAdmin);
router.patch("/posts/:id/threshold", adminOnly, dashboardController.updatePostThresholdAdmin);
router.delete("/posts/:id", adminOnly, dashboardController.hardDeletePostAdmin);

// ========== ADMIN MODERATION — Post Interview Assessments ==========
router.get("/post-interview-assessments", adminOnly, dashboardController.getAllPostInterviewAssessmentsForAdmin);
router.patch("/post-interview-assessments/:assessmentId/archive", adminOnly, dashboardController.archivePostInterviewAssessmentAdmin);
router.patch("/post-interview-assessments/:assessmentId/unarchive", adminOnly, dashboardController.unarchivePostInterviewAssessmentAdmin);
router.delete("/post-interview-assessments/:assessmentId", adminOnly, dashboardController.hardDeletePostInterviewAssessmentAdmin);

// ========== ADMIN MODERATION — Skill Interview Assessments ==========
router.get("/skill-interview-assessments", adminOnly, dashboardController.getAllSkillInterviewAssessmentsForAdmin);
router.patch("/skill-interview-assessments/:id/archive", adminOnly, dashboardController.archiveSkillInterviewAssessmentAdmin);
router.patch("/skill-interview-assessments/:id/unarchive", adminOnly, dashboardController.unarchiveSkillInterviewAssessmentAdmin);
router.delete("/skill-interview-assessments/:id", adminOnly, dashboardController.hardDeleteSkillInterviewAssessmentAdmin);

// ========== ADMIN MODERATION — Subscriptions ==========
router.get("/subscriptions/companies", adminOnly, dashboardController.searchCompaniesForAdmin);
router.get("/subscriptions/companies-with-status", adminOnly, dashboardController.getAllCompaniesWithSubscriptionsForAdmin);
router.post("/subscriptions", adminOnly, dashboardController.adminCreateSubscription);

// ========== ADMIN MODERATION — Plans ==========
router.post("/plans", adminOnly, dashboardController.createPlanForAdmin);
router.put("/plans", adminOnly, dashboardController.updatePlanForAdmin);

module.exports = router;
