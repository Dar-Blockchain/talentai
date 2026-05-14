const mongoose = require('mongoose');

// Schema for individual indicators
const indicatorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  covered: {
    type: Boolean,
    default: false
  },
  evidence: [{
    type: String
  }],
  quality: {
    type: Number,
    default: 0,
    min: 0,
    max: 10
  },
  aiGenerated: {
    type: Boolean,
    default: false
  },
  reasoning: String
}, { _id: false });

// Schema for evaluation areas
const areaSchema = new mongoose.Schema({
  percentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  indicators: [indicatorSchema],
  weight: {
    type: Number,
    default: 0
  },
  depth: String,
  completed: {
    type: Boolean,
    default: false
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  aiAnalysis: {
    qualityScore: Number,
    reasoning: String,
    indicators: [String]
  },
  questionsAsked: {
    type: Number,
    default: 0
  },
  lastQuestionTime: Date
}, { _id: false });

// Main schema for PostInterviewAssessment model
const postInterviewAssessmentSchema = new mongoose.Schema({
  // ========== RELATIONSHIPS ==========
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  step: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PostSteps',
    required: false,
    index: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  // ========== SKILL INFO ==========
  skillType : {
    type: String,
    enum: ['technical','soft'],
    default: 'technical'
  },
  skill: String,
  // ========== INTERVIEW DATA ==========
  interviewData: {
    finalReport: {
      summary: String,
      coverage: {
        overall: Number,
        areas: {
          technical_depth: areaSchema,
          problem_approach: areaSchema,
          learning_ability: areaSchema,
          practical_experience: areaSchema
        }
      },
      completedAreas: [String],
      nextRecommendedArea: String,
      lastUpdated: Date,
      aiAnalysis: {
        totalCoverage: Number,
        strongestAreas: [String],
        weakestAreas: [String],
        recommendedFocus: [String]
      },
      recommendations: [String],
      scores: {
        communication: Number,
        technical_depth: Number,
        problem_approach: Number,
        learning_ability: Number,
        overall: Number
      },
      timestamp: Date
    },

    analytics: {
      duration: Number,
      messageCount: Number,
      silenceEvents: Number,
      coveragePercentage: Number,
      completedAreas: Number,
      totalAreas: Number,
      averageResponseLength: Number,
      interactionStyle: String
    },

    sessionId: {
      type: String,
      required: true
    },
    interviewType: {
      type: String,
      enum: ['HR_INTERVIEW', 'TECHNICAL_INTERVIEW', 'TECHNICAL_SKILL', 'SOFT_SKILL', 'SALARY_INTERVIEW', 'PSYCHOTECHNIC', 'ASSESSMENT', 'EVALUATION'],
      default: 'HR_INTERVIEW'
    },
    timestamp: Date
  },

  // ========== TIMESTAMPS ==========
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  // Archive flag (soft delete)
  archived: {
    type: Boolean,
    default: false,
    description: 'Soft delete flag - true when assessment is archived instead of deleted'
  },
  archivedAt: {
    type: Date,
    default: null,
    description: 'Timestamp when assessment was archived'
  },
  // ========== RECRUITER FEEDBACK ==========
  // Note: This field tracks if recruiter has reviewed the AI-generated interview assessment
  recruiterFeedback: {
    type: String,
    default: null,
    description: 'Feedback from recruiter after reviewing AI interview - null means not yet reviewed',
    index: true
  },
  recruiterFeedbackAt: {
    type: Date,
    default: null,
    description: 'Timestamp when recruiter reviewed the interview'
  },
}, {
  timestamps: true,
  collection: 'PostInterviewAssessment'
});

// ========== INDEXES ==========
// NOTE: The old unique index on sessionId should be removed from MongoDB if it exists.
// To remove it, run in MongoDB console:
// db.PostInterviewAssessment.dropIndex("interviewData.sessionId_1")
// 
// The new unique index on (post, candidate) ensures only one assessment per candidate per post
postInterviewAssessmentSchema.index({ post: 1, candidate: 1 }, { unique: true, sparse: true });
postInterviewAssessmentSchema.index({ post: 1, company: 1 });
postInterviewAssessmentSchema.index({ candidate: 1 });
postInterviewAssessmentSchema.index({ company: 1 });
postInterviewAssessmentSchema.index({ createdAt: -1 });

// ========== MIDDLEWARE ==========
// Update updatedAt on save
postInterviewAssessmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// ========== METHODS ==========
postInterviewAssessmentSchema.methods.calculateOverallScore = function() {
  const areas = this.interviewData.finalReport.coverage.areas;
  const scores = [];

  if (areas.technical_depth?.aiAnalysis?.qualityScore) {
    scores.push(areas.technical_depth.aiAnalysis.qualityScore * 0.4);
  }
  if (areas.problem_approach?.aiAnalysis?.qualityScore) {
    scores.push(areas.problem_approach.aiAnalysis.qualityScore * 0.3);
  }
  if (areas.learning_ability?.aiAnalysis?.qualityScore) {
    scores.push(areas.learning_ability.aiAnalysis.qualityScore * 0.2);
  }
  if (areas.practical_experience?.aiAnalysis?.qualityScore) {
    scores.push(areas.practical_experience.aiAnalysis.qualityScore * 0.1);
  }

  return scores.reduce((a, b) => a + b, 0);
};

postInterviewAssessmentSchema.methods.getSummary = function() {
  return {
    _id: this._id,
    post: this.post,
    candidate: this.candidate,
    company: this.company,
    overallScore: this.interviewData.finalReport.scores.overall,
    strongestAreas: this.interviewData.finalReport.aiAnalysis.strongestAreas,
    weakestAreas: this.interviewData.finalReport.aiAnalysis.weakestAreas
  };
};

module.exports = mongoose.model('PostInterviewAssessment', postInterviewAssessmentSchema);
