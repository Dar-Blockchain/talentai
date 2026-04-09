const mongoose = require('mongoose');

const matchingConfigSchema = new mongoose.Schema({
  name: { type: String, default: 'default' },
  weights: {
    hardSkill: { type: Number, default: 40 },
    experience: { type: Number, default: 30 },
    SoftSkill: { type: Number, default: 10 },
    salary: { type: Number, default: 5 },
    workMode: { type: Number, default: 7.5 },
    contract: { type: Number, default: 7.5 },
  },
  // importanceWeight removed — weights are handled without per-importance multipliers
  exchangeRates: {
    type: Map,
    of: Number,
    default: { USD: 1, EUR: 1.1, TND: 0.32 },
  },  
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
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
}, { timestamps: true });

module.exports = mongoose.model('MatchingConfig', matchingConfigSchema);
