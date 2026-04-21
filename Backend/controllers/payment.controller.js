const paymentService = require("../services/payment.service");
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Get all payments (Admin only)
 */
exports.getAllPayments = async (req, res) => {
  try {
    const { status, userId, companyProfileId, planId } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (userId) filters.userId = userId;
    if (companyProfileId) filters.companyProfileId = companyProfileId;
    if (planId) filters.planId = planId;

    const result = await paymentService.getPayments(filters);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error getting payments:", error);
    return res.status(500).json({
      message: "Failed to fetch payments",
      error: error?.message || "Unknown error",
    });
  }
};

/**
 * Get payment by ID
 */
exports.getPaymentById = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const result = await paymentService.getPaymentById(paymentId);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error getting payment:", error);
    const statusCode = error.status || 500;
    return res.status(statusCode).json({
      message: "Failed to fetch payment",
      error: error?.message || "Unknown error",
    });
  }
};

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
 * Get company's payment history
 */
exports.getCompanyPaymentHistory = async (req, res) => {
  try {
    const { companyProfileId } = req.params;

    if (!companyProfileId) {
      return res.status(400).json({
        message: "Company profile ID is required",
        error: "Missing companyProfileId in request",
      });
    }

    const result = await paymentService.getCompanyPaymentHistory(companyProfileId);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error getting company payment history:", error);
    const statusCode = error.status || 500;
    return res.status(statusCode).json({
      message: "Failed to fetch company payment history",
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

    const updateResult = await paymentService.updatePaymentStatus(
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

/**
 * Get payment statistics for dashboard
 */
exports.getPaymentStats = async (req, res) => {
  try {
    const { startDate, endDate, companyProfileId } = req.query;

    const filters = {};
    if (companyProfileId) filters.companyProfileId = companyProfileId;

    const result = await paymentService.getPayments(filters);
    const payments = result.data;

    // Filter by date if provided
    let filteredPayments = payments;
    if (startDate || endDate) {
      filteredPayments = payments.filter((p) => {
        const paymentDate = new Date(p.createdAt);
        if (startDate && paymentDate < new Date(startDate)) return false;
        if (endDate && paymentDate > new Date(endDate)) return false;
        return true;
      });
    }

    const stats = {
      totalPayments: filteredPayments.length,
      completedPayments: filteredPayments.filter((p) => p.status === "completed").length,
      failedPayments: filteredPayments.filter((p) => p.status === "failed").length,
      pendingPayments: filteredPayments.filter((p) => p.status === "pending").length,
      totalRevenue: filteredPayments
        .filter((p) => p.status === "completed")
        .reduce((sum, p) => sum + p.planPrice, 0),
      averagePaymentValue: filteredPayments.length > 0
        ? (filteredPayments.reduce((sum, p) => sum + p.planPrice, 0) / filteredPayments.length).toFixed(2)
        : 0,
    };

    return res.status(200).json({
      success: true,
      data: stats,
      dateRange: {
        startDate: startDate || null,
        endDate: endDate || null,
      },
    });
  } catch (error) {
    console.error("Error getting payment stats:", error);
    return res.status(500).json({
      message: "Failed to fetch payment statistics",
      error: error?.message || "Unknown error",
    });
  }
};

/**
 * Delete a payment (only pending payments)
 */
exports.deletePayment = async (req, res) => {
  try {
    const { paymentId } = req.params;

    if (!paymentId) {
      return res.status(400).json({
        message: "Payment ID is required",
        error: "Missing paymentId in request",
      });
    }

    const result = await paymentService.deletePayment(paymentId);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error deleting payment:", error);
    const statusCode = error.status || 500;
    return res.status(statusCode).json({
      message: "Failed to delete payment",
      error: error?.message || "Unknown error",
    });
  }
};
