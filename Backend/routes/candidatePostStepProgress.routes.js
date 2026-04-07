/**
 * Routes de progression d'étapes par candidat et par post
 *
 * Middlewares globaux appliqués:
 * - requireAuthUser: nécessite un utilisateur authentifié
 */
const express = require('express');
const router = express.Router();
const candidatePostStepProgressController = require('../controllers/candidatePostStepProgress.controller');
const {requireAuthUser} = require('../middleware/auth.middleware');
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

// Routes spécialisées par candidat
router.get('/candidate/:candidateId', candidatePostStepProgressController.getProgressByCandidate);

// Routes spécialisées par post
router.get('/post/:postId', candidatePostStepProgressController.getProgressByPost);

// Routes spécialisées par statut
router.get('/status/:status', candidatePostStepProgressController.getProgressByStatus);

// Routes pour candidat et post spécifiques
router.get('/candidate/:candidateId/post/:postId', candidatePostStepProgressController.getProgressByCandidateAndPost);
router.put('/candidate/:candidateId/post/:postId', candidatePostStepProgressController.updateProgressByCandidateAndPost);
router.delete('/candidate/:candidateId/post/:postId', candidatePostStepProgressController.deleteProgressByCandidateAndPost);

// Route upsert (créer ou mettre à jour)
router.post('/candidate/:candidateId/post/:postId/upsert', candidatePostStepProgressController.upsertProgress);

module.exports = router;