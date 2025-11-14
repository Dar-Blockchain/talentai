const mongoose = require("mongoose");

const agentSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  avatarName: { type: String, required: true },
  role: { type: String, required: true },
  description: { type: String },
  isActive: { type: Boolean, default: true },
  hederaAccountId: { type: String },
  hederaPrivateKey: { type: String },
  hederaPublicKey: { type: String },

  // HCS-11 Profile Fields
  hcs11Profile: {
    type: mongoose.Schema.Types.Mixed,
    description: "Complete HCS-11 compliant agent profile",
  },
  inboundTopicId: {
    type: String,
    description: "Hedera topic ID for receiving messages",
  },
  outboundTopicId: {
    type: String,
    description: "Hedera topic ID for sending messages",
  },
  profileRegistrationId: {
    type: String,
    description: "HCS-11 profile registration message ID",
  },
  profileId: {
    type: String,
    description: "Unique HCS-11 profile identifier",
  },
  deploymentMessageId: {
    type: String,
    description: "HCS-11 profile deployment message ID on consensus network",
  },

  // Legacy fields for backwards compatibility
  accountId: { type: String },
  privkey: { type: String },
  pubkey: { type: String },
  createdAt: { type: Date, default: Date.now },

  Company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
    unique: true,
    sparse: true,
    description:
      "Référence one-to-one vers un Post (un Agent lié à un seul Post)",
  },
  // Référence vers la configuration associée (one-to-one)
  agentConfig: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AgentConfig",
    unique: true,
    sparse: true,
    description: "Référence optionnelle vers AgentConfig (one-to-one)",
  },
});

module.exports = mongoose.model("Agent", agentSchema);
