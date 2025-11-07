const mongoose = require('mongoose');

/**
 * AgentConfig
 * Ce modèle stocke les paramètres de configuration d'un agent pour le bidding automatique.
 * - Relation one-to-one avec Agent et Post
 * - Champs principaux : seuil de validation, budget min/max, pas d'augmentation, limites, durées
 */

const agentConfigSchema = new mongoose.Schema({
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
    required: true,
    unique: true,
    description: "Agent lié (one-to-one)",
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
    unique: true,
    description: "Post lié (one-to-one)",
  },

  // Seuil (%) minimum pour considérer un candidat comme valable (0-100)
  thresholdPercent: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 70,
    description: 'Seuil en pourcentage pour valider un candidat',
  },

  // Budget pour les bids
  bidBudgetMin: {
    type: Number,
    required: true,
    min: 0,
    default: 10,
    description: 'Montant minimum de bid autorisé',
  },
  bidBudgetMax: {
    type: Number,
    required: true,
    min: 0,
    default: 1000,
    description: "Montant maximum total que l'agent peut dépenser en bids",
  },

  // Pas d'augmentation de bid (par step)
  bidStep: {
    type: Number,
    required: true,
    min: 0,
    default: 5,
    description: "Incrément appliqué lors d'une augmentation de bid",
  },

  // Nombre maximum de candidats sur lesquels l'agent peut placer des bids simultanément
  maxCandidatesToBid: {
    type: Number,
    min: 0,
    default: 3,
    description: "Nombre max de candidats que l'agent peut bidder",
  },

  // Durée de vie en jours de l'agent (après création) avant expiration automatique
  agentLifetimeDays: {
    type: Number,
    min: 0,
    default: 30,
    description: "Nombre de jours de vie de l'agent",
  },

  // Durée de vie en jours d'un bid (après placement)
  bidLifetimeDays: {
    type: Number,
    min: 0,
    default: 7,
    description: "Nombre de jours durant lesquels un bid reste valable",
  },

  // Options supplémentaires utiles
  autoSubmitTopMatch: {
    type: Boolean,
    default: true,
    description: 'Si vrai, soumet automatiquement un message d\'évaluation pour le top match dépassant le threshold',
  },
  maxDailySpending: {
    type: Number,
    min: 0,
    default: 200,
    description: "Plafond de dépense journalier pour cet agent (peut limiter bidBudgetMax)",
  },

  // Historique / statut
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Mise à jour du timestamp updatedAt
agentConfigSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Indexs complémentaires pour garantir la contrainte one-to-one et faciliter les requêtes
agentConfigSchema.index({ agentId: 1 }, { unique: true, sparse: true });
agentConfigSchema.index({ postId: 1 }, { unique: true, sparse: true });

// Virtuals pour faciliter le populate réciproque
agentConfigSchema.virtual('agent', {
  ref: 'Agent',
  localField: 'agentId',
  foreignField: '_id',
  justOne: true,
});

agentConfigSchema.virtual('post', {
  ref: 'Post',
  localField: 'postId',
  foreignField: '_id',
  justOne: true,
});

// Inclure les virtuals lors de la sérialisation
agentConfigSchema.set('toObject', { virtuals: true });
agentConfigSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('AgentConfig', agentConfigSchema);
