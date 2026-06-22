const express = require("express");
const router = express.Router();
const postInterviewAssessmentController = require("./post-interview.controller");

// Import middlewares
const { requireAuth } = require("../../../middleware/security/auth.middleware");
const authLogMiddleware = require("../../../middleware/security/request-log.middleware");

// ========== PUBLIC ROUTES (no auth required) ==========

/**
 * @openapi
 * /post-interview-assessments/post/{postId}/candidate/{candidateUserId}:
 *   get:
 *     tags: [Post Interview Assessments]
 *     summary: Get assessment for one candidate on a post (public)
 *     security: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: candidateUserId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Assessment data
 *       404:
 *         description: Not found
 */
router.get(
  "/post/:postId/candidate/:candidateUserId",
  postInterviewAssessmentController.getAssessmentByPostAndCandidate,
);

// ========== AUTHENTICATED ROUTES ==========
router.use(requireAuth, authLogMiddleware("PostInterviewAssessment"));

// GET /post-interview-assessments/eligibility/:postId — Unified eligibility check
router.get(
  "/eligibility/:postId",
  postInterviewAssessmentController.checkInterviewEligibility,
);

// GET /post-interview-assessments — Get all assessments
/**
 * @openapi
 * /post-interview-assessments:
 *   get:
 *     tags: [Post Interview Assessments]
 *     summary: List all post interview assessments
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: company
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Paginated assessments
 */
router.get(
  "/",
  postInterviewAssessmentController.getAllPostInterviewAssessments,
);

/**
 * @openapi
 * /post-interview-assessments/{assessmentId}:
 *   get:
 *     tags: [Post Interview Assessments]
 *     summary: Get a single assessment by ID
 *     parameters:
 *       - in: path
 *         name: assessmentId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Assessment details
 *       404:
 *         description: Not found
 */
router.get(
  "/:assessmentId",
  postInterviewAssessmentController.getPostInterviewAssessmentById,
);

module.exports = router;
