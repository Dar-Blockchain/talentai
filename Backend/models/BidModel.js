const mongoose = require("mongoose");

const BidSchema = new mongoose.Schema({
  postId: {
    type: String, // ✅ supprimé: index: true
    required: true,
  },
  bidderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  bidderAccount: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  score: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "active", "refunded", "won"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for faster querying
BidSchema.index({ postId: 1, status: 1 });
BidSchema.index({ bidderId: 1 });
BidSchema.index({ amount: -1 });

// Update the updatedAt field before saving
BidSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model("Bid", BidSchema);
