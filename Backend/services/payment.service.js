const Payment = require("../models/payment.model");
const Profile = require("../models/Profile.model");
const PlanLimits = require("../models/PlanLimits.model");
const subscriptionService = require("./subscription.service");

/**
 * PAYMENT SERVICE - Refactored with Subscription Model
 * 
 * NOTE: Plan usage tracking has been moved to subscription.service.js
 * The Payment model now creates Subscriptions automatically via post-save hooks.
 * 
 * For checking limits and tracking usage, use subscription.service methods:
 * - subscriptionService.checkSubscriptionLimit()
 * - subscriptionService.incrementUsage()
 * - subscriptionService.resetMonthlyInterviewIfNeeded()
 * 
 * @see subscription.service.js for subscription management
 * @see Subscription.model.js for subscription data structure
 */

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
 * Update payment status with automatic profile linking
 * @param {string} paymentId - Payment ID
 * @param {string} status - New status
 * @param {object} additionalData - Additional data to update
 * @returns {object} - Updated payment with profile linked
 */
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

    // Find the payment first
    const payment = await Payment.findById(paymentId);

    if (!payment) {
      const err = new Error("Payment not found");
      err.status = 404;
      throw err;
    }

    // Update fields
    payment.status = status;

    // If marking as completed, add completion date
    if (status === "completed") {
      payment.completedAt = new Date();
    }

    // Add any additional data
    Object.assign(payment, additionalData);

    // Save the payment (this will trigger post-save hook for profile linking)
    await payment.save({ validateBeforeSave: true });

    console.log(`📌 [updatePaymentStatusWithProfileLink] Payment ${paymentId} status updated to: ${status}`);

    // ✅ FALLBACK: Explicitly update profile planLimits if payment is completed
    if (status === "completed" && payment.planId && payment.companyProfileId) {
      try {
        const profile = await Profile.findById(payment.companyProfileId);
        if (profile) {
          // Ensure payments array exists
          if (!profile.payments) {
            profile.payments = [];
          }

          // Add payment to profile if not already there
          if (!profile.payments.includes(paymentId)) {
            profile.payments.push(paymentId);
            console.log(`✅ [Fallback] Payment ${paymentId} added to profile payments array`);
          }

          // Update planLimits with payment's plan
          const planLimitsChanged = !profile.planLimits || profile.planLimits.toString() !== payment.planId.toString();
          if (planLimitsChanged) {
            profile.planLimits = payment.planId;
            console.log(`✅ [Fallback] Profile planLimits updated to: ${payment.planId}`);
          }

          // Save profile if changes were made
          if (!profile.payments.includes(paymentId) || planLimitsChanged) {
            await profile.save();
            console.log(`✅ [Fallback] Profile ${payment.companyProfileId} saved with updated planLimits and payments`);
          }
        }
      } catch (fallbackErr) {
        console.error("⚠️ [Fallback] Error updating profile planLimits:", fallbackErr.message);
        // Continue - payment status is already updated
      }
    }

    // Populate relations for response
    await payment.populate("userId");
    await payment.populate("companyProfileId");
    await payment.populate("planId");

    return {
      success: true,
      message: "Payment status updated successfully",
      data: payment,
    };
  } catch (error) {
    console.error("Error updating payment status with profile link:", error);
    throw error;
  }
};
