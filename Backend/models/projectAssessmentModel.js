const mongoose = require("mongoose");
const { PROJECT_STATUS } = require("../constants/projectConstants");


//------------------ technicalData related Schemas---------------------

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

//------------------ BusinessData related Schemas---------------------

const businessModelSchema = new mongoose.Schema(
  {
    model: {
      type: String,
      required: true,
    },
    choiceExplanation: [String], // given by the project team lead

    score: { type: Number, min: 0, max: 100 }, // if correctly used: score out of 100
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    recommendation: [{ type: String }],
  },
  { _id: false }
);

const marketPotentialSchema = new mongoose.Schema(
  {
    range: String,
    estimatedMarketSize: String, // e.g. "$2B globally", "500K users in MENA", etc.
    targetRegion: String,

    choiceExplanation: [String], // given by the project team lead

    score: { type: Number, min: 0, max: 100 }, // if correctly used: score out of 100
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    recommendation: [{ type: String }],
  },
  { _id: false }
);

const innovationSchema = new mongoose.Schema(

  {
    innovationAspects: [String], // how the project is innovative
    addedValues: [String], // how the project differentiates itself from existing solutions
    score: { type: Number, min: 0, max: 100 }, // if correctly used: score out of 100
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    recommendation: [{ type: String }],
  },
  { _id: false }
);

//------------------ TechnicalData AND BusinessData Schemas-------------

const TechnicalDataSchema = new mongoose.Schema(
  {
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
    targetUsers: [String],
    innovation: innovationSchema, // how the project is innovative
    businessModel: businessModelSchema,
    competitors: [String],
    marketPotential: marketPotentialSchema,
    overallScore: Number,
    summary: String, // Concise summary of the business model and market potential
    createdAt: {
      type: Number,
      default: Date.now(),
    },
  },
  { _id: false }
);

//------------------ MAIN Schema ------------------------------

const ProjectAssessmentSchema = new mongoose.Schema(
  {
    // leaderProfile: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Profile",
    //   required: false,
    // },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    technicalData: TechnicalDataSchema,

    businessData: BusinessDataSchema,

    status: {
      type: String,
      enum: Object.values(PROJECT_STATUS),
      default: PROJECT_STATUS.PENDING,
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
