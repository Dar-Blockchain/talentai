const mongoose = require("mongoose");

const FeedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  feedback: {
    type: [String], // Array of 5 strings
    required: true,
    validate: [arrayLimit, "{PATH} exceeds the limit of 5"],
    default: ["", "", "", "", ""], // Initialize empty 5 slots
  },
  comment: {
    type: String,
    trim: true,
    maxlength: 1000,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Validation of feedback array length (5 elements maximum)
function arrayLimit(val) {
  return val.length === 5;
}

module.exports = mongoose.model("Feedback", FeedbackSchema);
