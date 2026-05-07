/**
 * Contact Routes
 *
 * Endpoints for contact form submissions
 */
const express = require("express");
const router = express.Router();
const ContactController = require("../controllers/contact.controller");
// Import middlewares
const { requireAuth } = require("../middleware/security/auth.middleware");
const { controledAcces } = require('../middleware/authorize.middleware.js');

// POST /contact — public, no auth required (enterprise inquiry form)
router.post("/", ContactController.submitContactForm);

// POST /contact/enterprise — same handler, public
router.post("/enterprise", ContactController.submitContactForm);

module.exports = router;
