const mongoose = require('mongoose');

const conversationTurnSchema = new mongoose.Schema({
  question:  String,
  response:  String,
  targetArea: String,
  timestamp: String,
  evaluation: {
    qualityScore:      Number,
    answeredQuestion:  Boolean,
    completeness:      String,
    depthLevel:        String,
  },
}, { _id: false });

const indicatorSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  covered:  { type: Boolean, default: false },
  evidence: [{ type: String }],
}, { _id: false });

const areaSchema = new mongoose.Schema({
  percentage:     { type: Number, default: 0, min: 0, max: 100 },
  weight:         { type: Number, default: 0 },
  completed:      { type: Boolean, default: false },
  questionsAsked: { type: Number, default: 0 },
  indicators:     [indicatorSchema],
}, { _id: false });

const postInterviewAssessmentSchema = new mongoose.Schema({
  // ========== RELATIONSHIPS ==========
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
  },
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  step: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PostSteps',
    required: false,
    index: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  skill: String,

  // ========== INTERVIEW DATA ==========
  interviewData: {
    finalReport: {
      summary:    String,
      reasoning:  String,
      recommendation: {
        type: String,
        enum: ['strong_hire', 'hire', 'maybe', 'no_hire'],
        default: null,
      },

      // LLM decision-support fields
      keyDecisionFactors: [String],
      hiringRisks:        [String],
      developmentAreas:   [String],

      // Component scores (0–100)
      scores: {
        overall:       Number,
        quality:       Number,
        coverage:      Number,
        skills:        Number,
        depth:         Number,
        communication: Number,
      },

      strengths:  [String],
      weaknesses: [String],

      // Required-skills audit (populated from JD must-haves)
      requiredSkills: {
        all:          [String],
        demonstrated: [String],
        missed:       [String],
      },

      // Coverage breakdown — Mixed so any job-specific area name is stored
      coverage: {
        overall: { type: Number, default: 0 },
        areas:   { type: mongoose.Schema.Types.Mixed, default: {} },
      },

      candidateProfile: {
        communicationStyle: {
          verbosity:       String,
          confidenceLevel: String,
        },
        revealedExpertise: [String],
        revealedGaps:      [String],
        difficultyLevel:   String,
      },

      sessionMetrics: {
        totalResponses:   Number,
        questionsPerArea: { type: mongoose.Schema.Types.Mixed, default: {} },
      },

      timestamp: Date,
    },

    analytics: {
      duration:              Number,
      messageCount:          Number,
      silenceEvents:         Number,
      coveragePercentage:    Number,
      completedAreas:        Number,
      totalAreas:            Number,
      averageResponseLength: Number,
      interactionStyle:      String,
    },

    conversation: [conversationTurnSchema],

    sessionId: {
      type: String,
      required: true,
    },
    interviewType: {
      type: String,
      enum: ['HR_INTERVIEW', 'TECHNICAL_INTERVIEW', 'TECHNICAL_SKILL', 'SOFT_SKILL', 'SALARY_INTERVIEW', 'PSYCHOTECHNIC', 'ASSESSMENT', 'EVALUATION'],
      default: 'HR_INTERVIEW',
    },
    timestamp: Date,
  },

  // ========== TIMESTAMPS ==========
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },

  archived:   { type: Boolean, default: false },
  archivedAt: { type: Date,    default: null  },

  // ========== RECRUITER FEEDBACK ==========
  recruiterFeedback:   { type: String, default: null, index: true },
  recruiterFeedbackAt: { type: Date,   default: null },
}, {
  timestamps: true,
  collection: 'PostInterviewAssessment',
});

// ========== INDEXES ==========
postInterviewAssessmentSchema.index({ post: 1, candidate: 1 }, { unique: true, sparse: true });
postInterviewAssessmentSchema.index({ post: 1, company: 1 });
postInterviewAssessmentSchema.index({ candidate: 1 });
postInterviewAssessmentSchema.index({ company: 1 });
postInterviewAssessmentSchema.index({ createdAt: -1 });

// ========== MIDDLEWARE ==========
postInterviewAssessmentSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('PostInterviewAssessment', postInterviewAssessmentSchema);
