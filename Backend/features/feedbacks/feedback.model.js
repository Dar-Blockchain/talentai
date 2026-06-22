const mongoose = require("mongoose");

const INTERVIEW_MODELS = ['PostInterviewAssessment', 'SkillInterviewAssessment'];

const FeedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    trim: true,
    maxlength: 1000,
  },
  // Polymorphic reference — interviewType tells Mongoose which model to use for populate.
  // Both fields must be present together or absent together.
  interviewId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "interviewType",
  },
  interviewType: {
    type: String,
    enum: INTERVIEW_MODELS,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Prevent a user from submitting feedback twice for the same interview
FeedbackSchema.index({ userId: 1, interviewId: 1 }, { unique: true, sparse: true });

// Fast lookup by interview
FeedbackSchema.index({ interviewId: 1, interviewType: 1 });

module.exports = mongoose.model("Feedback", FeedbackSchema);
module.exports.INTERVIEW_MODELS = INTERVIEW_MODELS;
