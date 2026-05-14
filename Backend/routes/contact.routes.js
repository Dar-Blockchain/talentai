/**
 * Contact Routes
 *
 * Endpoints for contact form submissions
 */
const express = require("express");
const router = express.Router();
const ContactController = require("../controllers/contact.controller");

// POST /contact — public, no auth required (enterprise inquiry form)
router.post("/", ContactController.submitContactForm);

module.exports = router;
