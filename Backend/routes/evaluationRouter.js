const express = require('express');
const router = express.Router();
const evaluationController  = require('../controllers/evaluationController');

// Importez les middlewares
const { requireAuthUser } = require('../middleware/authMiddleware');
const { controledAcces } = require('../middleware/controledAcces'); // Importez le middleware
const authLogMiddleware = require("../middleware/SystemeLogs/LogMiddleware")


// Routes protégées par authentification
router.use(controledAcces('Candidat'), authLogMiddleware("Evaluation"));


router.post('/generate-questions', evaluationController.generateQuestions);
router.post('/generate-technique-questions', evaluationController.generateTechniqueQuestions);
router.post('/job/:id/generate-technique-questions',requireAuthUser, evaluationController.generateTechniqueQuestionsForJob);
router.post('/generate-soft-skill-questions', evaluationController.generateSoftSkillQuestions);
router.post('/analyze-profile-answers', evaluationController.analyzeProfileAnswers);
router.post('/analyze-job-test-results', evaluationController.analyzeJobTestResults);

router.post('/generate-onboarding-questions', evaluationController.generateOnboardingQuestions);
router.post('/analyze-onboarding-answers', evaluationController.analyzeOnboardingAnswers);

router.post('/generate-hr-questions', evaluationController.generateHRQuestions);
router.post('/analyze-hr-answers', evaluationController.analyzeHRAnswers);

module.exports = router; 