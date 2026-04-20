const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// ✅ Route to create a Stripe payment session
const stripeController = require("../controllers/stripe.controller");

router.post("/create-checkout-session", stripeController.createCheckoutSession);

module.exports = router;
