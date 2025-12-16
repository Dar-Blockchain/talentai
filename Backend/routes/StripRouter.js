const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// ✅ Route pour créer une session de paiement Stripe
const stripeController = require('../controllers/PaymentContollers/stripeController');
const paymentController = require('../controllers/paymentController');

router.post('/create-checkout-session', stripeController.createCheckoutSession);

router.post('/complete-payment', paymentController.processStripeSession);


// ✅ Webhook Stripe
router.post(
  '/webhook',
  bodyParser.raw({ type: 'application/json' }),
  // Delegate webhook handling to controller (expects raw body)
  paymentController.handleStripeWebhook
);

module.exports = router;
