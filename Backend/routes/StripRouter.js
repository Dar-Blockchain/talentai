const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// ✅ Route pour créer une session de paiement Stripe
const stripeController = require('../controllers/PaymentContollers/stripeController');
router.post('/create-checkout-session', stripeController.createCheckoutSession);

// ✅ Webhook Stripe
const paymentController = require('../controllers/paymentController');
router.post(
  '/webhook',
  bodyParser.raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature'];

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.WEBHOOK_SECRET
      );
    } catch (err) {
      console.error('❌ Webhook error:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Traitement des événements Stripe
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const planId = session.metadata?.planId || 'unknown';

      console.log('🎉 Stripe webhook: checkout.session.completed for plan:', planId);

      // Process asynchronously but respond quickly to Stripe
      (async () => {
        try {
          const result = await paymentController.processStripeSession(session);
          if (!result.success) {
            console.warn('Stripe session processing warning:', result.message);
          } else {
            console.log('Stripe session processed:', result.data);
          }
        } catch (err) {
          console.error('❌ Error processing Stripe session async:', err);
        }
      })();
    }

    // Réponse immédiate à Stripe
    res.status(200).json({ received: true });
  }
);

module.exports = router;
