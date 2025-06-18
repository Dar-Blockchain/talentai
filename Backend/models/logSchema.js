const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  type: String,
  method: String,
  url: String,
  ip: String,
  referer: String,
  statusCode: Number,
  user_id: String,
  user_nom: String,
  headers: String,
  executionTime: Number,
  location: String,
  body: String,
  timestamp: { type: Date, default: Date.now }
});

logSchema.statics.getTotalLogsCount = async function() {
  return await this.countDocuments();
};

const Log = mongoose.model('Log', logSchema);

module.exports = Log;