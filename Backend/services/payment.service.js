const Payment = require("../models/Payment.model");
const Profile = require("../models/Profile.model");
const PlanLimits = require("../models/PlanLimits.model");

/**
 * Get all payments with filters
 */
module.exports.getPayments = async (filters = {}) => {
  try {
    const query = {};

    if (filters.userId) {
      query.userId = filters.userId;
    }
    if (filters.companyProfileId) {
      query.companyProfileId = filters.companyProfileId;
    }
    if (filters.status) {
      query.status = filters.status;
    }
    if (filters.planId) {
      query.planId = filters.planId;
    }

    const payments = await Payment.find(query)
      .populate("userId", "email")
      .populate("companyProfileId", "companyName")
      .populate("planId", "name priceUsd")
      .sort({ createdAt: -1 });

    return {
      success: true,
      data: payments,
      count: payments.length,
    };
  } catch (error) {
    console.error("Error fetching payments:", error);
    throw error;
  }
};

/**
 * Get payment by ID
 */
module.exports.getPaymentById = async (paymentId) => {
  try {
    if (!paymentId) {
      const err = new Error("Payment ID is required");
      err.status = 400;
      throw err;
    }

    const payment = await Payment.findById(paymentId)
      .populate("userId", "email")
      .populate("companyProfileId", "companyName")
      .populate("planId");

    if (!payment) {
      const err = new Error("Payment not found");
      err.status = 404;
      throw err;
    }

    return {
      success: true,
      data: payment,
    };
  } catch (error) {
    console.error("Error fetching payment:", error);
    throw error;
  }
};

/**
 * Get payment by Stripe session ID
 */
module.exports.getPaymentByStripeSessionId = async (stripeSessionId) => {
  try {
    if (!stripeSessionId) {
      const err = new Error("Stripe session ID is required");
      err.status = 400;
      throw err;
    }

    const payment = await Payment.findOne({ stripeSessionId })
      .populate("userId")
      .populate("companyProfileId")
      .populate("planId");

    if (!payment) {
      const err = new Error("Payment not found");
      err.status = 404;
      throw err;
    }

    return {
      success: true,
      data: payment,
    };
  } catch (error) {
    console.error("Error fetching payment by session ID:", error);
    throw error;
  }
};

/**
 * Update payment status
 */
module.exports.updatePaymentStatus = async (paymentId, status, additionalData = {}) => {
  try {
    if (!paymentId) {
      const err = new Error("Payment ID is required");
      err.status = 400;
      throw err;
    }

    const validStatuses = ["pending", "completed", "failed", "cancelled"];
    if (!validStatuses.includes(status)) {
      const err = new Error(`Invalid status. Must be one of: ${validStatuses.join(", ")}`);
      err.status = 400;
      throw err;
    }

    const updateData = { status };

    // If marking as completed, add completion date
    if (status === "completed") {
      updateData.completedAt = new Date();
    }

    // Add any additional data
    Object.assign(updateData, additionalData);

    const payment = await Payment.findByIdAndUpdate(
      paymentId,
      updateData,
      { new: true, runValidators: true }
    )
      .populate("userId")
      .populate("companyProfileId")
      .populate("planId");

    if (!payment) {
      const err = new Error("Payment not found");
      err.status = 404;
      throw err;
    }

    return {
      success: true,
      message: "Payment status updated successfully",
      data: payment,
    };
  } catch (error) {
    console.error("Error updating payment status:", error);
    throw error;
  }
};

/**
 * Get user's payment history
 */
module.exports.getUserPaymentHistory = async (userId) => {
  try {
    if (!userId) {
      const err = new Error("User ID is required");
      err.status = 400;
      throw err;
    }

    const payments = await Payment.find({ userId })
      .populate("planId", "name priceUsd postsLimit monthlyInterviewLimit")
      .sort({ createdAt: -1 });

    const stats = {
      totalPayments: payments.length,
      completedPayments: payments.filter((p) => p.status === "completed").length,
      totalSpent: payments
        .filter((p) => p.status === "completed")
        .reduce((sum, p) => sum + p.planPrice, 0),
      lastPayment: payments[0] || null,
    };

    return {
      success: true,
      data: payments,
      stats,
    };
  } catch (error) {
    console.error("Error fetching user payment history:", error);
    throw error;
  }
};

/**
 * Get company's payment history
 */
module.exports.getCompanyPaymentHistory = async (companyProfileId) => {
  try {
    if (!companyProfileId) {
      const err = new Error("Company profile ID is required");
      err.status = 400;
      throw err;
    }

    const payments = await Payment.find({ companyProfileId })
      .populate("userId", "email")
      .populate("planId", "name priceUsd postsLimit monthlyInterviewLimit")
      .sort({ createdAt: -1 });

    const stats = {
      totalPayments: payments.length,
      completedPayments: payments.filter((p) => p.status === "completed").length,
      totalSpent: payments
        .filter((p) => p.status === "completed")
        .reduce((sum, p) => sum + p.planPrice, 0),
      lastPayment: payments[0] || null,
    };

    return {
      success: true,
      data: payments,
      stats,
    };
  } catch (error) {
    console.error("Error fetching company payment history:", error);
    throw error;
  }
};

/**
 * Delete payment record (only for pending payments)
 */
module.exports.deletePayment = async (paymentId) => {
  try {
    if (!paymentId) {
      const err = new Error("Payment ID is required");
      err.status = 400;
      throw err;
    }

    const payment = await Payment.findById(paymentId);

    if (!payment) {
      const err = new Error("Payment not found");
      err.status = 404;
      throw err;
    }

    // Only allow deletion of pending payments
    if (payment.status !== "pending") {
      const err = new Error("Can only delete pending payments");
      err.status = 400;
      throw err;
    }

    await Payment.findByIdAndDelete(paymentId);

    return {
      success: true,
      message: "Payment deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting payment:", error);
    throw error;
  }
};
