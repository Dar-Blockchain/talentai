const Stripe = require('stripe');
require('dotenv').config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create Stripe Checkout session
exports.createCheckoutSession = async (req, res) => {
  try {
    const { amount, currency } = req.body;

    // Validate inputs
    if (!amount || typeof amount !== "number" || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount. Must be a positive number in cents." });
    }

    if (!currency) {
      return res.status(400).json({ message: "Missing currency." });
    }

    // Normalize BASE_URL (remove trailing slash)
    const baseUrl = (process.env.BASE_URL || "").replace(/\/+$/, "");

    const success_url = `${baseUrl}/payment/result?status=success&session_id={CHECKOUT_SESSION_ID}`;
    const cancel_url = `${baseUrl}/payment/result?status=cancel`;

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      success_url,
      cancel_url,
      line_items: [
        {
          price_data: {
            currency,
            product_data: { name: "Payment" },
            unit_amount: amount, // amount in cents
          },
          quantity: 1,
        },
      ],
    });

    return res.status(200).json({ url: session.url });

  } catch (error) {
    console.error("Stripe error:", error);

    return res.status(500).json({
      message: "Payment failed.",
      error: error?.message || "Unknown error",
    });
  }
};
