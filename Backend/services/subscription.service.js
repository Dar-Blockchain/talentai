const Subscription = require("../models/Subscription.model");
const Profile = require("../models/Profile.model");
const PlanLimits = require("../models/PlanLimits.model");

// ========== GET ACTIVE SUBSCRIPTION ==========

/**
 * Get active subscription for a company
 * @param {string} companyProfileId - Company profile ID
 * @returns {object} - { success, data: subscription, message }
 */
module.exports.getActiveSubscription = async (companyProfileId) => {
  try {
    if (!companyProfileId) {
      const err = new Error("Company profile ID is required");
      err.status = 400;
      throw err;
    }

    const subscription = await Subscription.findOne({
      companyProfileId,
      status: "active",
      endDate: { $gt: new Date() },
    })
      .populate("planId")
      .populate("paymentId");

    if (!subscription) {
      const err = new Error("No active subscription found for this company");
      err.status = 404;
      throw err;
    }

    return {
      success: true,
      data: subscription,
    };
  } catch (error) {
    console.error("Error getting active subscription:", error);
    throw error;
  }
};

/**
 * Get all subscriptions for a company (including expired/cancelled)
 * @param {string} companyProfileId - Company profile ID
 * @returns {object} - { success, data: subscriptions }
 */
module.exports.getCompanySubscriptions = async (companyProfileId) => {
  try {
    if (!companyProfileId) {
      const err = new Error("Company profile ID is required");
      err.status = 400;
      throw err;
    }

    const subscriptions = await Subscription.find({ companyProfileId })
      .populate("planId")
      .sort({ createdAt: -1 });

    return {
      success: true,
      data: subscriptions,
      count: subscriptions.length,
    };
  } catch (error) {
    console.error("Error fetching company subscriptions:", error);
    throw error;
  }
};

// ========== CHECK LIMITS ==========

/**
 * Check if company can perform an action based on subscription limits
 * @param {string} companyProfileId - Company profile ID
 * @param {string} limitType - Type of limit: 'posts' or 'monthlyInterviews'
 * @returns {object} - { canUse, message, limitData }
 */
module.exports.checkSubscriptionLimit = async (companyProfileId, limitType) => {
  try {
    const subscription = await Subscription.findOne({
      companyProfileId,
      status: "active",
      endDate: { $gt: new Date() },
    }).populate("planId");

    if (!subscription) {
      return {
        canUse: false,
        message: "No active subscription found",
        limitData: null,
      };
    }

    const planLimits = subscription.planId;
    let used = 0;
    let limit = 0;

    switch (limitType) {
      case "posts":
        used = subscription.postsUsed || 0;
        limit = planLimits.postsLimit || 0;
        break;
      case "monthlyInterviews":
        // Reset if new month
        await this.resetMonthlyInterviewIfNeeded(subscription._id);
        const updated = await Subscription.findById(subscription._id);
        used = updated.monthlyInterviewsUsed || 0;
        limit = planLimits.monthlyInterviewLimit || 0;
        break;
      default:
        throw new Error("Invalid limit type");
    }

    const canUse = used < limit;
    const remaining = Math.max(0, limit - used);

    return {
      canUse,
      message: canUse
        ? `You can create ${remaining} more ${limitType}`
        : `You have reached the maximum ${limitType} (${limit}) for your plan`,
      limitData: {
        used,
        limit,
        remaining,
        planName: planLimits.name,
        subscriptionId: subscription._id,
        expiresAt: subscription.endDate,
      },
    };
  } catch (error) {
    console.error("Error checking subscription limit:", error);
    throw error;
  }
};

// ========== INCREMENT USAGE ==========

/**
 * Increment usage counter in subscription
 * @param {string} subscriptionId - Subscription ID
 * @param {string} usageType - Type: 'postsUsed' or 'monthlyInterviewsUsed'
 * @param {number} amount - Amount to increment (default: 1)
 * @returns {object} - { success, data: updated subscription }
 */
module.exports.incrementUsage = async (subscriptionId, usageType, amount = 1) => {
  try {
    if (!subscriptionId || !usageType) {
      const err = new Error("Subscription ID and usage type are required");
      err.status = 400;
      throw err;
    }

    if (!["postsUsed", "monthlyInterviewsUsed"].includes(usageType)) {
      const err = new Error("Invalid usage type");
      err.status = 400;
      throw err;
    }

    const updateObj = {};
    updateObj[usageType] = amount;

    const subscription = await Subscription.findByIdAndUpdate(
      subscriptionId,
      { $inc: updateObj },
      { new: true }
    ).populate("planId");

    if (!subscription) {
      const err = new Error("Subscription not found");
      err.status = 404;
      throw err;
    }

    console.log(
      `✅ [incrementUsage] ${usageType} incremented by ${amount}. New value: ${subscription[usageType]}`
    );

    return {
      success: true,
      data: subscription,
    };
  } catch (error) {
    console.error("Error incrementing usage:", error);
    throw error;
  }
};

// ========== MONTHLY RESET ==========

/**
 * Reset monthly interview counter if needed (if month has passed)
 * @param {string} subscriptionId - Subscription ID
 * @returns {object} - { success, data: subscription, wasReset }
 */
module.exports.resetMonthlyInterviewIfNeeded = async (subscriptionId) => {
  try {
    const subscription = await Subscription.findById(subscriptionId);

    if (!subscription) {
      const err = new Error("Subscription not found");
      err.status = 404;
      throw err;
    }

    const now = new Date();
    const lastReset = subscription.lastMonthlyResetDate || subscription.createdAt;

    // Check if a month has passed
    const daysDifference = Math.floor(
      (now - lastReset) / (1000 * 60 * 60 * 24)
    );
    const monthsPassed = daysDifference / 30;

    if (monthsPassed >= 1) {
      subscription.monthlyInterviewsUsed = 0;
      subscription.lastMonthlyResetDate = now;
      await subscription.save();

      console.log(`✅ [resetMonthlyInterview] Reset for subscription ${subscriptionId}`);

      return {
        success: true,
        data: subscription,
        wasReset: true,
      };
    }

    return {
      success: true,
      data: subscription,
      wasReset: false,
    };
  } catch (error) {
    console.error("Error resetting monthly interview:", error);
    throw error;
  }
};

// ========== CANCEL SUBSCRIPTION ==========

/**
 * Cancel a subscription
 * @param {string} subscriptionId - Subscription ID
 * @param {string} reason - Cancellation reason
 * @returns {object} - { success, data: subscription }
 */
module.exports.cancelSubscription = async (subscriptionId, reason = "") => {
  try {
    const subscription = await Subscription.findById(subscriptionId);

    if (!subscription) {
      const err = new Error("Subscription not found");
      err.status = 404;
      throw err;
    }

    await subscription.cancel(reason);

    console.log(`✅ Subscription ${subscriptionId} cancelled`);

    return {
      success: true,
      data: subscription,
      message: "Subscription cancelled successfully",
    };
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    throw error;
  }
};

// ========== EXTEND SUBSCRIPTION ==========

/**
 * Extend subscription end date
 * @param {string} subscriptionId - Subscription ID
 * @param {number} additionalDays - Days to add
 * @returns {object} - { success, data: subscription }
 */
module.exports.extendSubscription = async (subscriptionId, additionalDays = 30) => {
  try {
    const subscription = await Subscription.findById(subscriptionId);

    if (!subscription) {
      const err = new Error("Subscription not found");
      err.status = 404;
      throw err;
    }

    const newEndDate = new Date(subscription.endDate);
    newEndDate.setDate(newEndDate.getDate() + additionalDays);

    subscription.endDate = newEndDate;
    await subscription.save();

    console.log(
      `✅ Subscription ${subscriptionId} extended to ${newEndDate.toISOString()}`
    );

    return {
      success: true,
      data: subscription,
      message: `Subscription extended by ${additionalDays} days`,
    };
  } catch (error) {
    console.error("Error extending subscription:", error);
    throw error;
  }
};

// ========== RENEW SUBSCRIPTION ==========

/**
 * Renew subscription (create a new one from the same plan)
 * @param {string} subscriptionId - Current subscription ID
 * @returns {object} - { success, data: newSubscription }
 */
module.exports.renewSubscription = async (subscriptionId) => {
  try {
    const oldSubscription = await Subscription.findById(subscriptionId).populate(
      "planId"
    );

    if (!oldSubscription) {
      const err = new Error("Subscription not found");
      err.status = 404;
      throw err;
    }

    const newStartDate = new Date();
    const newEndDate = new Date();
    const durationDays = oldSubscription.planId.durationDays || 30;
    newEndDate.setDate(newEndDate.getDate() + durationDays);

    const newSubscription = await Subscription.create({
      companyProfileId: oldSubscription.companyProfileId,
      planId: oldSubscription.planId,
      startDate: newStartDate,
      endDate: newEndDate,
      status: "active",
      autoRenew: oldSubscription.autoRenew,
    });

    // Update profile with new active subscription
    const profile = await Profile.findByIdAndUpdate(
      oldSubscription.companyProfileId,
      {
        activeSubscription: newSubscription._id,
        $push: { subscriptions: newSubscription._id },
      },
      { new: true }
    );

    console.log(`✅ Subscription renewed. New subscription: ${newSubscription._id}`);

    return {
      success: true,
      data: newSubscription,
      message: "Subscription renewed successfully",
    };
  } catch (error) {
    console.error("Error renewing subscription:", error);
    throw error;
  }
};

// ========== SUBSCRIPTION INFO ==========

/**
 * Get detailed subscription info with plan limits and usage
 * @param {string} subscriptionId - Subscription ID
 * @returns {object} - { success, data: detailed subscription info }
 */
module.exports.getSubscriptionDetails = async (subscriptionId) => {
  try {
    const subscription = await Subscription.findById(subscriptionId)
      .populate("planId")
      .populate("paymentId");

    if (!subscription) {
      const err = new Error("Subscription not found");
      err.status = 404;
      throw err;
    }

    const planLimits = subscription.planId;

    return {
      success: true,
      data: {
        id: subscription._id,
        status: subscription.status,
        planName: planLimits.name,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        daysRemaining: subscription.daysRemaining,
        isActive: subscription.isActive,
        usage: {
          posts: {
            used: subscription.postsUsed,
            limit: planLimits.postsLimit,
            remaining: Math.max(0, planLimits.postsLimit - subscription.postsUsed),
            percentageUsed: subscription.percentageUsed,
          },
          monthlyInterviews: {
            used: subscription.monthlyInterviewsUsed,
            limit: planLimits.monthlyInterviewLimit,
            remaining: Math.max(
              0,
              planLimits.monthlyInterviewLimit - subscription.monthlyInterviewsUsed
            ),
          },
        },
        autoRenew: subscription.autoRenew,
        createdAt: subscription.createdAt,
        updatedAt: subscription.updatedAt,
      },
    };
  } catch (error) {
    console.error("Error getting subscription details:", error);
    throw error;
  }
};

// ========== BULK OPERATIONS ==========

/**
 * Mark expired subscriptions as expired
 * Called by a cron job
 * @returns {object} - { success, count: number of updated subscriptions }
 */
module.exports.markExpiredSubscriptions = async () => {
  try {
    const now = new Date();

    const result = await Subscription.updateMany(
      {
        status: { $ne: "expired" },
        endDate: { $lte: now },
      },
      {
        status: "expired",
      }
    );

    console.log(`✅ Marked ${result.modifiedCount} subscriptions as expired`);

    return {
      success: true,
      count: result.modifiedCount,
    };
  } catch (error) {
    console.error("Error marking expired subscriptions:", error);
    throw error;
  }
};
