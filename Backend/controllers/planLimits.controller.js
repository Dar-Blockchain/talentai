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
 * POST /planLimits - Create a new plan
 */
module.exports.createPlan = async (req, res) => {
  try {
    const { name, postsLimit, candidateUnlockLimit, monthlyInterviewLimit, description, isActive } = req.body;

    const result = await planLimitsService.createPlan({
      name,
      postsLimit,
      candidateUnlockLimit,
      monthlyInterviewLimit,
      description,
      isActive,
    });

    res.status(201).json(result);
  } catch (error) {
    handleError(res, error, 400);
  }
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
 * GET /planLimits/:id - Get plan by ID
 */
module.exports.getPlanById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await planLimitsService.getPlanById(id);

    res.status(200).json(result);
  } catch (error) {
    handleError(res, error, 404);
  }
};

/**
 * PUT /planLimits/:id - Update plan by ID
 */
module.exports.updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const result = await planLimitsService.updatePlan(id, updateData);

    res.status(200).json(result);
  } catch (error) {
    handleError(res, error, 400);
  }
};
