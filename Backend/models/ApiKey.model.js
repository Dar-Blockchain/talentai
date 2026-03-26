const mongoose = require("mongoose");
const crypto = require("crypto");

const apiKeySchema = new mongoose.Schema(
  {
    key: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    // Stocker uniquement le hash de la clé pour la sécurité
    keyHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      description: "Nom/description de la clé API",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Pour les services externes
    serviceName: {
      type: String,
      description: "Nom du service externe (ex: 'frontend', 'mobile-app', 'third-party-service')",
    },
    // Permissions/scopes
    scopes: {
      type: [String],
      default: ["read:posts", "write:posts"],
      description: "Permissions accordées à cette clé",
    },
    // Rate limiting
    rateLimit: {
      type: Number,
      default: 1000,
      description: "Nombre de requêtes autorisées par heure",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastUsed: {
      type: Date,
      description: "Dernière utilisation de la clé",
    },
    expiresAt: {
      type: Date,
      description: "Date d'expiration de la clé (optionnel)",
    },
    ipWhitelist: {
      type: [String],
      description: "Liste des IPs autorisées (optionnel)",
    },
  },
  { timestamps: true }
);

// Générer une clé API sécurisée
apiKeySchema.statics.generateKey = function () {
  return "sk_" + crypto.randomBytes(32).toString("hex");
};

// Méthode pour hasher la clé
apiKeySchema.statics.hashKey = function (key) {
  return crypto.createHash("sha256").update(key).digest("hex");
};

// Vérifier une clé
apiKeySchema.statics.verifyKey = function (plainKey, Hash) {
  const hashedKey = crypto.createHash("sha256").update(plainKey).digest("hex");
  return hashedKey === Hash;
};

// Index composé pour optimiser les requêtes
apiKeySchema.index({ userId: 1, isActive: 1 });
apiKeySchema.index({ serviceName: 1, isActive: 1 });

module.exports = mongoose.model("ApiKey", apiKeySchema);
