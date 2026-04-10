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
const { requireAuthUser } = require("../middleware/security/auth.middleware");
const { verifyApiKey, checkScope } = require("../middleware/security/api-key.middleware");

const authLogMiddleware = require("../middleware/security/request-log.middleware.js")
const { controledAcces } = require('../middleware/authorize.middleware.js'); // Importez le middleware
const resolveCompanyActor = require('../middleware/resolve-company-actor.middleware');


// All routes below require an authenticated admin
//router.use(requireAuthUser, authLogMiddleware("Dashboard"));
// Auth required + logs for all routes
// Accepts either JWT (requireAuthUser) or API key (verifyApiKey)
router.use((req, res, next) => {
  // First try API Key verification
  verifyApiKey(req, res, (err) => {
    // If API Key succeeds, continue
    if (req.isApiKeyAuth) {
      return next();
    }
    // Otherwise, require JWT authentication
    return requireAuthUser(req, res, next);
  });
});
// GET /dashboard/getAllUsers
// Description: Retrieves the list of all users
router.get("/getAllUsers", dashboardController.getAllUsers);

// GET /dashboard/getCounts
// Description: Retrieves global counters (users, etc.)
router.get("/getCounts", dashboardController.getCounts);

// GET /dashboard/statsCards
// Description: Retrieves statistics displayed as cards on the dashboard
router.get("/statsCards", resolveCompanyActor, dashboardController.getStatsCards);
router.get("/richStats", resolveCompanyActor, dashboardController.getRichStats);

// GET /dashboard/getUserCountsByDay
// Description: Retrieves daily evolution of user count
router.get("/getUserCountsByDay", dashboardController.getCountsByDay);

// GET /dashboard/getUserCountsByLocation
// Description: Statistics by location
router.get("/getUserCountsByLocation", dashboardController.getUserCountsByLocation);

// GET /dashboard/job-assessment-results-grouped
// Description: Assessment results grouped by jobId
router.get("/job-assessment-results-grouped", dashboardController.getJobAssessmentResultsGroupedByJobId);

// POST /dashboard/getJobAssessmentsBySkill
// Body: { skill: string }
// Description: Retrieves assessments by skill
router.post("/getJobAssessmentsBySkill", dashboardController.getJobAssessmentsBySkill);

// GET /dashboard/downloadUserExcel
// Description: Downloads an Excel export of users
router.get("/downloadUserExcel", dashboardController.downloadUserExcel);

// GET /dashboard/download-users-with-assessment-zero
// Description: Downloads users without assessment
router.get("/download-users-with-assessment-zero", dashboardController.downloadUserExcelWithAssessmentZero);

// GET /dashboard/download-users-with-assessment-Above50
// Description: Downloads users with score > 50
router.get("/download-users-with-assessment-Above50", dashboardController.downloadUserExcelWithAssessmentAbove50);

module.exports = router;