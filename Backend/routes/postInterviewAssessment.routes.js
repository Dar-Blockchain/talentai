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

// GET /post-interview-assessments/post/:postId/candidate/:candidateUserId — Get assessment for one candidate
router.get('/post/:postId/candidate/:candidateUserId', postInterviewAssessmentController.getAssessmentByPostAndCandidate);

// ========== AUTHENTICATED ROUTES ==========
router.use(requireAuth,authLogMiddleware("PostInterviewAssessment"));

// GET /post-interview-assessments/check/:postId — Check if candidate has assessment for post
router.get('/check/:postId', postInterviewAssessmentController.checkCandidateAssessmentExists);

// GET /post-interview-assessments — Get all assessments
router.get('/', postInterviewAssessmentController.getAllPostInterviewAssessments);

// GET /post-interview-assessments/company/mine — Get all assessments for authenticated company
router.get('/company/mine', resolveCompanyActor, postInterviewAssessmentController.getAllPostInterviewAssessmentsForCompany);

// GET /post-interview-assessments/company/mine/metrics — Get interview metrics for authenticated company
router.get('/company/mine/metrics', resolveCompanyActor, postInterviewAssessmentController.getInterviewMetricsForCompany);

// GET /post-interview-assessments/candidate — Get all assessments for a candidate
router.get('/candidate/my', postInterviewAssessmentController.getAssessmentsByCandidate);

// POST /post-interview-assessments — Create new assessment
router.post('/', postInterviewAssessmentController.createPostInterviewAssessment);

// GET /post-interview-assessments/:assessmentId — Get single assessment
router.get('/:assessmentId', postInterviewAssessmentController.getPostInterviewAssessmentById);

module.exports = router;
