/**
 * Routes de feedback utilisateur
 *
 * Global applied middlewares:
 * - requireAuthUser: requires an authenticated user
 * - LogMiddleware("Feedback"): logs feedback requests
 *
 * Roles:
 * - Candidate: can create a feedback
 * - Admin: peut lister tous les feedbacks
 */
const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedback.controller');

// Auth obligatoire + logs
const {requireAuth} = require('../middleware/security/auth.middleware');
const { controledAcces } = require('../middleware/authorize.middleware.js'); // Importez le middleware
const authLogMiddleware = require("../middleware/security/request-log.middleware.js")


router.use(requireAuth, authLogMiddleware("Feedback"));

/**
 * @openapi
 * /feedback/addFeedback:
 *   post:
 *     tags: [Feedback]
 *     summary: Submit user feedback
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [message]
 *             properties:
 *               message: { type: string }
 *               rating: { type: integer, minimum: 1, maximum: 5 }
 *     responses:
 *       201:
 *         description: Feedback recorded
 */
router.post('/addFeedback', feedbackController.create);

module.exports = router;
