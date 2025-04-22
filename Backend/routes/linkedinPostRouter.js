const express = require('express');
const router = express.Router();
const linkedinPostController  = require('../controllers/linkedinPostController');

const { requireAuthUser } = require('../middleware/authMiddleware');

// Routes protégées par authentification
router.use(requireAuthUser);

router.post('/generate-job-post', linkedinPostController.generateJobPost);

module.exports = router; 