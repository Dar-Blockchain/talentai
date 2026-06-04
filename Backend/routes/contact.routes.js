/**
 * Contact Routes
 *
 * Endpoints for contact form submissions
 */
const express = require("express");
const router = express.Router();
const ContactController = require("../controllers/contact.controller");

/**
 * @openapi
 * /contact:
 *   post:
 *     tags: [Contact]
 *     summary: Submit an enterprise contact / inquiry form (public)
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, message]
 *             properties:
 *               name: { type: string }
 *               email: { type: string, format: email }
 *               company: { type: string }
 *               message: { type: string }
 *     responses:
 *       200:
 *         description: Message received
 */
router.post("/", ContactController.submitContactForm);

module.exports = router;
