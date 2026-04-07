/**
 * Routes de feedback utilisateur
 *
 * Middlewares globaux appliqués:
 * - requireAuthUser: nécessite un utilisateur authentifié
 * - LogMiddleware("Feedback"): journalise les requêtes de feedback
 *
 * Rôles:
 * - Candidate: peut créer un feedback
 * - Admin: peut lister tous les feedbacks
 */
const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedback.controller');

// Auth obligatoire + logs
const {requireAuthUser} = require('../middleware/auth.middleware');
const { controledAcces } = require('../middleware/authorize.middleware.js'); // Importez le middleware
const authLogMiddleware = require("../middleware/security/request-log.middleware.js")

router.use(requireAuthUser, authLogMiddleware("Feedback"));

// POST /feedback/addFeedback
// Accès: Candidate
// Body: { message, rating, ... }
router.post('/addFeedback', controledAcces('Candidate'), feedbackController.create);
// GET /feedback/getAllFeedback
// Accès: Admin
router.get('/getAllFeedback', controledAcces('Admin'), feedbackController.getAllFeedback);

module.exports = router;
