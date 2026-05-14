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
const { requireAuth } = require("../middleware/security/auth.middleware");
const authLogMiddleware = require("../middleware/security/request-log.middleware");
const { verifyApiKey, checkScope } = require("../middleware/security/api-key.middleware");

// ========== PUBLIC ROUTES (no auth required) ==========

// GET /job-applications/post/:postId — Get all applications for a post
router.get("/post/:postId", jobApplicationController.getApplicationsByPost);

// ========== AUTHENTICATED ROUTES ==========
router.use(requireAuth, authLogMiddleware("JobApplication"));

// POST /job-applications — Create new application
router.post("/", jobApplicationController.createJobApplication);

// GET /job-applications — Get all applications (admin/global)
router.get("/", jobApplicationController.getAllJobApplications);

// GET /job-applications/candidate/my — Get all applications for authenticated candidate
router.get("/candidate/my", jobApplicationController.getApplicationsByCandidate);

// GET /job-applications/candidate/my/stats — Get dashboard stats for authenticated candidate
router.get("/candidate/my/stats", jobApplicationController.getCandidateStats);

// GET /job-applications/company/my — Get all applications for authenticated company
// Query params: page, limit, post (filter by post), status, search/candidateName (search by candidate name), skills (filter by skills)
router.get("/company/my", jobApplicationController.getApplicationsByCompany);

// POST /job-applications/contact-candidate — Send a direct email to a candidate
router.post("/contact-candidate", jobApplicationController.contactCandidate);

// GET /job-applications/post/:postId/summary — Flat summary list for a post (company only)
// Query params: status, search, matchScoreMin, matchScoreMax, interviewScoreMin, interviewScoreMax,
//               dateFrom, dateTo, sort (appliedAt_desc|appliedAt_asc|matchScore_desc|matchScore_asc|
//               interviewScore_desc|interviewScore_asc|name_asc|name_desc), page, limit
router.get("/post/:postId/summary", jobApplicationController.getApplicationsSummaryByPost);

// GET /job-applications/company/my/summary — Flat summary list for all company applications
router.get("/company/my/summary", jobApplicationController.getApplicationsSummaryByCompany);

// GET /job-applications/company/my/metrics — Get application metrics for authenticated company
router.get("/company/my/metrics", jobApplicationController.getApplicationMetrics);

// GET /job-applications/company/my/cvs/download — Download all matching CVs as a ZIP
router.get("/company/my/cvs/download", jobApplicationController.downloadCVsByCompany);

// GET /job-applications/company/my/kpi/actions — Get all Zone 1 action counts in one call
// Query params: postId (optional), dateFrom (optional)
router.get("/company/my/kpi/actions", jobApplicationController.getActionsKPI);

// GET /job-applications/company/my/kpi/sourcing — Get KPI: Sourcing quality (Zone 5)
router.get("/company/my/kpi/sourcing", jobApplicationController.getSourcingKPI);

// GET /job-applications/company/my/kpi/velocity — Get KPI: TTS + TTH trend (Zone 4)
router.get("/company/my/kpi/velocity", jobApplicationController.getVelocityKPI);

// GET /job-applications/company/my/kpi/funnel — Get KPI: Global funnel counts
// Query params: postId (optional)
router.get("/company/my/kpi/funnel", jobApplicationController.getFunnelKPI);

// GET /job-applications/company/my/kpi/roi — Get KPI: Reporting & ROI (Zone 7)
router.get("/company/my/kpi/roi", jobApplicationController.getRoiKPI);

// GET /job-applications/company/my/shortlisted — Get all shortlisted candidates
// Query params: postId (optional), page, limit
router.get("/company/my/shortlisted", jobApplicationController.getShortlistedCandidates);

// GET /job-applications/company/my/rejected — Get all rejected candidates
// Query params: postId (optional), page, limit
router.get("/company/my/rejected", jobApplicationController.getRejectedCandidates);

// GET /job-applications/company/my/by-decision — Get candidates by recruiter decision
// Query params: decision (required: shortlisted|rejected), postId (optional), page, limit
router.get("/company/my/by-decision", jobApplicationController.getCandidatesByDecision);

// POST /job-applications/auto-invite/trigger — Trigger auto-invite (nudge #1), bypasses time window
router.post("/auto-invite/trigger", jobApplicationController.triggerAutoInvite);

// POST /job-applications/reminder/trigger — Trigger reminder (nudge #2 / #3), bypasses time window
router.post("/reminder/trigger", jobApplicationController.triggerReminder);

// PATCH /job-applications/:applicationId/recruiter-decision — Update recruiter's decision (shortlist/reject)
// Body: { decision: "shortlisted" | "rejected", rejectionReason: "optional reason" }
router.patch("/:applicationId/recruiter-decision", jobApplicationController.updateRecruiterDecision);

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
