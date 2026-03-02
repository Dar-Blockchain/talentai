const mongoose = require("mongoose");

const moduleSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["QUESTIONNAIRE", "AI_INTERVIEW", "SKILL_TEST", "TRAINING_PATH"],
      required: true,
    },
    config: {
      type: mongoose.Schema.Types.Mixed,  //QUESTIONNAIRE [Q1,Q2] 
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
      default: "DRAFT",
      index: true,
    },

    anonymityMode: {
      type: String,
      enum: ["ANONYMOUS", "NOMINATIVE"],
      required: true,
    },

    // a single assessment module (renamed from `modules` to `module`)
    module: {
      type: moduleSchema,
      required: true,
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

    skill: {
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

// note: `module` is a single object; field was renamed from `modules` to `module`
// (previous map-to-array transform has been removed)

internalCampaignSchema.index({ company: 1, status: 1 });

module.exports = mongoose.model(
  "InternalCampaign",
  internalCampaignSchema
);
