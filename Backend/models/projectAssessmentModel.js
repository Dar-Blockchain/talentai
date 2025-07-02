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
    track: String,
    techStack: [techStackSchema],
    architecture: architectureSchema,
    scalabilityApproach: scalabilityApproachSchema,
    overallScore: Number,
    summary: String,
    createdAt: {
      type: Number,
      default: Date.now(),
    },
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
    leaderProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
    },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    technicalData: TechnicalDataSchema,

    businessData: BusinessDataSchema,
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
