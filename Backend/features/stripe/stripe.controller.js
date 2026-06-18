require("dotenv").config();
const stripeService = require("./stripe.service");
const Profile = require("../users/profile.model");

exports.createCheckoutSession = async (req, res) => {
  try {
    const { planId } = req.body;
    const userId = req.user?._id;

    if (!planId) {
      return res.status(400).json({
        message: "Plan ID is required.",
        error: "Missing planId in request body",
      });
    }

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required.",
        error: "User not authenticated",
      });
    }

    const userProfile = await Profile.findOne({ userId });
    if (!userProfile || userProfile.type !== "Company") {
      return res.status(403).json({
        message: "Only companies can create payment sessions.",
        error: "User profile type must be Company",
      });
    }

    const baseUrl = (process.env.BASE_URL || "").replace(/\/+$/, "");

    if (!baseUrl) {
      return res.status(500).json({
        message: "Server configuration error.",
        error: "BASE_URL is not configured",
      });
    }

    const result = await stripeService.createCheckoutSession({
      planId,
      baseUrl,
      userId,
      companyProfileId: userProfile._id,
    });

    return res.status(200).json({
      url: result.session.url,
      sessionId: result.sessionId,
      planId,
      paymentId: result.paymentId,
    });
  } catch (error) {
    console.error("Stripe error:", error);
    return res.status(500).json({
      message: "Payment failed.",
      error: error?.message || "Unknown error",
    });
  }
};
