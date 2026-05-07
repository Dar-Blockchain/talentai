const subscriptionService = require("../services/subscription.service");

// Centralized error handler
const handleError = (res, error, defaultStatus = 500) => {
  console.error("Subscription error:", error?.message || error);
  const status = error?.status || defaultStatus;
  res.status(status).json({
    success: false,
    error: error?.message || "Internal server error",
  });
};

/**
 * GET /subscriptions
 * Get all subscriptions for a company
 */
module.exports.getCompanySubscriptions = async (req, res) => {
  try {
    const companyProfileId = req.user.profile;

    const result = await subscriptionService.getCompanySubscriptions(
      companyProfileId
    );

    res.status(200).json(result);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * POST /subscriptions/:subscriptionId/cancel
 * Cancel a subscription
 */
module.exports.cancelSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { reason } = req.body;

    const result = await subscriptionService.cancelSubscription(
      subscriptionId,
      reason
    );

    res.status(200).json(result);
  } catch (error) {
    handleError(res, error, 404);
  }
};

/**
 * POST /subscriptions/:subscriptionId/extend
 * Extend subscription
 */
module.exports.extendSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { additionalDays = 30 } = req.body;

    const result = await subscriptionService.extendSubscription(
      subscriptionId,
      additionalDays
    );

    res.status(200).json(result);
  } catch (error) {
    handleError(res, error, 404);
  }
};

/**
 * POST /subscriptions/:subscriptionId/renew
 * Renew subscription
 */
module.exports.renewSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.params;

    const result = await subscriptionService.renewSubscription(subscriptionId);

    res.status(200).json(result);
  } catch (error) {
    handleError(res, error, 404);
  }
};

/**
 * POST /subscriptions/:subscriptionId/increment-usage
 * Increment usage counter
 */
module.exports.incrementUsage = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { usageType, amount = 1 } = req.body;

    const result = await subscriptionService.incrementUsage(
      subscriptionId,
      usageType,
      amount
    );

    res.status(200).json(result);
  } catch (error) {
    handleError(res, error, 400);
  }
};

/**
 * POST /subscriptions/:subscriptionId/reset-monthly-interview
 * Reset monthly interview counter if needed
 */
module.exports.resetMonthlyInterview = async (req, res) => {
  try {
    const { subscriptionId } = req.params;

    const result = await subscriptionService.resetMonthlyInterviewIfNeeded(
      subscriptionId
    );

    res.status(200).json(result);
  } catch (error) {
    handleError(res, error, 404);
  }
};

/**
 * POST /subscriptions/:subscriptionId/enable-auto-renew
 * Re-enable auto-renewal on a subscription
 */
module.exports.enableAutoRenew = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const result = await subscriptionService.enableAutoRenew(subscriptionId);
    res.status(200).json(result);
  } catch (error) {
    handleError(res, error, 404);
  }
};

/**
 * GET /subscriptions/combined
 * Get combined usage across all active subscriptions for a company
 */
module.exports.getCombinedActiveDetails = async (req, res) => {
  const safeDefault = {
    success: true,
    data: {
      subscriptions: [],
      combined: {
        planNames: [],
        daysRemaining: 0,
        soonestExpiry: null,
        usage: {
          posts: { used: 0, limit: -1, remaining: -1 },
          monthlyInterviews: { used: 0, limit: -1, remaining: -1 },
        },
      },
    },
  };

  try {
    const companyProfileId = req.user.profile;
    if (!companyProfileId) return res.status(200).json(safeDefault);
    const result = await subscriptionService.getCombinedActiveDetails(companyProfileId);
    res.status(200).json(result);
  } catch (error) {
    if (
      error.status === 404 ||
      error.status === 400 ||
      error.message === "No active subscription found" ||
      error.message === "Company profile ID is required"
    ) {
      return res.status(200).json(safeDefault);
    }
    handleError(res, error, 500);
  }
};
