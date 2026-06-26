const planLimitsService = require("./plan-limits.service");

const handleError = (res, error, defaultStatus = 500) => {
  const status = error?.status || defaultStatus;
  res.status(status).json({ success: false, error: error?.message || "Internal server error" });
};

module.exports.createPlan = async (req, res) => {
  try {
    const { name, postsLimit, monthlyInterviewLimit, durationDays, priceUsd, description, isActive } = req.body;
    const result = await planLimitsService.createPlan({ name, postsLimit, monthlyInterviewLimit, durationDays, priceUsd, description, isActive });
    res.status(201).json(result);
  } catch (error) {
    handleError(res, error, 400);
  }
};

module.exports.getAllPlans = async (req, res) => {
  try {
    const filters = {};
    if (req.query.isActive !== undefined) filters.isActive = req.query.isActive === "true";
    const result = await planLimitsService.getAllPlans(filters);
    res.status(200).json(result);
  } catch (error) {
    handleError(res, error);
  }
};

module.exports.getPlanById = async (req, res) => {
  try {
    const result = await planLimitsService.getPlanById(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    handleError(res, error, 404);
  }
};

module.exports.updatePlan = async (req, res) => {
  try {
    const { name, ...updateData } = req.body;
    if (!name) return res.status(400).json({ success: false, error: "Plan name is required in request body" });
    const result = await planLimitsService.updatePlanByName(name, updateData);
    res.status(200).json(result);
  } catch (error) {
    handleError(res, error, 400);
  }
};
