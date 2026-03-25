const mongoose = require("mongoose");

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
      enum: ["INVITED", "IN_PROGRESS", "COMPLETED"],
      default: "INVITED",
      index: true,
    },

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
