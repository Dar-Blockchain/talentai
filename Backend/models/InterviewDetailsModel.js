const mongoose = require("mongoose");
const { SKILL_TYPES, SKILL_LEVELS } = require("../constants/profileConstants");
const {
  ANSWER_STATUS,
  INTERVIEW_TYPES,
} = require("../constants/interviewDetailsConstants");
const Profile = require("./ProfileModel");

const questionAnswerSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true, default: "No answer provided" },
    status: {
      type: String,
      enum: Object.values(ANSWER_STATUS),
      default: "incorrect"
    },
    exampleCorrectAnswer: { type: String, required: false },
    partialCorrectPercentage: { type: Number, required: false },
    partialCorrectReason: { type: String, required: false },
  },
  { _id: false }
);

const skillDetailsSchema = new mongoose.Schema(
  {
    name: { type: String },

    type: {
      type: String,
      enum: Object.values(SKILL_TYPES),
      required: true,
    },

    // requiredLevel only for post/job interview
    requiredLevel: {
      type: Number,
      enum: Object.values(SKILL_LEVELS).map((lvl) => lvl.proficiencyLevel),
      required: false,
    },
    proficiencyLevel: {
      type: Number,
      enum: Object.values(SKILL_LEVELS).map((lvl) => lvl.proficiencyLevel),
      required: false,
    },
    experienceLevel: {
      type: String,
      enum: Object.values(SKILL_LEVELS).map((lvl) => lvl.experienceLevel),
      required: false,
    },

    confidenceScore: { type: Number },
    questionAnswerList: [questionAnswerSchema],
  },
  { _id: false }
);

// Schema for interview context
const interviewContextSchema = new mongoose.Schema(
  {
    targetCompany: { type: String },
    companyIndustry: { type: String },
    companyCulture: { type: String },
    targetRole: { type: String },
    // experienceLevel: {
    //   type: String,
    //   enum: Object.values(SKILL_LEVELS).map((lvl) => lvl.experienceLevel),
    //   required: false,
    // },
    experienceLevel: { type: String },
    interviewFormat: { type: String },
    simulationGoal: { type: String },
  },
  { _id: false }
);

const interviewDetailsSchema = new mongoose.Schema(
  {
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: false,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: false,
    },
    
    // jobAssessmentResult: only by interview of type : "post"
    jobAssessmentResult: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobAssessmentResult",
      required: false,
    },

    type: {
      type: String,
      enum: Object.values(INTERVIEW_TYPES),
      required: true,
    },

    interviewContext: { type: interviewContextSchema, required: false },

    // Questions d'entretien au niveau principal
    questions: {
      type: [questionAnswerSchema],
      default: []
    },

    overallScore: { type: Number },
    skillDetails: {
      type: [skillDetailsSchema],
    },
    recommendations: { type: [String] },
    createdAt: {
      type: Number,
      default: Date.now(),
    },
  },
  { timestamps: true }
);

// Virtual populate to get post_Steps through the post relationship
interviewDetailsSchema.virtual('postSteps', {
  ref: 'Post_Steps',
  localField: 'post',
  foreignField: 'postId',
  justOne: false
});

// Ensure virtual fields are serialized
interviewDetailsSchema.set('toJSON', { virtuals: true });
interviewDetailsSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model("InterviewDetails", interviewDetailsSchema);
