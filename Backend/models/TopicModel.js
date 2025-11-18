const mongoose = require("mongoose");
const { TOPIC_STATUS } = require("../constants/topicConstants");

const TopicSchema = new mongoose.Schema({
  postId: {
    type: String,
    required: true,
    unique: true, // ✅ garde l’unicité qui génère déjà un index
  },
  topicId: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    enum: Object.values(TOPIC_STATUS),
    default: TOPIC_STATUS.ACTIVE,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  closedAt: {
    type: Date,
  },
});

// Indexes for faster querying
// ✅ supprimé: TopicSchema.index({ postId: 1 });
TopicSchema.index({ status: 1 });

// Add closedAt timestamp when status changes to closed
TopicSchema.pre("save", function (next) {
  if (this.isModified("status") && this.status === TOPIC_STATUS.CLOSED) {
    this.closedAt = new Date();
  }
  next();
});

module.exports = mongoose.model("Topic", TopicSchema);
