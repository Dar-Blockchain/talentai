const Stripe = require('stripe');
require('dotenv').config();

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Create a Stripe Checkout session
 * @param {Object} opts
 * @param {number} opts.amount - amount in cents
 * @param {string} opts.currency - currency code (e.g., 'usd')
 * @param {string} opts.baseUrl - base url for success/cancel redirects
 * @returns {Promise<Object>} Stripe session object
 */
exports.createCheckoutSession = async ({ amount, currency, baseUrl }) => {
  if (!amount || typeof amount !== 'number' || amount <= 0) {
    throw new Error('Invalid amount. Must be a positive number in cents.');
  }
  if (!currency || typeof currency !== 'string') {
    throw new Error('Invalid currency.');
  }
  const normalizedBase = (baseUrl || '').replace(/\/+$/,'');
  const success_url = `${normalizedBase}/payment/result?status=success&session_id={CHECKOUT_SESSION_ID}`;
  const cancel_url = `${normalizedBase}/payment/result?status=cancel`;

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    success_url,
    cancel_url,
    line_items: [
      {
        price_data: {
          currency,
          product_data: { name: 'Payment' },
          unit_amount: amount,
        },
        quantity: 1,
      },
    ],
  });

  return session;
};
