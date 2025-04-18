const express = require('express');
const router = express.Router();
const evaluationController  = require('../controllers/evaluationController');

const { requireAuthUser } = require('../middleware/authMiddleware');

// Routes protégées par authentification
router.use(requireAuthUser);

//router.get('/generate-questions', (req, res) => {
//  res.json({ message: 'Endpoint is active. Please use POST method with required skills and experience.' });
//});

router.get('/generate-questions', evaluationController.generateQuestions);
router.post('/generate-technique-questions', evaluationController.generateTechniqueQuestions);
router.post('/generate-soft-skill-questions', evaluationController.generateSoftSkillQuestions);
router.post('/match-profiles-with-company', evaluationController.matchProfilesWithCompany);

module.exports = router; 