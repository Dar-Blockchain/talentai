/**
 * Routes for Post Interview Assessment
 * 
 * Middlewares applied:
 * - requireAuthUser: requires authenticated user
 * - LogMiddleware("PostInterviewAssessment"): logs assessment requests
 */

const express = require('express');
const router = express.Router();
const postInterviewAssessmentController = require('../controllers/InterviewControllers/postInterviewAssessmentController');

// Import middlewares
const { requireAuthUser } = require('../middleware/authMiddleware');
const authLogMiddleware = require("../middleware/SystemeLogs/LogMiddleware");

// ========== PUBLIC ROUTES (no auth required) ==========

// GET /postInterviewAssessments/:assessmentId — Get single assessment
router.get('/:assessmentId', postInterviewAssessmentController.getPostInterviewAssessmentById);

// GET /postInterviewAssessments/post/:postId — Get all assessments for a post
router.get('/post/:postId', postInterviewAssessmentController.getAssessmentsByPost);

// GET /postInterviewAssessments/candidate/:candidateId — Get all assessments for a candidate
router.get('/candidate/:candidateId', postInterviewAssessmentController.getAssessmentsByCandidate);

// GET /postInterviewAssessments/post/:postId/statistics — Get statistics for a post
router.get('/post/:postId/statistics', postInterviewAssessmentController.getAssessmentStatistics);

// ========== AUTHENTICATED ROUTES ==========
router.use(requireAuthUser, authLogMiddleware("PostInterviewAssessment"));

// GET /postInterviewAssessments — Get all assessments
router.get('/', postInterviewAssessmentController.getAllPostInterviewAssessments);

// GET /postInterviewAssessments/company/mine — Get all assessments for authenticated company
router.get('/company/mine', postInterviewAssessmentController.getAllPostInterviewAssessmentsForCompany);

// POST /postInterviewAssessments — Create new assessment
router.post('/', postInterviewAssessmentController.createPostInterviewAssessment);

// GET /postInterviewAssessments/search — Search assessments
router.get('/search', postInterviewAssessmentController.searchAssessments);

// PUT /postInterviewAssessments/:assessmentId — Update assessment
router.put('/:assessmentId', postInterviewAssessmentController.updatePostInterviewAssessment);

// PATCH /postInterviewAssessments/:assessmentId/interview-data — Update interview data
router.patch('/:assessmentId/interview-data', postInterviewAssessmentController.updateInterviewData);

// DELETE /postInterviewAssessments/:assessmentId — Delete assessment
//router.delete('/:assessmentId', postInterviewAssessmentController.deletePostInterviewAssessment);

// DELETE /postInterviewAssessments/post/:postId — Delete all assessments for a post
//router.delete('/post/:postId', postInterviewAssessmentController.deleteAssessmentsByPost);

module.exports = router;
