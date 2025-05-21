const mongoose = require("mongoose");

const SkillProgressionSchema = new mongoose.Schema({
  skillName: String,
  requiredLevel: Number,
  demonstratedLevel: Number,
  strengths: [String],
  weaknesses: [String],
  confidenceScore: Number,
  match: String,
  levelGap: Number,
  requiredSkill: {
    name: String,
    level: String,
    experienceLevel: String,
  },
  demonstratedExperienceLevel: String,
  masteryCategory: String
}, { _id: false });

const SkillAnalysisSchema = new mongoose.Schema({
  skillName: String,
  requiredLevel: Number,
  demonstratedLevel: Number,
  strengths: [String],
  weaknesses: [String],
  confidenceScore: Number,
  match: String,
  levelGap: Number
}, { _id: false });

const JobMatchSchema = new mongoose.Schema({
  percentage: Number,
  status: String,
  keyGaps: [String]
}, { _id: false });

const AnalysisSchema = new mongoose.Schema({
  overallScore: Number,
  skillAnalysis: [SkillAnalysisSchema],
  generalAssessment: String,
  recommendations: [String],
  technicalLevel: String,
  nextSteps: [String],
  jobMatch: JobMatchSchema,
  skillProgression: [SkillProgressionSchema]
}, { _id: false });

const JobAssessmentResultSchema = new mongoose.Schema({
  condidateId: { type: mongoose.Schema.Types.ObjectId, ref: "Profile", required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Profile", required: true },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
  timestamp: { type: Date, default: Date.now },
  assessmentType: { type: String, default: "job" },
  numberOfQuestions: Number,
  analysis: AnalysisSchema
});

module.exports = mongoose.model("JobAssessmentResult", JobAssessmentResultSchema);
