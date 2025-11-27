const express = require('express');
const router = express.Router();
const InterviewAssessmentController = require('../controllers/InterviewAssessmentController');

// Routes CRUD

// POST - Créer une nouvelle évaluation
// POST /api/interview-assessments
router.post('/', InterviewAssessmentController.create);

// GET - Récupérer toutes les évaluations (avec pagination et filtres)
// GET /api/interview-assessments?page=1&limit=10&status=completed&skill=Node.js
router.get('/', InterviewAssessmentController.getAll);

// GET - Obtenir les statistiques globales
// GET /api/interview-assessments/stats/global
router.get('/stats/global', InterviewAssessmentController.getStatistics);

// GET - Récupérer une évaluation par ID
// GET /api/interview-assessments/:id
router.get('/:id', InterviewAssessmentController.getById);

// GET - Récupérer le résumé d'une évaluation
// GET /api/interview-assessments/:id/summary
router.get('/:id/summary', InterviewAssessmentController.getSummary);

// GET - Récupérer une évaluation par sessionId
// GET /api/interview-assessments/session/:sessionId
router.get('/session/:sessionId', InterviewAssessmentController.getBySessionId);

// GET - Récupérer les évaluations par candidat
// GET /api/interview-assessments/candidate/:candidateId?page=1&limit=10
router.get('/candidate/:candidateId', InterviewAssessmentController.getByCandidate);

// GET - Récupérer les évaluations par compétence
// GET /api/interview-assessments/skill/:skill?page=1&limit=10
router.get('/skill/:skill', InterviewAssessmentController.getBySkill);

// PUT - Mettre à jour une évaluation
// PUT /api/interview-assessments/:id
router.put('/:id', InterviewAssessmentController.update);

// PATCH - Mettre à jour le statut
// PATCH /api/interview-assessments/:id/status
router.patch('/:id/status', InterviewAssessmentController.updateStatus);

// PATCH - Archiver une évaluation
// PATCH /api/interview-assessments/:id/archive
router.patch('/:id/archive', InterviewAssessmentController.archive);

// DELETE - Supprimer une évaluation
// DELETE /api/interview-assessments/:id
router.delete('/:id', InterviewAssessmentController.delete);

module.exports = router;
