const express = require('express');
const router = express.Router();
const { generateQuestions } = require('../controllers/evaluationController');

const { requireAuthUser } = require('../middleware/authMiddleware');

// Routes protégées par authentification
router.use(requireAuthUser);

//router.get('/generate-questions', (req, res) => {
//  res.json({ message: 'Endpoint is active. Please use POST method with required skills and experience.' });
//});

router.get('/generate-questions', generateQuestions);

module.exports = router; 