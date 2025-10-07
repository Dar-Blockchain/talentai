/**
 * Routes d'évaluation (génération/analyse de questions et réponses)
 *
 * Middlewares globaux appliqués:
 * - requireAuthUser: nécessite un utilisateur authentifié
 * - controledAcces('Candidat'): restreint aux rôles Candidat
 * - LogMiddleware("Evaluation"): journalise les requêtes d'évaluation
 */
const express = require('express');
const router = express.Router();
const evaluationController  = require('../controllers/evaluationController');

// Import des middlewares
const { requireAuthUser } = require('../middleware/authMiddleware');
const { controledAcces } = require('../middleware/controledAcces'); // Importez le middleware
const authLogMiddleware = require("../middleware/SystemeLogs/LogMiddleware")


// Toutes les routes ci-dessous nécessitent un utilisateur Candidat authentifié
router.use(requireAuthUser, controledAcces('Candidat'), authLogMiddleware("Evaluation"));


// POST /evaluation/generate-questions
// Description: Génère un set de questions générales d'évaluation
router.post('/generate-questions', evaluationController.generateQuestions);
// POST /evaluation/generate-technique-questions
// Description: Génère des questions techniques génériques
router.post('/generate-technique-questions', evaluationController.generateTechniqueQuestions);
// POST /evaluation/job/:id/generate-technique-questions
// Params: id (identifiant du job)
// Description: Génère des questions techniques spécifiques à un job
router.post('/job/:id/generate-technique-questions', requireAuthUser, evaluationController.generateTechniqueQuestionsForJob);
// POST /evaluation/generate-soft-skill-questions
// Description: Génère des questions d'évaluation soft skills
router.post('/generate-soft-skill-questions', evaluationController.generateSoftSkillQuestions);
// POST /evaluation/analyze-profile-answers
// Description: Analyse les réponses d'un profil aux questions générales
router.post('/analyze-profile-answers', evaluationController.analyzeProfileAnswers);
// POST /evaluation/analyze-job-test-results
// Description: Analyse les résultats d'un test d'évaluation lié à un job
router.post('/analyze-job-test-results', evaluationController.analyzeJobTestResults);

// POST /evaluation/generate-onboarding-questions
// Description: Génère des questions pour l'onboarding
router.post('/generate-onboarding-questions', evaluationController.generateOnboardingQuestions);
// POST /evaluation/analyze-onboarding-answers
// Description: Analyse les réponses d'onboarding
router.post('/analyze-onboarding-answers', evaluationController.analyzeOnboardingAnswers);

router.post('/Test-AI/analyze-onboarding-answers', evaluationController.testAIanalyzeOnboardingAnswers);

// POST /evaluation/generate-hr-questions
// Description: Génère des questions RH (ressources humaines)
router.post('/generate-hr-questions', evaluationController.generateHRQuestions);
// POST /evaluation/analyze-hr-answers
// Description: Analyse les réponses aux questions RH
router.post('/analyze-hr-answers', evaluationController.analyzeHRAnswers);

module.exports = router; 