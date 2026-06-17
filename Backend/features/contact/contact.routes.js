const express = require("express");
const router = express.Router();
const ContactController = require("./contact.controller");

router.post("/", ContactController.submitContactForm);

module.exports = router;
