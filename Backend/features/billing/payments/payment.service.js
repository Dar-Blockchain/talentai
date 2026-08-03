const Payment = require("./payment.model");
const Profile = require("../../users/profile.model");

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

    return { success: true, data: payment };
  } catch (error) {
    console.error("Error fetching payment by session ID:", error);
    throw error;
  }
};

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

    return { success: true, data: payments, stats };
  } catch (error) {
    console.error("Error fetching user payment history:", error);
    throw error;
  }
};

module.exports.updatePaymentStatusWithProfileLink = async (paymentId, status, additionalData = {}) => {
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

    const payment = await Payment.findById(paymentId);

    if (!payment) {
      const err = new Error("Payment not found");
      err.status = 404;
      throw err;
    }

    payment.status = status;
    if (status === "completed") payment.completedAt = new Date();
    Object.assign(payment, additionalData);
    await payment.save({ validateBeforeSave: true });


    if (status === "completed" && payment.planId && payment.companyProfileId) {
      try {
        const profile = await Profile.findById(payment.companyProfileId);
        if (profile) {
          if (!profile.payments) profile.payments = [];

          if (!profile.payments.includes(paymentId)) {
            profile.payments.push(paymentId);
          }

          const planLimitsChanged = !profile.planLimits || profile.planLimits.toString() !== payment.planId.toString();
          if (planLimitsChanged) {
            profile.planLimits = payment.planId;
          }

          if (!profile.payments.includes(paymentId) || planLimitsChanged) {
            await profile.save();
          }
        }
      } catch (fallbackErr) {
        console.error("⚠️ [Fallback] Error updating profile planLimits:", fallbackErr.message);
      }
    }

    await payment.populate("userId");
    await payment.populate("companyProfileId");
    await payment.populate("planId");

    return { success: true, message: "Payment status updated successfully", data: payment };
  } catch (error) {
    console.error("Error updating payment status with profile link:", error);
    throw error;
  }
};
