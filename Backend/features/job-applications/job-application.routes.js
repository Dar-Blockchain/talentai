/**
 * Job Application Routes
 *
 * Middlewares applied:
 * - requireAuth: requires authenticated user for protected routes
 * - LogMiddleware("JobApplication"): logs application requests
 */

const express = require("express");
const router = express.Router();
const jobApplicationController = require("./job-application.controller");

const { requireAuth } = require("../../middleware/security/auth.middleware");
const authLogMiddleware = require("../../middleware/security/request-log.middleware");

// ========== AUTHENTICATED ROUTES ==========
router.use(requireAuth, authLogMiddleware("JobApplication"));

/**
 * @openapi
 * /job-applications:
 *   post:
 *     tags: [Job Applications]
 *     summary: Create a new job application
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [postId]
 *             properties:
 *               postId: { type: string }
 *               coverLetter: { type: string }
 *     responses:
 *       201:
 *         description: Application created
 */
router.post("/", jobApplicationController.createJobApplication);

/**
 * @openapi
 * /job-applications/candidate/my:
 *   get:
 *     tags: [Job Applications]
 *     summary: Get applications for the authenticated candidate
 *     responses:
 *       200:
 *         description: Candidate's applications
 */
router.get("/candidate/my", jobApplicationController.getApplicationsByCandidate);

/**
 * @openapi
 * /job-applications/candidate/my/stats:
 *   get:
 *     tags: [Job Applications]
 *     summary: Dashboard stats for the authenticated candidate
 *     responses:
 *       200:
 *         description: Candidate stats
 */
router.get("/candidate/my/stats", jobApplicationController.getCandidateStats);

/**
 * @openapi
 * /job-applications/company/my:
 *   get:
 *     tags: [Job Applications]
 *     summary: All applications received by the authenticated company
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: post
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Paginated list of applications
 */
router.get("/company/my", jobApplicationController.getApplicationsByCompany);

/**
 * @openapi
 * /job-applications/contact-candidate:
 *   post:
 *     tags: [Job Applications]
 *     summary: Send a direct email to a candidate
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [applicationId, subject, message]
 *             properties:
 *               applicationId: { type: string }
 *               subject: { type: string }
 *               message: { type: string }
 *     responses:
 *       200:
 *         description: Email sent
 */
router.post("/contact-candidate", jobApplicationController.contactCandidate);

/**
 * @openapi
 * /job-applications/post/{postId}/summary:
 *   get:
 *     tags: [Job Applications]
 *     summary: Flat summary list of applications for a post (company)
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: sort
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Summary list
 */
router.get("/post/:postId/summary", jobApplicationController.getApplicationsSummaryByPost);

/**
 * @openapi
 * /job-applications/company/my/summary:
 *   get:
 *     tags: [Job Applications]
 *     summary: Flat summary list of all company applications
 *     responses:
 *       200:
 *         description: Summary list
 */
router.get("/company/my/summary", jobApplicationController.getApplicationsSummaryByCompany);

/**
 * @openapi
 * /job-applications/company/my/metrics:
 *   get:
 *     tags: [Job Applications]
 *     summary: Application metrics for the authenticated company
 *     responses:
 *       200:
 *         description: Metrics data
 */
router.get("/company/my/metrics", jobApplicationController.getApplicationMetrics);

/**
 * @openapi
 * /job-applications/company/my/kpi/actions:
 *   get:
 *     tags: [Job Applications]
 *     summary: Zone 1 action KPI counts
 *     parameters:
 *       - in: query
 *         name: postId
 *         schema: { type: string }
 *       - in: query
 *         name: dateFrom
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: KPI action counts
 */
router.get("/company/my/kpi/actions", jobApplicationController.getActionsKPI);

/**
 * @openapi
 * /job-applications/company/my/kpi/sourcing:
 *   get:
 *     tags: [Job Applications]
 *     summary: KPI — Sourcing quality
 *     responses:
 *       200:
 *         description: Sourcing KPI
 */
router.get("/company/my/kpi/sourcing", jobApplicationController.getSourcingKPI);

/**
 * @openapi
 * /job-applications/company/my/kpi/velocity:
 *   get:
 *     tags: [Job Applications]
 *     summary: KPI — TTS + TTH trend
 *     responses:
 *       200:
 *         description: Velocity KPI
 */
router.get("/company/my/kpi/velocity", jobApplicationController.getVelocityKPI);

/**
 * @openapi
 * /job-applications/company/my/kpi/funnel:
 *   get:
 *     tags: [Job Applications]
 *     summary: KPI — Global funnel counts
 *     parameters:
 *       - in: query
 *         name: postId
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Funnel KPI
 */
router.get("/company/my/kpi/funnel", jobApplicationController.getFunnelKPI);

/**
 * @openapi
 * /job-applications/company/my/kpi/roi:
 *   get:
 *     tags: [Job Applications]
 *     summary: KPI — Reporting & ROI
 *     responses:
 *       200:
 *         description: ROI KPI
 */
router.get("/company/my/kpi/roi", jobApplicationController.getRoiKPI);

/**
 * @openapi
 * /job-applications/{applicationId}/recruiter-decision:
 *   patch:
 *     tags: [Job Applications]
 *     summary: Update recruiter's decision on an application
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [decision]
 *             properties:
 *               decision:
 *                 type: string
 *                 enum: [shortlisted, rejected]
 *               rejectionReason: { type: string }
 *     responses:
 *       200:
 *         description: Decision updated
 */
router.patch("/:applicationId/recruiter-decision", jobApplicationController.updateRecruiterDecision);
router.patch("/:applicationId/withdraw", jobApplicationController.withdrawApplication);
router.patch("/:applicationId/reactivate", jobApplicationController.reactivateApplication);

/**
 * @openapi
 * /job-applications/{applicationId}:
 *   get:
 *     tags: [Job Applications]
 *     summary: Get a single application by ID
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Application details
 *       404:
 *         description: Not found
 */
router.get("/:applicationId", jobApplicationController.getJobApplicationById);

/**
 * @openapi
 * /job-applications/{applicationId}/invite-to-interview:
 *   post:
 *     tags: [Job Applications]
 *     summary: Send interview invitation email to candidate
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Invitation sent
 */
router.post("/:applicationId/invite-to-interview", jobApplicationController.inviteToInterview);

module.exports = router;
