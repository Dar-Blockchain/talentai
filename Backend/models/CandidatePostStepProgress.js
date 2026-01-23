const mongoose = require("mongoose");

const CandidatePostStepProgressSchema = new mongoose.Schema({
  idCandidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  idPost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
    required: true,
  },
  currentStep: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PostSteps",
    required: true,
  },
  steps: [
    {
      stepId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PostSteps",
        required: true,
      },
      interviewDetails: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PostInterviewAssessment",
        default: null,
        required: false,
      },
      status: {
        type: String,
        enum: ["pending", "inProgress", "done"],
        default: "pending",
        required: true,
      },
      // 🔥 NEW: Pass/Fail tracking
      passed: {
        type: Boolean,
        default: null,  // null = not attempted, true = passed, false = failed
      },
      finalScore: {
        type: Number,
        default: null,  // Final score from interview (0-100)
      },
      attempts: {
        type: Number,
        default: 0,  // Number of times this step was attempted
      },
      completedAt: {
        type: Date,
        default: null,
      },
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.CandidatePostStepProgress || mongoose.model(
  "CandidatePostStepProgress",
  CandidatePostStepProgressSchema
);
