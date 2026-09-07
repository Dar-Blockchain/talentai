const mongoose = require('mongoose');

const { Mixed, ObjectId } = mongoose.Schema.Types;

/**
 * One saved standalone skill assessment (TECHNICAL_SKILL / SOFT_SKILL).
 *
 * `interviewData.finalReport` and `interviewData.analytics` are AI-generated
 * blobs whose shape evolves (dynamic per-skill coverage areas, scores, etc.),
 * so they are stored as Mixed rather than over-typed — the old fixed 4-key
 * `coverage.areas` schema silently dropped the real focus areas on save.
 */
const skillInterviewAssessmentSchema = new mongoose.Schema({
  candidateId: { type: ObjectId, ref: 'Profile', required: true },

  skill:       String,
  category:    String,
  skillType:   { type: String, enum: ['technical', 'soft'], default: 'technical' },
  proficiency: String, // human label derived from the overall score (e.g. "Senior")

  interviewData: {
    sessionId:    { type: String, unique: true, required: true },
    finalReport:  Mixed,
    analytics:    Mixed,
    conversation: [Mixed],
    // 'interrupted' = candidate disconnected before the interview ended;
    // finalReport is still populated best-effort but may be thin.
    status:           { type: String, enum: ['completed', 'interrupted'], default: 'completed' },
    disconnectReason: String,
  },

  // Admin moderation
  archived:   { type: Boolean, default: false },
  archivedAt: { type: Date, default: null },
}, {
  timestamps: true,
  collection: 'SkillInterviewAssessment',
});

skillInterviewAssessmentSchema.index({ candidateId: 1 });
skillInterviewAssessmentSchema.index({ skill: 1 });
skillInterviewAssessmentSchema.index({ createdAt: -1 });
skillInterviewAssessmentSchema.index({ archived: 1 });

module.exports = mongoose.model('SkillInterviewAssessment', skillInterviewAssessmentSchema);
