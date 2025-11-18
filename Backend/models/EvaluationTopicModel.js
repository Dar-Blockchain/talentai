const mongoose = require("mongoose");
const { EVALUATION_STATUS } = require("../constants/evaluationConstants");

const evaluationTopicSchema = new mongoose.Schema({
  topicId: { type: String, required: true, unique: true },
  company: { type: String, required: true },
  postId: { type: String, required: true },
  candidateName: { type: String, required: true },
  candidateId: { type: String },
  topicMemo: { type: String, required: true }, // HCS-11 compliant memo
  status: {
    type: String,
    enum: Object.values(EVALUATION_STATUS),
    default: EVALUATION_STATUS.ACTIVE,
  },
  createdBy: { type: String, required: true }, // Agent that created the topic
  createdAt: { type: Date, default: Date.now },
  evaluations: [
    {
      agentId: { type: mongoose.Schema.Types.ObjectId, ref: "Agent" },
      agentName: { type: String },
      agentRole: { type: String },
      messageId: { type: String }, // Hedera message ID
      evaluation: {
        passed: { type: Boolean },
        score: { type: Number },
        feedback: { type: String },
        interviewNotes: { type: String },
      },
      timestamp: { type: Date, default: Date.now },
    },
  ],
  finalResult: {
    overallScore: { type: Number },
    recommendation: { type: String },
    completedAt: { type: Date },
  },
});

// Create compound index for efficient queries
evaluationTopicSchema.index({ company: 1, postId: 1, candidateName: 1 });
evaluationTopicSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("EvaluationTopic", evaluationTopicSchema);
