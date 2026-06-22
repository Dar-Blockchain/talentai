const mongoose = require("mongoose");

const planLimitsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    postsLimit: {
      type: Number,
      required: true,
      default: 5,
    },
    monthlyInterviewLimit: {
      type: Number,
      required: true,
      default: 15,
    },
    durationDays: {
      type: Number,
      required: true,
      default: 30,
    },
    priceUsd: {
      type: Number,
      required: true,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.PlanLimits || mongoose.model("PlanLimits", planLimitsSchema);
