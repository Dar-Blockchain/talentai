const mongoose = require("mongoose");

const Post_StepsSchema = new mongoose.Schema({
  // Identifiants et métadonnées
  id: { type: String, required: true, unique: true },
  type: { type: String, required: true }, // 'custom', 'technical', etc.
  
  // Position et dimensions
  position: {
    x: { type: Number, required: true },
    y: { type: Number, required: true }
  },
  positionAbsolute: {
    x: { type: Number, required: true },
    y: { type: Number, required: true }
  },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  
  // État du nœud
  selected: { type: Boolean, default: false },
  dragging: { type: Boolean, default: false },
  
  // Données spécifiques du nœud
  data: {
    label: { type: String, required: true },
    type: { type: String, required: true }, // 'technical', 'interview', 'condition', 'email'
    subtitle: { type: String, required: true },
    config: {
      nodeNumber: { type: Number, required: true },
      title: { type: String, required: true },
      configured: { type: mongoose.Schema.Types.Mixed, default: false }, // Peut être boolean ou string
      lastPrompt: { type: String, default: "" },
      generatedContent: { type: String, default: "" },
      // Champs spécifiques pour les conditions
      field: { type: String },
      operator: { type: String },
      value: { type: String }
    }
  },
  
  // Relations
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
  },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Index pour améliorer les performances
Post_StepsSchema.index({ postId: 1, 'data.config.nodeNumber': 1 });
Post_StepsSchema.index({ type: 1 });
Post_StepsSchema.index({ id: 1 });
Post_StepsSchema.index({ 'data.type': 1 });

module.exports = mongoose.model("Post_Steps", Post_StepsSchema);
