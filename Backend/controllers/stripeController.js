const Stripe = require('stripe');
require('dotenv').config();

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Create a Stripe Checkout session
exports.createCheckoutSession = async (req, res) => {
  try {
    const { amount, currency, success_url, cancel_url } = req.body;
    if (!amount || !currency || !success_url || !cancel_url) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: 'Payment',
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url,
      cancel_url,
    });
    res.status(200).json({ url: session.url });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
