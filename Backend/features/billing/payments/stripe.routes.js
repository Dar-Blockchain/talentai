const express = require("express");
const router = express.Router();
const stripeController = require("./stripe.controller");
const { requireAuth } = require("../../../middleware/security/auth.middleware");

router.post("/create-checkout-session", requireAuth, stripeController.createCheckoutSession);

module.exports = router;
