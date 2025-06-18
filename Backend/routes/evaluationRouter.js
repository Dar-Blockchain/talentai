const express = require('express');
const router = express.Router();
const evaluationController  = require('../controllers/evaluationController');

const { requireAuthUser } = require('../middleware/authMiddleware');

// Routes protégées par authentification
router.use(requireAuthUser);


router.post('/generate-questions', evaluationController.generateQuestions);
router.post('/generate-technique-questions', evaluationController.generateTechniqueQuestions);
router.post('/job/:id/generate-technique-questions', evaluationController.generateTechniqueQuestionsForJob);
router.post('/generate-soft-skill-questions', evaluationController.generateSoftSkillQuestions);
router.post('/analyze-profile-answers', evaluationController.analyzeProfileAnswers);
router.post('/analyze-job-test-results', evaluationController.analyzeJobTestResults);

router.post('/generate-onboarding-questions', evaluationController.generateOnboardingQuestions);
router.post('/analyze-onboarding-answers', evaluationController.analyzeOnboardingAnswers);


module.exports = router; 