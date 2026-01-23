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

// Main schema for SkillInterviewAssessment model
const skillInterviewAssessmentSchema = new mongoose.Schema({
  // ========== RELATIONSHIPS ==========
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
    required: true,
    index: true
  },

  // ========== METADATA FIELDS ==========
  exportedAt: {
    type: Date,
    default: Date.now
  },
  skillType : {
    type: String,
    enum: ['technical','soft'],
    default: 'technical'
  },
  skill: String,
  category: String,
  proficiency: {
    type: String
  },

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
      unique: true,
      required: true
    },
    interviewType: {
      type: String,
      enum: ['HR_INTERVIEW', 'TECHNICAL_INTERVIEW', 'ASSESSMENT', 'EVALUATION'],
      default: 'HR_INTERVIEW'
    },
    timestamp: Date
  },

  // ========== TIMESTAMPS ==========
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'SkillInterviewAssessment'
});

// ========== INDEXES ==========
skillInterviewAssessmentSchema.index({ candidateId: 1 });
skillInterviewAssessmentSchema.index({ interviewerId: 1 });
skillInterviewAssessmentSchema.index({ skill: 1 });
skillInterviewAssessmentSchema.index({ proficiency: 1 });
skillInterviewAssessmentSchema.index({ createdAt: -1 });

// ========== MIDDLEWARE ==========
// Update updatedAt on save
skillInterviewAssessmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// ========== METHODS ==========
skillInterviewAssessmentSchema.methods.calculateOverallScore = function() {
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

skillInterviewAssessmentSchema.methods.getSummary = function() {
  return {
    _id: this._id,
    candidateId: this.candidateId,
    interviewerId: this.interviewerId,
    overallScore: this.interviewData.finalReport.scores.overall,
    completedAt: this.updatedAt,
    strongestAreas: this.interviewData.finalReport.aiAnalysis.strongestAreas,
    weakestAreas: this.interviewData.finalReport.aiAnalysis.weakestAreas
  };
};

module.exports = mongoose.model('SkillInterviewAssessment', skillInterviewAssessmentSchema);
