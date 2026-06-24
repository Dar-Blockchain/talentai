const subscriptionService = require("./subscription.service");

const handleError = (res, error, defaultStatus = 500) => {
  console.error("Subscription error:", error?.message || error);
  res.status(error?.status || defaultStatus).json({
    success: false,
    error: error?.message || "Internal server error",
  });
};

module.exports.getActiveSubscription = async (req, res) => {
  try {
    const result = await subscriptionService.getActiveSubscription(req.user.profile);
    res.status(200).json(result);
  } catch (error) {
    handleError(res, error, 404);
  }
};

module.exports.getCompanySubscriptions = async (req, res) => {
  try {
    const result = await subscriptionService.getCompanySubscriptions(req.user.profile);
    res.status(200).json(result);
  } catch (error) {
    handleError(res, error);
  }
};

module.exports.getSubscriptionDetails = async (req, res) => {
  try {
    const result = await subscriptionService.getSubscriptionDetails(req.params.subscriptionId);
    res.status(200).json(result);
  } catch (error) {
    handleError(res, error, 404);
  }
};

module.exports.cancelSubscription = async (req, res) => {
  try {
    const result = await subscriptionService.cancelSubscription(req.params.subscriptionId, req.body.reason);
    res.status(200).json(result);
  } catch (error) {
    handleError(res, error, 404);
  }
};

module.exports.checkLimit = async (req, res) => {
  try {
    const { companyProfileId, limitType } = req.params;
    const result = await subscriptionService.checkSubscriptionLimit(companyProfileId, limitType);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    handleError(res, error, 400);
  }
};

module.exports.enableAutoRenew = async (req, res) => {
  try {
    const result = await subscriptionService.enableAutoRenew(req.params.subscriptionId);
    res.status(200).json(result);
  } catch (error) {
    handleError(res, error, 404);
  }
};

module.exports.adminCreateSubscription = async (req, res) => {
  try {
    const { companyProfileId, planId, startDate, notes } = req.body;
    const result = await subscriptionService.adminCreateSubscription({ companyProfileId, planId, startDate, notes });
    res.status(201).json(result);
  } catch (error) {
    handleError(res, error, 400);
  }
};

module.exports.searchCompanies = async (req, res) => {
  try {
    const result = await subscriptionService.searchCompanies(req.query.search);
    res.status(200).json(result);
  } catch (error) {
    handleError(res, error);
  }
};

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
