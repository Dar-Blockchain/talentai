const mongoose = require("mongoose");
const { POST_STATUS } = require("../constants/posts.constants");

const salarySchema = new mongoose.Schema({
  min: { type: Number, required: true },
  max: { type: Number, required: true },
  currency: { type: String, required: true },
});

const skillSchema = new mongoose.Schema({
  name: { type: String, },
  level: { type: String },
  importance: { type: String },
  category: { type: String },
  percentage: {
    type: Number,
    min: 0,
    max: 100,
    required: false,
    validate: {
      validator: function (v) {
        // Allows undefined (not yet computed), but validates the range
        return v === undefined || (v >= 0 && v <= 100);
      },
      message: (props) =>
        `${props.value} is not a valid percentage (must be between 0 and 100)!`,
    },
  },
});

const suggestedSkillSchema = new mongoose.Schema({
  name: { type: String },
  reason: String,
  category: String,
  priority: String,
  relatedTo: String,
  purpose: String,
});

const softSkillSchema = new mongoose.Schema({
  name: { type: String },
  level: { type: String },
  percentage: {
    type: Number,
    min: 0,
    max: 100,
    required: false,
    validate: {
      validator: function (v) {
        return v === undefined || (v >= 0 && v <= 100);
      },
      message: (props) => `${props.value} is not a valid percentage (must be between 0 and 100)!`,
    },
  },
});

const jobDetailsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  requirements: [String],
  responsibilities: [String],
  location: String,
  employmentType: String,
  workMode: String,
  experienceLevel: String,
  salary: salarySchema,
});

const skillAnalysisSchema = new mongoose.Schema({
  requiredSkills: [skillSchema],
  suggestedSkills: {
    technical: [suggestedSkillSchema],
    frameworks: [suggestedSkillSchema],
    tools: [suggestedSkillSchema],
  },
  softSkills: [softSkillSchema],
  skillSummary: {
    mainTechnologies: [String],
    complementarySkills: [String],
    learningPath: [String],
    stackComplexity: String,
  },
});

const linkedinPostSchema = new mongoose.Schema({
  formattedContent: {
    headline: String,
    introduction: String,
    companyPitch: String,
    roleOverview: String,
    keyPoints: [String],
    skillsRequired: String,
    benefitsSection: String,
    callToAction: String,
  },
  hashtags: [String],
  formatting: {
    emojis: {
      company: String,
      location: String,
      salary: String,
      requirements: String,
      skills: String,
      benefits: String,
      apply: String,
    },
  },
  finalPost: String,
});

const postSchema = new mongoose.Schema({
  jobDetails: { type: jobDetailsSchema, required: true },
  skillAnalysis: { type: skillAnalysisSchema, required: true },
  linkedinPost: { type: linkedinPostSchema, required: true },
  // status: {
  //   type: String,
  //   enum: ["drafts", "posted", "scheduled"],
  //   default: "drafts",
  // },

  availableFrom: Number,
  availableUntil: Number,
  status: {
    type: String,
    enum: Object.values(POST_STATUS),
    default: POST_STATUS.DRAFT,
  },

  createdAt: { type: Date, default: Date.now },
  expirationDate: {
    type: Date,
    default: function() {
      const date = new Date();
      date.setDate(date.getDate() + 15);
      return date;
    },
    required: true,
    description: 'Post expiration date (by default 15 days after creation)'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  
  PostSteps: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PostSteps",
    },
  ],

  // Post creation type
  creationType: {
    type: String,
    enum: ['ai', 'pipeline', 'manual'],
    default: 'ai',
    description: 'How the post was created: AI generated, pipeline builder, or manual'
  },
  thresholdScore: {
    type: Number,
    default: 0,
  },

  // Archive flag (soft delete)
  archived: {
    type: Boolean,
    default: false,
    description: 'Soft delete flag - true when post is archived instead of deleted'
  },
  archivedAt: {
    type: Date,
    default: null,
    description: 'Timestamp when post was archived'
  },

});

const Post = mongoose.models.Post || mongoose.model("Post", postSchema);
module.exports = Post;

