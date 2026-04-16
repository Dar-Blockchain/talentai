const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema(
  {
    questionId: String,
    answer: mongoose.Schema.Types.Mixed,
    score: Number,
  },
  { _id: false }
);

const campaignResponseSchema = new mongoose.Schema(
  {
    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InternalCampaign",
      required: true,
      index: true,
    },

    participant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CampaignParticipant",
      default: null,
    },

    moduleType: {
      type: String,
      enum: ["QUESTIONNAIRE", "AI_INTERVIEW", "SKILL_TEST"],
      required: true,
    },

    answers: [answerSchema],

    interviewTranscript: [
      {
        role: String,
        message: String,
        timestamp: Date,
      },
    ],

    testResults: {
      score: Number,
      maxScore: Number,
      breakdown: mongoose.Schema.Types.Mixed,
    },

    aiScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },

    aiSummary: { type: String, default: null },
  },
  { timestamps: true }
);

campaignResponseSchema.index({ campaign: 1, moduleType: 1 });

module.exports = mongoose.model(
  "CampaignResponse",
  campaignResponseSchema
);