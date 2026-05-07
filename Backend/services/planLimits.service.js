const PlanLimits = require("../models/PlanLimits.model");
const Profile = require("../models/Profile.model");

/**
 * Create a new plan
 */
module.exports.createPlan = async (planData) => {
  try {
    if (!planData.name) {
      const err = new Error("Plan name is required");
      err.status = 400;
      throw err;
    }

    const existingPlan = await PlanLimits.findOne({ name: planData.name });
    if (existingPlan) {
      const err = new Error("Plan with this name already exists");
      err.status = 409;
      throw err;
    }

    const plan = new PlanLimits(planData);
    await plan.save();

    return {
      success: true,
      message: "Plan created successfully",
      data: plan,
    };
  } catch (error) {
    console.error("Error creating plan:", error);
    throw error;
  }
};

/**
 * Get all plans
 */
module.exports.getAllPlans = async (filters = {}) => {
  try {
    const query = {};

    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive;
    }

    const plans = await PlanLimits.find(query).sort({ createdAt: -1 });

    return {
      success: true,
      data: plans,
      count: plans.length,
    };
  } catch (error) {
    console.error("Error fetching plans:", error);
    throw error;
  }
};

/**
 * Get plan by ID
 */
module.exports.getPlanById = async (planId) => {
  try {
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

    return {
      success: true,
      data: plan,
    };
  } catch (error) {
    console.error("Error fetching plan:", error);
    throw error;
  }
};

/**
 * Update plan by name (no ID needed)
 */
module.exports.updatePlanByName = async (planName, updateData) => {
  try {
    if (!planName) {
      const err = new Error("Plan name is required");
      err.status = 400;
      throw err;
    }

    // Don't allow changing the name through update
    delete updateData.name;

    const plan = await PlanLimits.findOneAndUpdate(
      { name: planName },
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!plan) {
      const err = new Error(`Plan "${planName}" not found`);
      err.status = 404;
      throw err;
    }

    return {
      success: true,
      message: "Plan updated successfully",
      data: plan,
    };
  } catch (error) {
    console.error("Error updating plan:", error);
    throw error;
  }
};
