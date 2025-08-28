/**
 * Routes de feedback utilisateur
 *
 * Middlewares globaux appliqués:
 * - requireAuthUser: nécessite un utilisateur authentifié
 * - LogMiddleware("Feedback"): journalise les requêtes de feedback
 *
 * Rôles:
 * - Candidat: peut créer un feedback
 * - Admin: peut lister tous les feedbacks
 */
const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');

// Auth obligatoire + logs
const {requireAuthUser} = require('../middleware/authMiddleware');
const { controledAcces } = require('../middleware/controledAcces'); // Importez le middleware
const authLogMiddleware = require("../middleware/SystemeLogs/LogMiddleware")


router.use(requireAuthUser, authLogMiddleware("Feedback"));


// POST /feedback/addFeedback
// Accès: Candidat
// Body: { message, rating, ... }
router.post('/addFeedback', controledAcces('Candidat'), feedbackController.create);
// GET /feedback/getAllFeedback
// Accès: Admin
router.get('/getAllFeedback', controledAcces('Admin'), feedbackController.getAllFeedback);

module.exports = router;
