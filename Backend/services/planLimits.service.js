const PlanLimits = require("../models/PlanLimits.model");
const Profile = require("../models/Profile.model");

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
