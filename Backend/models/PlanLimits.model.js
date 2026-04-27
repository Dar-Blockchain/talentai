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
      default: 5,
      description: "Maximum number of posts a company can create",
    },
    monthlyInterviewLimit: {
      type: Number,
      required: true,
      default: 15,
      description: "Maximum number of interviews allowed per month",
    },
    pipelineLimit: {
      type: Number,
      required: false,
      default: 0,
      description: "Maximum number of pipeline posts (0 = not available, -1 = unlimited)",
    },
    extraInterviewRateUsd: {
      type: Number,
      required: false,
      default: null,
      description: "Rate per extra interview beyond the monthly limit (USD)",
    },

    // ========== PLAN DURATION ==========
    durationDays: {
      type: Number,
      required: true,
      default: 30,
      description: "Duration of the plan in days",
    },

    // ========== PLAN METADATA ==========
    priceUsd: {
      type: Number,
      required: true,
      default: 0,
      description: "Price of the plan in USD",
    },
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
