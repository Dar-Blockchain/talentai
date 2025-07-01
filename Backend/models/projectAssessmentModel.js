const mongoose = require("mongoose");

const { PROJECT_ASSESSMENT_TYPE } = require("../constants/projectConstants");

const architectureSchema = new mongoose.Schema(
  {
    title: String,
    type: String,

    choiceExplanation: [String], // given by the project team lead

    // analysis
    score: { type: Number, min: 0, max: 100 }, // if correctly used: score out of 100
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    recommendation: [{ type: String }],
  },
  { _id: false }
);

const scalabilityApproachSchema = new mongoose.Schema(
  {
    strategy: String,
    choiceExplanation: [String], // given by the project team lead,

    // analysis
    score: Number,
    strengths: [String],
    weaknesses: [String],
    recommendation: [String],
  },
  { _id: false }
);

const techStackSchema = new mongoose.Schema(
  {
    title: String,
    componentType: {
      type: String,
      enum: ["coreTechnology", "integrationTool", "hederaService"],
      required: true,
    },

    choiceExplanation: [String], // given by the project team lead

    //analysis
    score: Number, // score out of 100
    complexity: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      required: true,
    },

    modernity: {
      type: String,
      enum: ["outdated", "average", "modern", "cutting-edge"],
      required: true,
    },

    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    recommendation: [{ type: String }],
  },
  { _id: false }
);

const TechnicalDataSchema = new mongoose.Schema(
  {
    techStack: [techStackSchema],
    architecture: architectureSchema,
    scalabilityApproach: scalabilityApproachSchema
  },
  { _id: false }
);

const BusinessDataSchema = new mongoose.Schema(
  {
    problem: String,
    targetUsers: String,
    valueProposition: String,
    businessModel: String,
    competitors: [String],
    marketPotential: String,
    otherInsights: String,
  },
  { _id: false }
);

const ProjectAssessmentSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    type: {
      type: String,
      enum: Object.values(PROJECT_ASSESSMENT_TYPE),
      required: true,
    },

    technicalData: TechnicalDataSchema,

    businessData: BusinessDataSchema,

    summary: {
      type: String, // general summary of the analysis
      required: true,
    },

    scoreOutOf100: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },

    analyzedAt: {
      type: Number,
      default: Date.now(), // timestamp of when the assessment was made
    },
  },
  {
    timestamps: true,
  }
);

const ProjectAssessment = mongoose.model(
  "ProjectAssessment",
  ProjectAssessmentSchema
);
module.exports = ProjectAssessment;
