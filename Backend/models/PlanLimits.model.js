const mongoose = require("mongoose");

const planLimitsSchema = new mongoose.Schema(
  {
    // ========== PLAN NAME ==========
    name: {
      type: String,
      required: true,
      description: "Name of the plan (e.g., Basic, Premium, Enterprise)",
    },

    // ========== GLOBAL PLAN LIMITS ==========
    postsLimit: {
      type: Number,
      required: true,
      default: 0,
      description: "Maximum number of posts a company can create",
    },
    candidateUnlockLimit: {
      type: Number,
      required: true,
      default: 0,
      description: "Maximum number of candidates a company can unlock",
    },
    monthlyInterviewLimit: {
      type: Number,
      required: true,
      default: 0,
      description: "Maximum number of interviews allowed per month",
    },

    // ========== PLAN METADATA ==========
    isActive: {
      type: Boolean,
      default: true,
      description: "Whether this plan is active",
    },
    description: {
      type: String,
      required: false,
      description: "Description of the plan",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PlanLimits", planLimitsSchema);
