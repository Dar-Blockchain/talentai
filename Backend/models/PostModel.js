const mongoose = require("mongoose");

const salarySchema = new mongoose.Schema({
  min: { type: Number, required: true },
  max: { type: Number, required: true },
  currency: { type: String, required: true },
});

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  level: { type: String },
  importance: { type: String },
  category: { type: String },
});

const suggestedSkillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  reason: String,
  category: String,
  priority: String,
  relatedTo: String,
  purpose: String,
});

const jobDetailsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  requirements: [String],
  responsibilities: [String],
  location: String,
  employmentType: String,
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
  status: {
    type: String,
    enum: ["drafts", "posted", "scheduled"],
    default: "drafts",
  },
  createdAt: { type: Date, default: Date.now },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const Post = mongoose.model("Post", postSchema);
module.exports = Post;
