const mongoose = require('mongoose');

const tokenBalanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  balance: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  totalEarned: {
    type: Number,
    default: 0,
    min: 0
  },
  totalSpent: {
    type: Number,
    default: 0,
    min: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
tokenBalanceSchema.index({ lastUpdated: -1 });

// Virtual for total transactions value
tokenBalanceSchema.virtual('totalTransactionValue').get(function() {
  return this.totalEarned + this.totalSpent;
});

// Method to update balance
tokenBalanceSchema.methods.updateBalance = function(amount, type = 'adjustment') {
  if (type === 'earn' || type === 'purchase') {
    this.balance += amount;
    this.totalEarned += amount;
  } else if (type === 'spend') {
    if (this.balance < amount) {
      throw new Error('Insufficient balance');
    }
    this.balance -= amount;
    this.totalSpent += amount;
  } else {
    // Direct adjustment
    this.balance = amount;
  }

  this.lastUpdated = new Date();
  return this.save();
};

// Static method to get user balance
tokenBalanceSchema.statics.getUserBalance = async function(userId) {
  let balance = await this.findOne({ userId });

  if (!balance) {
    balance = new this({
      userId,
      balance: 0
    });
    await balance.save();
  }

  return balance;
};

module.exports = mongoose.model('TokenBalance', tokenBalanceSchema);