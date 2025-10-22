const mongoose = require('mongoose');

const tokenTransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    required: true,
    enum: ['purchase', 'spend', 'refund', 'bonus', 'adjustment']
  },
  amount: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    // Only required for purchases
    required: function() {
      return this.type === 'purchase';
    }
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['hedera', 'hashpack', 'admin'],
    // Only required for purchases
    required: function() {
      return this.type === 'purchase';
    }
  },
  walletAddress: {
    type: String,
    // Optional wallet address for tracking
  },
  hederaTransactionHash: {
    type: String,
    // Hedera transaction hash for verification
  },
  description: {
    type: String,
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  completedAt: {
    type: Date
  },
  failureReason: {
    type: String
  },
  // For refunds - reference to original transaction
  originalTransactionId: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
tokenTransactionSchema.index({ userId: 1, createdAt: -1 });
tokenTransactionSchema.index({ transactionId: 1 });
tokenTransactionSchema.index({ type: 1, status: 1 });
tokenTransactionSchema.index({ hederaTransactionHash: 1 });

// Pre-save middleware to set description if not provided
tokenTransactionSchema.pre('save', function(next) {
  if (!this.description) {
    switch (this.type) {
      case 'purchase':
        this.description = `Purchased ${this.amount} tokens for $${this.price}`;
        break;
      case 'spend':
        this.description = `Spent ${Math.abs(this.amount)} tokens`;
        break;
      case 'refund':
        this.description = `Refund of ${this.amount} tokens`;
        break;
      case 'bonus':
        this.description = `Bonus tokens: ${this.amount}`;
        break;
      case 'adjustment':
        this.description = `Balance adjustment: ${this.amount}`;
        break;
    }
  }

  // Set completedAt when status changes to completed
  if (this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  }

  next();
});

// Static method to get user transactions
tokenTransactionSchema.statics.getUserTransactions = async function(userId, options = {}) {
  const {
    page = 1,
    limit = 50,
    type = null,
    status = null,
    startDate = null,
    endDate = null
  } = options;

  const query = { userId };

  if (type) {
    query.type = type;
  }

  if (status) {
    query.status = status;
  }

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) {
      query.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      query.createdAt.$lte = new Date(endDate);
    }
  }

  const skip = (page - 1) * limit;

  const [transactions, totalCount] = await Promise.all([
    this.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    this.countDocuments(query)
  ]);

  return {
    transactions,
    totalCount,
    currentPage: page,
    totalPages: Math.ceil(totalCount / limit)
  };
};

// Method to mark transaction as completed
tokenTransactionSchema.methods.markCompleted = function(hederaHash = null) {
  this.status = 'completed';
  this.completedAt = new Date();
  if (hederaHash) {
    this.hederaTransactionHash = hederaHash;
  }
  return this.save();
};

// Method to mark transaction as failed
tokenTransactionSchema.methods.markFailed = function(reason = null) {
  this.status = 'failed';
  if (reason) {
    this.failureReason = reason;
  }
  return this.save();
};

module.exports = mongoose.model('TokenTransaction', tokenTransactionSchema);