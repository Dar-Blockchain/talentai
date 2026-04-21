const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const { requireAuth } = require('../middleware/security/auth.middleware');

// ✅ Route to create a Stripe payment session
const stripeController = require("../controllers/stripe.controller");

router.post("/create-checkout-session", requireAuth, stripeController.createCheckoutSession);

module.exports = router;
