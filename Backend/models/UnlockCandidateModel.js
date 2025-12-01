const mongoose = require('mongoose');

const unlockCandidateSchema = new mongoose.Schema({
  idCompany: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  idCandidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  idJob: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  unlockPrice: {
    type: Number,
    required: true,
    min: 0
  },
  transactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TokenTransaction',
    // Reference to transaction if paid
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
unlockCandidateSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('UnlockCandidate', unlockCandidateSchema);
