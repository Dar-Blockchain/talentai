/**
 * Routes for Post Interview Assessment
 *
 * Middlewares applied:
 * - requireAuthUser: requires authenticated user
 * - LogMiddleware("PostInterviewAssessment"): logs assessment requests
 */

const express = require('express');
const router = express.Router();
const postInterviewAssessmentController = require('../controllers/InterviewControllers/postInterviewAssessment.controller');

// Import middlewares
const { requireAuth } = require('../middleware/security/auth.middleware');
const authLogMiddleware = require("../middleware/security/request-log.middleware");
const resolveCompanyActor = require('../middleware/resolve-company-actor.middleware');
const { verifyApiKey, checkScope } = require("../middleware/security/api-key.middleware");

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
router.get('/post/:postId/candidate/:candidateUserId', postInterviewAssessmentController.getAssessmentByPostAndCandidate);

// ========== AUTHENTICATED ROUTES ==========
router.use(requireAuth,authLogMiddleware("PostInterviewAssessment"));

/**
 * @openapi
 * /post-interview-assessments/check/{postId}:
 *   get:
 *     tags: [Post Interview Assessments]
 *     summary: Check if current candidate has an assessment for this post
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Existence flag
 */
router.get('/check/:postId', postInterviewAssessmentController.checkCandidateAssessmentExists);

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
router.get('/', postInterviewAssessmentController.getAllPostInterviewAssessments);

/**
 * @openapi
 * /post-interview-assessments/company/mine:
 *   get:
 *     tags: [Post Interview Assessments]
 *     summary: All assessments for the authenticated company
 *     responses:
 *       200:
 *         description: Company's assessments
 */
router.get('/company/mine', resolveCompanyActor, postInterviewAssessmentController.getAllPostInterviewAssessmentsForCompany);

/**
 * @openapi
 * /post-interview-assessments/company/mine/metrics:
 *   get:
 *     tags: [Post Interview Assessments]
 *     summary: Interview metrics for the authenticated company
 *     responses:
 *       200:
 *         description: Metrics data
 */
router.get('/company/mine/metrics', resolveCompanyActor, postInterviewAssessmentController.getInterviewMetricsForCompany);

/**
 * @openapi
 * /post-interview-assessments/candidate/my:
 *   get:
 *     tags: [Post Interview Assessments]
 *     summary: Get all assessments for the authenticated candidate
 *     responses:
 *       200:
 *         description: Candidate's assessments
 */
router.get('/candidate/my', postInterviewAssessmentController.getAssessmentsByCandidate);

/**
 * @openapi
 * /post-interview-assessments:
 *   post:
 *     tags: [Post Interview Assessments]
 *     summary: Create a new post interview assessment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Assessment created
 */
router.post('/', postInterviewAssessmentController.createPostInterviewAssessment);

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
router.get('/:assessmentId', postInterviewAssessmentController.getPostInterviewAssessmentById);

module.exports = router;
