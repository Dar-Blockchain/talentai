const mongoose = require("mongoose");

const companySettingsSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
      description: "Company (User) these settings belong to",
    },
    currency: {
      type: String,
      default: "USD",
      description: "ISO 4217 currency code used to display cost figures",
    },
    manualCostPerCandidate: {
      type: Number,
      default: 20,
      description: "Flat cost of screening one candidate by hand end-to-end (CV review + interview), used for the manual-vs-TalentAI cost comparison",
    },
    aiCostPerInterview: {
      type: Number,
      default: 8,
      description: "Actual flat cost TalentAI charges per candidate taken through a completed interview (CV analysis + interview)",
    },
    interviewDurationMinutes: {
      type: Number,
      default: 40,
      description: "How long a single interview takes. With TalentAI the AI conducts it, so none of this time comes out of the recruiter's own calendar; without TalentAI the recruiter must personally sit through every interview",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CompanySettings", companySettingsSchema);
