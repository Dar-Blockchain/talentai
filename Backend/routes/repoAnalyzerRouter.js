const express = require('express');
const router = express.Router();
const repoAnalyzerController = require('../controllers/repoAnalyzerController');


// Importez les middlewares
const { requireAuthUser } = require('../middleware/authMiddleware');
const { controledAcces } = require('../middleware/controledAcces'); // Importez le middleware
const authLogMiddleware = require("../middleware/SystemeLogs/LogMiddleware")


// Routes protégées par authentification
router.use(requireAuthUser,controledAcces('Candidat'), authLogMiddleware("Evaluation"));


router.post('/analyze/:projectId', repoAnalyzerController.analyzeGithubRepo);

module.exports = router; 