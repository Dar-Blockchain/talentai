const planLimitsService = require("../services/planLimits.service");

// Centralized error handler
const handleError = (res, error, defaultStatus = 500) => {
  console.error("PlanLimits error:", error?.message || error);
  const status = error?.status || defaultStatus;
  res.status(status).json({
    success: false,
    error: error?.message || "Internal server error",
  });
};

/**
 * GET /planLimits - Get all plans with optional filters
 */
module.exports.getAllPlans = async (req, res) => {
  try {
    const { isActive } = req.query;

    const filters = {};
    if (isActive !== undefined) {
      filters.isActive = isActive === "true";
    }

    const result = await planLimitsService.getAllPlans(filters);

    res.status(200).json(result);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * PUT /planLimits - Update plan by name (passed in body)
 * Body: { name: "Trial", postsLimit: 10, ... }
 */
module.exports.updatePlan = async (req, res) => {
  try {
    const { name, ...updateData } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: "Plan name is required in request body",
      });
    }

    const result = await planLimitsService.updatePlanByName(name, updateData);

    res.status(200).json(result);
  } catch (error) {
    handleError(res, error, 400);
  }
};
