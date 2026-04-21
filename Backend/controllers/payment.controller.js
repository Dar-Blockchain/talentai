const paymentService = require("../services/payment.service");
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Get user's payment history
 */
exports.getUserPaymentHistory = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
        error: "User not authenticated",
      });
    }

    const result = await paymentService.getUserPaymentHistory(userId);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error getting user payment history:", error);
    return res.status(500).json({
      message: "Failed to fetch payment history",
      error: error?.message || "Unknown error",
    });
  }
};

/**
 * Verify and update payment status after Stripe webhook
 */
exports.verifyPaymentStatus = async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        message: "Session ID is required",
        error: "Missing sessionId in request",
      });
    }

    // Fetch session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return res.status(404).json({
        message: "Session not found in Stripe",
        error: "Invalid session ID",
      });
    }

    // Get payment record
    const paymentResult = await paymentService.getPaymentByStripeSessionId(sessionId);
    const payment = paymentResult.data;

    // Update payment status based on Stripe session
    let status = "pending";
    if (session.payment_status === "paid") {
      status = "completed";
    } else if (session.payment_status === "unpaid") {
      status = "pending";
    }

    const updateResult = await paymentService.updatePaymentStatusWithProfileLink(
      payment._id,
      status,
      {
        stripePaymentIntentId: session.payment_intent,
        paymentMethod: session.payment_method_types?.[0],
        stripePriceData: {
          amount_total: session.amount_total,
          currency: session.currency,
          payment_status: session.payment_status,
        },
      }
    );

    return res.status(200).json({
      success: true,
      message: "Payment status verified and updated",
      data: updateResult.data,
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    const statusCode = error.status || 500;
    return res.status(statusCode).json({
      message: "Failed to verify payment",
      error: error?.message || "Unknown error",
    });
  }
};
