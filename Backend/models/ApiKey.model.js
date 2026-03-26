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
    // Store only the hash of the key for security
    keyHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      description: "API key name/description",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // For external services
    serviceName: {
      type: String,
      description: "External service name (ex: 'frontend', 'mobile-app', 'third-party-service')",
    },
    // Permissions/scopes
    scopes: {
      type: [String],
      default: ["read:posts", "write:posts"],
      description: "Permissions granted to this key",
    },
    // Rate limiting
    rateLimit: {
      type: Number,
      default: 1000,
      description: "Number of requests allowed per hour",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastUsed: {
      type: Date,
      description: "Last time this key was used",
    },
    expiresAt: {
      type: Date,
      description: "Key expiration date (optional)",
    },
    ipWhitelist: {
      type: [String],
      description: "List of allowed IPs (optional)",
    },
  },
  { timestamps: true }
);

// Generate a secure API key
apiKeySchema.statics.generateKey = function () {
  return "sk_" + crypto.randomBytes(32).toString("hex");
};

// Hash the key
apiKeySchema.statics.hashKey = function (key) {
  return crypto.createHash("sha256").update(key).digest("hex");
};

// Verify a key
apiKeySchema.statics.verifyKey = function (plainKey, Hash) {
  const hashedKey = crypto.createHash("sha256").update(plainKey).digest("hex");
  return hashedKey === Hash;
};

// Composite indexes for optimization
apiKeySchema.index({ userId: 1, isActive: 1 });
apiKeySchema.index({ serviceName: 1, isActive: 1 });

module.exports = mongoose.model("ApiKey", apiKeySchema);
