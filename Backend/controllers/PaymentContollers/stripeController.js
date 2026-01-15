require('dotenv').config();
const stripeService = require('../../services/PaymetServices/stripeService');

// Create Stripe Checkout session
exports.createCheckoutSession = async (req, res) => { 
  try {
    const { planId } = req.body;

    const baseUrl = (process.env.BASE_URL || '').replace(/\/+$/, '');

    const result = await stripeService.createCheckoutSession({ planId, baseUrl });

    // 👉 Maintenant on retourne : url + sessionId
    return res.status(200).json({
      url: result.session.url,
      sessionId: result.sessionId,
      planId: planId
    });

  } catch (error) {
    console.error('Stripe error:', error);
    return res.status(500).json({
      message: 'Payment failed.',
      error: error?.message || 'Unknown error'
    });
  }
};
