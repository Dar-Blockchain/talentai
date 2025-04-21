const mongoose = require("mongoose");

const agentSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  accountId: { type: String, required: true },
  privkey: { type: String, required: true },
  pubkey: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Agent", agentSchema);
