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

// GET /post-interview-assessments/post/:postId — Get all assessments for a post
router.get('/post/:postId', postInterviewAssessmentController.getAssessmentsByPost);

// GET /post-interview-assessments/post/:postId/statistics — Get statistics for a post
//router.get('/post/:postId/statistics', postInterviewAssessmentController.getAssessmentStatistics);

// ========== AUTHENTICATED ROUTES ==========
router.use(requireAuthUser, authLogMiddleware("PostInterviewAssessment"));

// GET /post-interview-assessments — Get all assessments
router.get('/', postInterviewAssessmentController.getAllPostInterviewAssessments);

// GET /post-interview-assessments/company/mine — Get all assessments for authenticated company
router.get('/company/mine', postInterviewAssessmentController.getAllPostInterviewAssessmentsForCompany);

// GET /post-interview-assessments/candidate — Get all assessments for a candidate
router.get('/candidate', postInterviewAssessmentController.getAssessmentsByCandidate);

// POST /post-interview-assessments — Create new assessment
router.post('/', postInterviewAssessmentController.createPostInterviewAssessment);

// GET /post-interview-assessments/:assessmentId — Get single assessment
router.get('/:assessmentId', postInterviewAssessmentController.getPostInterviewAssessmentById);

// GET /post-interview-assessments/search — Search assessments
//router.get('/search', postInterviewAssessmentController.searchAssessments);

// PUT /post-interview-assessments/:assessmentId — Update assessment
//router.put('/:assessmentId', postInterviewAssessmentController.updatePostInterviewAssessment);

// PATCH /post-interview-assessments/:assessmentId/interview-data — Update interview data
//router.patch('/:assessmentId/interview-data', postInterviewAssessmentController.updateInterviewData);

// DELETE /post-interview-assessments/:assessmentId — Delete assessment
//router.delete('/:assessmentId', postInterviewAssessmentController.deletePostInterviewAssessment);

// DELETE /post-interview-assessments/post/:postId — Delete all assessments for a post
//router.delete('/post/:postId', postInterviewAssessmentController.deleteAssessmentsByPost);

module.exports = router;
