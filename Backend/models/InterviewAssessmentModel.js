const mongoose = require('mongoose');

// Schéma pour les indicateurs individuels
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

// Schéma pour les zones d'évaluation
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

// Schéma principal du modèle Pro
const proModelSchema = new mongoose.Schema({
  metadata: {
    exportedAt: {
      type: Date,
      default: Date.now
    },
    type: {
      type: String,
      enum: ['technical', 'behavioral', 'cultural'],
      default: 'technical'
    },
    skill: String,
    role: String,
    category: String,
    proficiency: {
      type: String,
      enum: ['Junior', 'Mid Level', 'Senior', 'Lead', 'Expert']
    }
  },

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

  // Métadonnées supplémentaires
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate'
  },
  interviewerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['draft', 'in-progress', 'completed', 'archived'],
    default: 'draft'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'pro_interviews'
});

// Index pour les requêtes fréquentes
proModelSchema.index({ 'interviewData.sessionId': 1 });
proModelSchema.index({ candidateId: 1 });
proModelSchema.index({ 'metadata.skill': 1 });
proModelSchema.index({ 'metadata.proficiency': 1 });
proModelSchema.index({ createdAt: -1 });
proModelSchema.index({ status: 1 });

// Middleware pour mettre à jour updatedAt
proModelSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Méthode pour calculer le score global
proModelSchema.methods.calculateOverallScore = function() {
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

// Méthode pour obtenir un résumé
proModelSchema.methods.getSummary = function() {
  return {
    candidateId: this.candidateId,
    skill: this.metadata.skill,
    proficiency: this.metadata.proficiency,
    overallScore: this.interviewData.finalReport.scores.overall,
    status: this.status,
    completedAt: this.updatedAt,
    strongestAreas: this.interviewData.finalReport.aiAnalysis.strongestAreas,
    weakestAreas: this.interviewData.finalReport.aiAnalysis.weakestAreas
  };
};

// Méthode pour mettre à jour le statut
proModelSchema.methods.updateStatus = function(newStatus) {
  if (['draft', 'in-progress', 'completed', 'archived'].includes(newStatus)) {
    this.status = newStatus;
    return this.save();
  }
  throw new Error('Statut invalide');
};

module.exports = mongoose.model('InterviewAssessment', proModelSchema);
