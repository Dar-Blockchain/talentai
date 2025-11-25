require('dotenv').config();
const stripeService = require('../services/stripeService');

// Create Stripe Checkout session (delegates business logic to service)
exports.createCheckoutSession = async (req, res) => {
  try {
    const { planId } = req.body;

    const baseUrl = (process.env.BASE_URL || '').replace(/\/+$/,'');

    const session = await stripeService.createCheckoutSession({ planId, baseUrl });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Stripe error:', error);
    return res.status(500).json({ message: 'Payment failed.', error: error?.message || 'Unknown error' });
  }
};
