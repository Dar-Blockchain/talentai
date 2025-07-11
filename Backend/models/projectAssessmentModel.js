const mongoose = require("mongoose");
const {
  PROJECT_STATUS,
  ELIGIBILITY_REQUIREMENTS,
  ELIGIBILITY_CHECKS_STATUS,
  TECH_STACK_TYPES,
} = require("../constants/projectConstants");

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
      enum: Object.values(TECH_STACK_TYPES),
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
    addedValues: [String], // how the project differentiates itself from existing solutions

    mentionnedInnovationAspects: [String], // how the project is innovative
    approvedInnovationAspects: [String], // approved by the juge

    explanation: [String], // explanation from the project team lead
    judgement: [String], // given by the juge

    score: { type: Number, min: 0, max: 100 }, // if correctly used: score out of 100
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    recommendation: [{ type: String }],
  },
  { _id: false }
);

const trackAlignmentSchema = new mongoose.Schema(
  {
    track: {
      type: String,
      required: true,
    },
    explanation: [String], // explanation from the project team lead
    judgement: [String], // judgement given by the judge
    score: { type: Number, min: 0, max: 100 }, // score given by the judge
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    recommendation: [{ type: String }],
  },
  { _id: false }
);

const hederaEcosystemImpactSchema = new mongoose.Schema(
  {
    explanation: [String],
    judgement: [String],
    score: { type: Number, min: 0, max: 100 }, // score given by the judge
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
    trackAlignment: trackAlignmentSchema, // how the project is aligned with the track
    hederaEcosystemImpact: hederaEcosystemImpactSchema, // how the project benefits the Hedera ecosystem
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

const eligibilityCheckSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: Object.values(ELIGIBILITY_REQUIREMENTS),
      required: false,
    },
    status: {
      type: String,
      enum: Object.values(ELIGIBILITY_CHECKS_STATUS),
      required: true,
    },
  },
  { _id: false }
);

//------------------ MAIN Schema ------------------------------

const ProjectAssessmentSchema = new mongoose.Schema(
  {
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
    overallScore: { type: Number, default: null },

    technicalData: TechnicalDataSchema,

    businessData: BusinessDataSchema,

    status: {
      type: String,
      enum: Object.values(PROJECT_STATUS),
      default: PROJECT_STATUS.PENDING,
    },

    eligibility: {
      checks: {
        type: [eligibilityCheckSchema],
        default: function () {
          return Object.values(ELIGIBILITY_REQUIREMENTS).map((type) => ({
            type,
            status: ELIGIBILITY_CHECKS_STATUS.IS_NOT_CHECKED,
          }));
        },
      },
      isEligible: {
        type: Boolean,
        default: false,
      },
    },
  },
  { timestamps: true }
);

const ProjectAssessment = mongoose.model(
  "ProjectAssessment",
  ProjectAssessmentSchema
);
module.exports = ProjectAssessment;
