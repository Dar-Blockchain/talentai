const PlanLimits = require("./plan-limits.model");

module.exports.createPlan = async (planData) => {
  if (!planData.name) {
    const err = new Error("Plan name is required");
    err.status = 400;
    throw err;
  }

  const existing = await PlanLimits.findOne({ name: planData.name });
  if (existing) {
    const err = new Error("Plan with this name already exists");
    err.status = 409;
    throw err;
  }

  const plan = await PlanLimits.create(planData);
  return { success: true, message: "Plan created successfully", data: plan };
};

module.exports.getAllPlans = async (filters = {}) => {
  const query = {};
  if (filters.isActive !== undefined) query.isActive = filters.isActive;
  const plans = await PlanLimits.find(query).sort({ createdAt: -1 });
  return { success: true, data: plans, count: plans.length };
};

module.exports.getPlanById = async (planId) => {
  if (!planId) {
    const err = new Error("Plan ID is required");
    err.status = 400;
    throw err;
  }
  const plan = await PlanLimits.findById(planId);
  if (!plan) {
    const err = new Error("Plan not found");
    err.status = 404;
    throw err;
  }
  return { success: true, data: plan };
};

module.exports.updatePlanByName = async (planName, updateData) => {
  if (!planName) {
    const err = new Error("Plan name is required");
    err.status = 400;
    throw err;
  }
  delete updateData.name;
  const plan = await PlanLimits.findOneAndUpdate({ name: planName }, updateData, {
    new: true,
    runValidators: true,
  });
  if (!plan) {
    const err = new Error(`Plan "${planName}" not found`);
    err.status = 404;
    throw err;
  }
  return { success: true, message: "Plan updated successfully", data: plan };
};
