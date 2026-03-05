/**
 * Contact Routes
 *
 * Endpoints for contact form submissions
 */
const express = require("express");
const router = express.Router();
const ContactController = require("../controllers/contact.controller");

// POST /contact
// Description: Submit a contact form with name, email, company, and message
router.post("/", ContactController.submitContactForm);

// GET /contact/status
// Description: Check if contact service is operational
router.get("/status", ContactController.getContactStatus);

module.exports = router;
