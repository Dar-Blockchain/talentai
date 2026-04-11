/**
 * Job Application Routes
 * 
 * Middlewares applied:
 * - requireAuthUser: requires authenticated user for protected routes
 * - LogMiddleware("JobApplication"): logs application requests
 */

const express = require("express");
const router = express.Router();
const jobApplicationController = require("../controllers/jobApplication.controller");

// Import middlewares
const { requireAuthUser } = require("../middleware/security/auth.middleware");
const authLogMiddleware = require("../middleware/security/request-log.middleware");
const { verifyApiKey, checkScope } = require("../middleware/security/api-key.middleware");

// ========== PUBLIC ROUTES (no auth required) ==========

// GET /job-applications/post/:postId — Get all applications for a post
router.get("/post/:postId", jobApplicationController.getApplicationsByPost);

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

// ========== AUTHENTICATED ROUTES ==========
router.use( authLogMiddleware("JobApplication"));

// POST /job-applications — Create new application
router.post("/", jobApplicationController.createJobApplication);

// GET /job-applications — Get all applications (admin/global)
router.get("/", jobApplicationController.getAllJobApplications);

// GET /job-applications/candidate/my — Get all applications for authenticated candidate
router.get("/candidate/my", jobApplicationController.getApplicationsByCandidate);

// GET /job-applications/company/my — Get all applications for authenticated company
// Query params: page, limit, post (filter by post), status, search/candidateName (search by candidate name), skills (filter by skills)
router.get("/company/my", jobApplicationController.getApplicationsByCompany);

// GET /job-applications/company/my/metrics — Get application metrics for authenticated company
router.get("/company/my/metrics", jobApplicationController.getApplicationMetrics);

// POST /job-applications/auto-invite/trigger — Trigger auto-invite scheduler manually (for testing)
router.post("/auto-invite/trigger", jobApplicationController.triggerAutoInvite);

// GET /job-applications/:applicationId — Get single application by ID
router.get("/:applicationId", jobApplicationController.getJobApplicationById);

// PATCH /job-applications/:applicationId — Update application
router.patch("/:applicationId", jobApplicationController.updateJobApplication);

// POST /job-applications/:applicationId/withdraw — Withdraw application
router.post("/:applicationId/withdraw", jobApplicationController.withdrawJobApplication);

// POST /job-applications/:applicationId/archive — Archive application
router.post("/:applicationId/archive", jobApplicationController.archiveJobApplication);

// POST /job-applications/:applicationId/invite-to-interview — Send interview invitation email
router.post("/:applicationId/invite-to-interview", jobApplicationController.inviteToInterview);

// DELETE /job-applications/:applicationId — Delete application
router.delete("/:applicationId", jobApplicationController.deleteJobApplication);

module.exports = router;
