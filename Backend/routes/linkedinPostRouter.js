const express = require('express');
const router = express.Router();
const linkedinPostController  = require('../controllers/linkedinPostController');

const { requireAuthUser } = require('../middleware/authMiddleware');

// Routes protégées par authentification
router.use(requireAuthUser);

//router.get('/generate-questions', (req, res) => {
//  res.json({ message: 'Endpoint is active. Please use POST method with required skills and experience.' });
//});


router.post('/generate-job-post', linkedinPostController.generateJobPost);

module.exports = router; 