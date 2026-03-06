const mongoose = require('mongoose');

const interviewApplicantSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    ref: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed'],
      default: 'pending',
    },
    interviewSessionId: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// One record per (jobId, email) — prevents duplicate registrations
interviewApplicantSchema.index({ jobId: 1, email: 1 }, { unique: true });

module.exports = mongoose.model('InterviewApplicant', interviewApplicantSchema);
