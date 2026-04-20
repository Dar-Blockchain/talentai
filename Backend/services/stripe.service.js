const Stripe = require("stripe");
require("dotenv").config();
const planLimitsService = require("./planLimits.service");

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

exports.createCheckoutSession = async ({ planId, baseUrl, userId, companyProfileId }) => {
  try {
    const plan = await planLimitsService.getPlanById(planId);

    if (!plan) {
      throw new Error("Invalid plan ID.");
    }

    // ✅ Prevent free plans from going to Stripe
    if (plan.priceUsd <= 0) {
      throw new Error(`Plan "${plan.name}" is free and does not require payment. Assign it directly to the user.`);
    }

    console.log("Selected plan:", plan.name, "- Price:", plan.priceUsd);

    const amount = Math.round(plan.priceUsd * 100); // USD → cents
    const currency = "usd";

    const normalizedBase = (baseUrl || "").replace(/\/+$/, "");
    const success_url = `${normalizedBase}/payment/result?status=success&session_id={CHECKOUT_SESSION_ID}`;
    const cancel_url = `${normalizedBase}/payment/result?status=cancel`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      success_url,
      cancel_url,
      metadata: {
        planId,
        userId: userId.toString(),
        companyProfileId: companyProfileId.toString(),
      },
      line_items: [
        {
          price_data: {
            currency,
            product_data: { name: plan.name || "Payment Plan" },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
    });

    return {
      success: true,
      sessionId: session.id,
      session,
    };
  } catch (err) {
    console.error("❌ Error creating Stripe checkout session:", err.message);
    throw err;
  }
};
