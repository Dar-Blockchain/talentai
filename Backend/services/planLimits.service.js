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
 * Update plan by ID
 */
module.exports.updatePlan = async (planId, updateData) => {
  try {
    if (!planId) {
      const err = new Error("Plan ID is required");
      err.status = 400;
      throw err;
    }

    // Prevent updating name to an existing name
    if (updateData.name) {
      const existingPlan = await PlanLimits.findOne({
        name: updateData.name,
        _id: { $ne: planId },
      });
      if (existingPlan) {
        const err = new Error("Plan with this name already exists");
        err.status = 409;
        throw err;
      }
    }

    const plan = await PlanLimits.findByIdAndUpdate(planId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!plan) {
      const err = new Error("Plan not found");
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

/**
 * Delete plan by ID
 */
module.exports.deletePlan = async (planId) => {
  try {
    if (!planId) {
      const err = new Error("Plan ID is required");
      err.status = 400;
      throw err;
    }

    // Check if plan is being used by any company
    const companiesUsingPlan = await Profile.countDocuments({
      planLimits: planId,
      type: "Company",
    });

    if (companiesUsingPlan > 0) {
      const err = new Error(
        `Cannot delete plan. It is being used by ${companiesUsingPlan} company(ies)`
      );
      err.status = 409;
      throw err;
    }

    const plan = await PlanLimits.findByIdAndDelete(planId);

    if (!plan) {
      const err = new Error("Plan not found");
      err.status = 404;
      throw err;
    }

    return {
      success: true,
      message: "Plan deleted successfully",
      data: plan,
    };
  } catch (error) {
    console.error("Error deleting plan:", error);
    throw error;
  }
};

/**
 * Assign plan to company profile
 */
module.exports.assignPlanToCompany = async (companyProfileId, planId) => {
  try {
    if (!companyProfileId || !planId) {
      const err = new Error("Company Profile ID and Plan ID are required");
      err.status = 400;
      throw err;
    }

    // Check if profile exists and is company type
    const profile = await Profile.findById(companyProfileId);
    if (!profile) {
      const err = new Error("Company profile not found");
      err.status = 404;
      throw err;
    }

    if (profile.type !== "Company") {
      const err = new Error("Profile is not a company profile");
      err.status = 400;
      throw err;
    }

    // Check if plan exists
    const plan = await PlanLimits.findById(planId);
    if (!plan) {
      const err = new Error("Plan not found");
      err.status = 404;
      throw err;
    }

    // Assign plan to company
    const updatedProfile = await Profile.findByIdAndUpdate(
      companyProfileId,
      { planLimits: planId },
      { new: true }
    ).populate("planLimits");

    return {
      success: true,
      message: "Plan assigned to company successfully",
      data: updatedProfile,
    };
  } catch (error) {
    console.error("Error assigning plan to company:", error);
    throw error;
  }
};

/**
 * Get company plan usage
 */
module.exports.getCompanyPlanUsage = async (companyProfileId) => {
  try {
    if (!companyProfileId) {
      const err = new Error("Company Profile ID is required");
      err.status = 400;
      throw err;
    }

    const profile = await Profile.findById(companyProfileId).populate(
      "planLimits"
    );

    if (!profile) {
      const err = new Error("Company profile not found");
      err.status = 404;
      throw err;
    }

    if (profile.type !== "Company") {
      const err = new Error("Profile is not a company profile");
      err.status = 400;
      throw err;
    }

    return {
      success: true,
      data: {
        plan: profile.planLimits,
        usage: profile.planUsage,
        remainingPosts: profile.planLimits
          ? profile.planLimits.postsLimit - (profile.planUsage?.postsUsed || 0)
          : 0,
        remainingCandidateUnlocks: profile.planLimits
          ? profile.planLimits.candidateUnlockLimit -
            (profile.planUsage?.candidateUnlocksUsed || 0)
          : 0,
        remainingMonthlyInterviews: profile.planLimits
          ? profile.planLimits.monthlyInterviewLimit -
            (profile.planUsage?.monthlyInterviewsUsed || 0)
          : 0,
      },
    };
  } catch (error) {
    console.error("Error fetching company plan usage:", error);
    throw error;
  }
};

/**
 * Update company usage
 */
module.exports.updateCompanyUsage = async (
  companyProfileId,
  usageData
) => {
  try {
    if (!companyProfileId) {
      const err = new Error("Company Profile ID is required");
      err.status = 400;
      throw err;
    }

    const profile = await Profile.findById(companyProfileId);

    if (!profile) {
      const err = new Error("Company profile not found");
      err.status = 404;
      throw err;
    }

    if (profile.type !== "Company") {
      const err = new Error("Profile is not a company profile");
      err.status = 400;
      throw err;
    }

    // Update usage fields
    if (usageData.postsUsed !== undefined) {
      profile.planUsage.postsUsed = usageData.postsUsed;
    }

    if (usageData.candidateUnlocksUsed !== undefined) {
      profile.planUsage.candidateUnlocksUsed = usageData.candidateUnlocksUsed;
    }

    if (usageData.monthlyInterviewsUsed !== undefined) {
      profile.planUsage.monthlyInterviewsUsed = usageData.monthlyInterviewsUsed;
    }

    if (usageData.lastMonthlyResetDate !== undefined) {
      profile.planUsage.lastMonthlyResetDate = usageData.lastMonthlyResetDate;
    }

    await profile.save();

    return {
      success: true,
      message: "Usage updated successfully",
      data: profile,
    };
  } catch (error) {
    console.error("Error updating company usage:", error);
    throw error;
  }
};

/**
 * Increment company usage counter
 */
module.exports.incrementUsageCounter = async (
  companyProfileId,
  counterType,
  amount = 1
) => {
  try {
    if (!companyProfileId || !counterType) {
      const err = new Error("Company Profile ID and counter type are required");
      err.status = 400;
      throw err;
    }

    const validCounters = [
      "postsUsed",
      "candidateUnlocksUsed",
      "monthlyInterviewsUsed",
    ];

    if (!validCounters.includes(counterType)) {
      const err = new Error(`Invalid counter type. Must be one of: ${validCounters.join(", ")}`);
      err.status = 400;
      throw err;
    }

    const profile = await Profile.findById(companyProfileId);

    if (!profile) {
      const err = new Error("Company profile not found");
      err.status = 404;
      throw err;
    }

    if (profile.type !== "Company") {
      const err = new Error("Profile is not a company profile");
      err.status = 400;
      throw err;
    }

    // Increment counter
    profile.planUsage[counterType] = (profile.planUsage[counterType] || 0) + amount;

    await profile.save();

    return {
      success: true,
      message: `${counterType} incremented successfully`,
      data: profile,
    };
  } catch (error) {
    console.error("Error incrementing usage counter:", error);
    throw error;
  }
};

/**
 * Reset monthly interview counter if needed
 */
module.exports.resetMonthlyInterviewCounterIfNeeded = async (
  companyProfileId
) => {
  try {
    const profile = await Profile.findById(companyProfileId);

    if (!profile) {
      const err = new Error("Company profile not found");
      err.status = 404;
      throw err;
    }

    const lastReset = new Date(profile.planUsage.lastMonthlyResetDate);
    const now = new Date();

    // Check if a month has passed
    if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
      profile.planUsage.monthlyInterviewsUsed = 0;
      profile.planUsage.lastMonthlyResetDate = now;
      await profile.save();

      return {
        success: true,
        message: "Monthly counter reset successfully",
        data: profile,
      };
    }

    return {
      success: true,
      message: "No reset needed",
      data: profile,
    };
  } catch (error) {
    console.error("Error resetting monthly counter:", error);
    throw error;
  }
};
