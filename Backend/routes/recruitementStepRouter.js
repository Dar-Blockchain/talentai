/**
 * Routes d'analyse de questions pour les étapes de recrutement
 *
 * Middlewares globaux appliqués:
 * - requireAuthUser: nécessite un utilisateur authentifié
 */
const express = require('express');
const router = express.Router();
const recruitementStepController = require('../controllers/recruitementStepController');
const { requireAuthUser } = require('../middleware/authMiddleware');
const authLogMiddleware = require("../middleware/SystemeLogs/LogMiddleware");

// Auth obligatoire pour toutes les routes
//router.use(requireAuthUser);

// GET /recruitment-steps/generate-questions/:postStepId — génère les questions
router.get('/generate-questions/:postStepId', recruitementStepController.generateQuestions);

// POST /recruitment-steps/analyse-questions/:postStepId — analyse les réponses
router.post('/analyse-questions/:postStepId', recruitementStepController.analyseQuestions);

module.exports = router;
