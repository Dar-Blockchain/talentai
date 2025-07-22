const express = require('express');
const router = express.Router();
const repoAnalyzerController = require('../controllers/repoAnalyzerController');

router.post('/analyze/:projectId', repoAnalyzerController.analyzeGithubRepo);

module.exports = router; 