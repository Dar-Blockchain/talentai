const Stripe = require('stripe');
require('dotenv').config();
const { getPlanById } = require('../controllers/paymentController');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

exports.createCheckoutSession = async ({ planId, baseUrl }) => {
  try {
    // Must await
    const plan = await getPlanById(planId);

    if (!plan) {
      throw new Error('Invalid plan ID.');
    }

    console.log('Selected plan:', plan);

    // Stripe wants amount in cents
    const amount = Math.round(plan.priceUsd * 100); // e.g. 199 → 19900
    const currency = "usd";

    const normalizedBase = (baseUrl || '').replace(/\/+$/, '');
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
            product_data: { name: plan.name || 'Payment Plan' },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
    });

    return session;
  } catch (err) {
    console.error('❌ Error creating Stripe checkout session:', err);
    throw err;
  }
};
