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
    // How many times AI job-post generation can be called, independent of
    // postsLimit — generation costs money (LLM calls) whether or not the
    // draft is ever saved, so it's metered separately from saved posts.
    postGenerationsLimit: {
      type: Number,
      required: true,
      default: 20,
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
