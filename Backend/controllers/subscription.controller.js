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
 * GET /subscriptions/active/:companyProfileId
 * Get active subscription for a company
 */
module.exports.getActiveSubscription = async (req, res) => {
  try {
    const companyProfileId = req.user.profile;
    console.log(`Fetching active subscription for company profile: ${req.user}`);

    const result = await subscriptionService.getActiveSubscription(companyProfileId);

    res.status(200).json(result);
  } catch (error) {
    handleError(res, error, 404);
  }
};

/**
 * GET /subscriptions/:companyProfileId
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
 * GET /subscriptions/:subscriptionId/details
 * Get detailed subscription info
 */
module.exports.getSubscriptionDetails = async (req, res) => {
  try {
    const { subscriptionId } = req.params;

    const result = await subscriptionService.getSubscriptionDetails(
      subscriptionId
    );

    res.status(200).json(result);
  } catch (error) {
    handleError(res, error, 404);
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
 * GET /subscriptions/:companyProfileId/check-limit/:limitType
 * Check if company can perform an action (posts or monthlyInterviews)
 */
module.exports.checkLimit = async (req, res) => {
  try {
    const { companyProfileId, limitType } = req.params;

    const result = await subscriptionService.checkSubscriptionLimit(
      companyProfileId,
      limitType
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    handleError(res, error, 400);
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
