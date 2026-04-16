const mongoose = require("mongoose");

const campaignInsightSchema = new mongoose.Schema(
  {
    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InternalCampaign",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: [
        "TREND",
        "SENTIMENT",
        "SKILLS_HEATMAP",
        "GAP_ANALYSIS",
        "RECOMMENDATIONS",
        "SUMMARY",
      ],
      required: true,
    },

    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },

    rawPrompt: String,
    model: String,
    responseCount: Number,
    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "CampaignInsight",
  campaignInsightSchema
);