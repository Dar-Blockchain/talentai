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
    keyHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    serviceName: {
      type: String,
    },
    scopes: {
      type: [String],
      default: ["read:posts", "write:posts"],
    },
    rateLimit: {
      type: Number,
      default: 1000,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastUsed: {
      type: Date,
    },
    expiresAt: {
      type: Date,
    },
    ipWhitelist: {
      type: [String],
    },
  },
  { timestamps: true }
);

apiKeySchema.statics.generateKey = function () {
  return "sk_" + crypto.randomBytes(32).toString("hex");
};

apiKeySchema.statics.hashKey = function (key) {
  return crypto.createHash("sha256").update(key).digest("hex");
};

apiKeySchema.statics.verifyKey = function (plainKey, Hash) {
  const hashedKey = crypto.createHash("sha256").update(plainKey).digest("hex");
  return hashedKey === Hash;
};

apiKeySchema.index({ userId: 1, isActive: 1 });
apiKeySchema.index({ serviceName: 1, isActive: 1 });

module.exports = mongoose.models.ApiKey || mongoose.model("ApiKey", apiKeySchema);
