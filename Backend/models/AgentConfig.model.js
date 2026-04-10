const mongoose = require("mongoose");

/**
 * AgentConfig
 * This model stores configuration parameters for an agent for automatic bidding.
 * - One-to-one relationship with Agent and Post
 * - Main fields: validation threshold, min/max budget, increment step, limits, durations
 */

const agentConfigSchema = new mongoose.Schema({
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Agent",
    required: true,
    description: "Linked Agent (one-to-one)",
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
    required: true,
    description: "Linked Post (one-to-one)",
  },

  // Threshold (%) minimum to consider a candidate as valid (0-100)
  thresholdPercent: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 70,
    description: "Percentage threshold to validate a candidate",
  },

  // Budget for bids
  bidBudgetMin: {
    type: Number,
    required: true,
    min: 0,
    default: 10,
    description: "Minimum bid amount allowed",
  },
  bidBudgetMax: {
    type: Number,
    required: true,
    min: 0,
    default: 1000,
    description: "Maximum total amount the agent can spend on bids",
  },

  // Bid increment step
  bidStep: {
    type: Number,
    required: true,
    min: 0,
    default: 5,
    description: "Increment applied when increasing a bid",
  },

  // Maximum number of candidates the agent can place bids on simultaneously
  maxCandidatesToBid: {
    type: Number,
    min: 0,
    default: 1,
    description: "Maximum number of candidates the agent can bid on",
  },

  // Agent lifetime in days (after creation) before automatic expiration
  agentLifetimeDays: {
    type: Number,
    min: 0,
    default: 30,
    description: "Number of days of agent lifetime",
  },

  // Bid lifetime in days (after placement)
  bidLifetimeDays: {
    type: Number,
    min: 0,
    default: 7,
    description: "Number of days a bid remains valid",
  },

  // Additional useful options
  autoSubmitTopMatch: {
    type: Boolean,
    default: true,
    description:
      "If true, automatically submits an evaluation message for the top match exceeding threshold",
  },
  maxDailySpending: {
    type: Number,
    min: 0,
    default: 200,
    description:
      "Daily spending cap for this agent (may limit bidBudgetMax)",
  },

  // History / status
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  // Archive flag (soft delete)
  archived: {
    type: Boolean,
    default: false,
    description: 'Soft delete flag - true when config is archived instead of deleted'
  },
  archivedAt: {
    type: Date,
    default: null,
    description: 'Timestamp when config was archived'
  },
});

// Update the updatedAt timestamp
agentConfigSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Additional indexes to guarantee one-to-one constraint and facilitate queries
agentConfigSchema.index({ agentId: 1 }, { unique: true, sparse: true });
agentConfigSchema.index({ postId: 1 }, { unique: true, sparse: true });

// Virtuals to facilitate reciprocal population
agentConfigSchema.virtual("agent", {
  ref: "Agent",
  localField: "agentId",
  foreignField: "_id",
  justOne: true,
});

agentConfigSchema.virtual("post", {
  ref: "Post",
  localField: "postId",
  foreignField: "_id",
  justOne: true,
});

// Include virtuals during serialization
agentConfigSchema.set("toObject", { virtuals: true });
agentConfigSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("AgentConfig", agentConfigSchema);
