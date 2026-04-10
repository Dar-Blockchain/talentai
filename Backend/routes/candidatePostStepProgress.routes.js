/**
 * Candidate progress routes for post steps
 *
 * Global applied middlewares:
 * - requireAuthUser: requires an authenticated user
 */
const express = require('express');
const router = express.Router();
const candidatePostStepProgressController = require('../controllers/candidatePostStepProgress.controller');
const {requireAuthUser} = require('../middleware/security/auth.middleware');
const authLogMiddleware = require("../middleware/security/request-log.middleware")

// Auth obligatoire pour toutes les routes
router.use(requireAuthUser,authLogMiddleware("CandidatePostStepProgress"));

// CRUD de base
// GET /candidate-post-step-progress/getUserProgress: progression de l'utilisateur courant
router.get('/getUserProgress', candidatePostStepProgressController.findByIdCandidate);
router.post('/', candidatePostStepProgressController.createProgress);
router.get('/', candidatePostStepProgressController.getAllProgress);
router.get('/:id', candidatePostStepProgressController.getProgressById);
router.put('/:id', candidatePostStepProgressController.updateProgress);
router.delete('/:id', candidatePostStepProgressController.deleteProgress);

// Candidate-specific specialized routes
router.get('/candidate/:candidateId', candidatePostStepProgressController.getProgressByCandidate);

// Post-specific specialized routes
router.get('/post/:postId', candidatePostStepProgressController.getProgressByPost);

// Status-specific specialized routes
router.get('/status/:status', candidatePostStepProgressController.getProgressByStatus);

// Routes for specific candidate and post
router.get('/candidate/:candidateId/post/:postId', candidatePostStepProgressController.getProgressByCandidateAndPost);
router.put('/candidate/:candidateId/post/:postId', candidatePostStepProgressController.updateProgressByCandidateAndPost);
router.delete('/candidate/:candidateId/post/:postId', candidatePostStepProgressController.deleteProgressByCandidateAndPost);

// Upsert route (create or update)
router.post('/candidate/:candidateId/post/:postId/upsert', candidatePostStepProgressController.upsertProgress);

module.exports = router;