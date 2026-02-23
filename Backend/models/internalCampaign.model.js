const mongoose = require("mongoose");

const moduleSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["QUESTIONNAIRE", "AI_INTERVIEW", "SKILL_TEST", "TRAINING_PATH"],
      required: true,
    },
    config: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    order: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const internalCampaignSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: [
        "PRODUCTIVITY_DIAGNOSTIC",
        "SKILLS_MAPPING",
        "ENABLEMENT",
        "CUSTOM",
      ],
      required: true,
    },

    description: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: ["DRAFT", "ACTIVE", "PAUSED", "CLOSED", "EXPIRED"],
      default: "ACTIVE",
      index: true,
    },

    anonymityMode: {
      type: String,
      enum: ["ANONYMOUS", "NOMINATIVE"],
      required: true,
    },

    modules: {
      type: [moduleSchema],
      validate: [(arr) => arr.length > 0, "At least one module required"],
    },

    accessMethod: {
      type: String,
      enum: ["LINK", "ACCOUNTS", "BOTH"],
      required: true,
    },

    linkToken: {
      type: String,
      index: true,
      default: null,
    },

    targetDepartment: String,

    targetEmployeeCount: Number,

    deadline: {
      type: Date,
      index: true,
    },

    skills: {
      type: String,
      default: "",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

internalCampaignSchema.index({ company: 1, status: 1 });

module.exports = mongoose.model(
  "InternalCampaign",
  internalCampaignSchema
);
