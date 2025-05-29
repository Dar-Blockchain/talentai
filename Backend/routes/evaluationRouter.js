const express = require('express');
const router = express.Router();
const evaluationController  = require('../controllers/evaluationController');

const { requireAuthUser } = require('../middleware/authMiddleware');

// Routes protégées par authentification
router.use(requireAuthUser);


router.get('/generate-questions', evaluationController.generateQuestions);
router.post('/generate-technique-questions', evaluationController.generateTechniqueQuestions);
router.post('/job/:id/generate-technique-questions', evaluationController.generateTechniqueQuestionsForJob);
router.post('/generate-soft-skill-questions', evaluationController.generateSoftSkillQuestions);
router.post('/analyze-profile-answers', evaluationController.analyzeProfileAnswers2);
router.post('/analyze-job-test-results', evaluationController.analyzeJobTestResults);
module.exports = router; 