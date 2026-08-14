const Stripe = require("stripe");
require("dotenv").config();
const planLimitsService = require("../plans/plan-limits.service");
const subscriptionService = require("../subscriptions/subscription.service");
const Payment = require("./payment.model");

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

exports.createCheckoutSession = async ({ planId, baseUrl, userId, companyProfileId }) => {
  try {
    const result = await planLimitsService.getPlanById(planId);

    if (!result || !result.data) {
      throw new Error("Plan not found");
    }

    const plan = result.data;

    // Single-active-plan rule: buying a second plan is only allowed when it's
    // an upgrade over the company's current highest active paid plan.
    await subscriptionService.assertUpgradeEligible(companyProfileId, plan);

    const amountCents = Math.round((plan.priceUsd || 0) * 100);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: plan.name, description: plan.description || "" },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/payments/stripe/callback?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/payments/stripe/callback?status=cancel`,
      metadata: { planId: planId.toString(), userId: userId.toString(), companyProfileId: companyProfileId.toString() },
    });

    const payment = await Payment.create({
      userId,
      companyProfileId,
      planId,
      planName: plan.name,
      planPrice: plan.priceUsd || 0,
      stripeSessionId: session.id,
      amountCents,
      currency: "usd",
      status: "pending",
    });

    return { session, sessionId: session.id, paymentId: payment._id };
  } catch (error) {
    throw error;
  }
};
