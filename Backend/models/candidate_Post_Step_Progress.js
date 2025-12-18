const mongoose = require("mongoose");

const candidate_Post_Step_ProgressSchema = new mongoose.Schema({
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
    ref: "Post_Steps",
    required: true,
  },
  steps: [
    {
      stepId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post_Steps",
        required: true,
      },
      interviewDetails: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "InterviewDetails",
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

module.exports = mongoose.models.candidate_Post_Step_Progress || mongoose.model(
  "candidate_Post_Step_Progress",
  candidate_Post_Step_ProgressSchema
);
