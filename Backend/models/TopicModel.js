const mongoose = require('mongoose');

const TopicSchema = new mongoose.Schema({
  postId: {
    type: String,
    required: true,
    unique: true
  },
  topicId: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['active', 'closed'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  closedAt: {
    type: Date
  }
});

// Indexes for faster querying
TopicSchema.index({ postId: 1 });
TopicSchema.index({ status: 1 });

// Add closedAt timestamp when status changes to closed
TopicSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'closed') {
    this.closedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Topic', TopicSchema);
