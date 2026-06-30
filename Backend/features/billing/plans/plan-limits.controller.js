const planLimitsService = require("./plan-limits.service");

const handleError = (res, error, defaultStatus = 500) => {
  const status = error?.status || defaultStatus;
  res.status(status).json({ success: false, error: error?.message || "Internal server error" });
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
