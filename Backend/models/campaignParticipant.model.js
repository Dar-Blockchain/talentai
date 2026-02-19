const mongoose = require("mongoose");

const moduleProgressSchema = new mongoose.Schema(
  {
    moduleType: {
      type: String,
      enum: ["QUESTIONNAIRE", "AI_INTERVIEW", "SKILL_TEST", "TRAINING_PATH"],
      required: true,
    },
    status: {
      type: String,
      enum: ["NOT_STARTED", "IN_PROGRESS", "COMPLETED"],
      default: "NOT_STARTED",
    },
    completedAt: Date,
    responseRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CampaignResponse",
    },
  },
  { _id: false }
);

const campaignParticipantSchema = new mongoose.Schema(
  {
    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InternalCampaign",
      required: true,
      index: true,
    },

    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    anonymousToken: {
      type: String,
      index: true,
      default: null,
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["INVITED", "IN_PROGRESS", "COMPLETED", "DROPPED"],
      default: "INVITED",
      index: true,
    },

    moduleProgress: [moduleProgressSchema],

    accessedAt: Date,
    completedAt: Date,
  },
  { timestamps: true }
);

// Prevent duplicate participation
campaignParticipantSchema.index(
  { campaign: 1, employee: 1 },
  { unique: true, partialFilterExpression: { employee: { $exists: true } } }
);

module.exports = mongoose.model(
  "CampaignParticipant",
  campaignParticipantSchema
);
