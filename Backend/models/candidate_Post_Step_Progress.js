const mongoose = require("mongoose");

const candidate_Post_Step_ProgressSchema = new mongoose.Schema({
  idCandidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  idPost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
  },
  currentStep: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post_Steps',
    required: true,
  },
  steps: [{
    stepId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post_Steps',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'inProgress', 'done'],
      default: 'pending',
      required: true
    },
    completedAt: {
      type: Date,
      default: null
    },
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("candidate_Post_Step_Progress", candidate_Post_Step_ProgressSchema);
