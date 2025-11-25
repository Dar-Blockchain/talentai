require('dotenv').config();
const stripeService = require('../services/stripeService');

// Create Stripe Checkout session (delegates business logic to service)
exports.createCheckoutSession = async (req, res) => {
  try {
    const { amount, currency } = req.body;

    // Basic validation kept in controller for faster feedback
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount. Must be a positive number in cents.' });
    }
    if (!currency) {
      return res.status(400).json({ message: 'Missing currency.' });
    }

    const baseUrl = (process.env.BASE_URL || '').replace(/\/+$/,'');

    const session = await stripeService.createCheckoutSession({ amount, currency, baseUrl });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Stripe error:', error);
    return res.status(500).json({ message: 'Payment failed.', error: error?.message || 'Unknown error' });
  }
};
