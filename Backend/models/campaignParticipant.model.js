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
    },

    anonymousToken: {
      type: String,
      index: true,
      default: null,
    },

    // LINK + NOMINATIVE: token used as participantId for submission (no account needed)
    linkAccessToken: {
      type: String,
      index: true,
      sparse: true,
    },

    // LINK + NOMINATIVE: name provided by participant on the join form
    providerName: {
      type: String,
      trim: true,
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

// Prevent duplicate participation for named employees only.
// $ne: null excludes anonymous participants (no employee field) from the unique constraint.
campaignParticipantSchema.index(
  { campaign: 1, employee: 1 },
  { unique: true, partialFilterExpression: { employee: { $ne: null } } }
);

module.exports = mongoose.model(
  "CampaignParticipant",
  campaignParticipantSchema
);
