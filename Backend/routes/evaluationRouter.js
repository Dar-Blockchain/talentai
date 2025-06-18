const express = require('express');
const router = express.Router();
const evaluationController  = require('../controllers/evaluationController');

const { requireAuthUser } = require('../middleware/authMiddleware');

// Routes protégées par authentification
router.use(requireAuthUser);
const authLogMiddleware = require("../middleware/SystemeLogs/LogMiddleware")


router.post('/generate-questions',authLogMiddleware("GenQuestion"), evaluationController.generateQuestions);
router.post('/generate-technique-questions',authLogMiddleware("GenQuestion"), evaluationController.generateTechniqueQuestions);
router.post('/job/:id/generate-technique-questions',authLogMiddleware("analyse"), evaluationController.generateTechniqueQuestionsForJob);
router.post('/generate-soft-skill-questions',authLogMiddleware("GenQuestion"), evaluationController.generateSoftSkillQuestions);
router.post('/analyze-profile-answers',authLogMiddleware("analyse"), evaluationController.analyzeProfileAnswers);
router.post('/analyze-job-test-results',authLogMiddleware("analyse"), evaluationController.analyzeJobTestResults);

router.post('/generate-onboarding-questions',authLogMiddleware("GenQuestion"), evaluationController.generateOnboardingQuestions);
router.post('/analyze-onboarding-answers',authLogMiddleware("analyse"), evaluationController.analyzeOnboardingAnswers);


module.exports = router; 