const express = require('express');
const router = express.Router();
const stripeController = require('../controllers/stripeController');

// Route pour créer une session de paiement Stripe
router.post('/create-checkout-session', stripeController.createCheckoutSession);

module.exports = router;
