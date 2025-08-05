const mongoose = require("mongoose");

const connectionSchema = new mongoose.Schema({
  id: String,
  source: String,
  target: String,
  type: String,
}, { _id: false });

const configSchema = new mongoose.Schema({
  nodeNumber: Number,
  title: String,
  configured: Boolean,
}, { _id: false });

const dataSchema = new mongoose.Schema({
  label: { type: String, required: true },
  type: { type: String, required: true },
  subtitle: String,
  config: configSchema
}, { _id: false });

const positionSchema = new mongoose.Schema({
  x: { type: Number, required: true },
  y: { type: Number, required: true },
}, { _id: false });

const postStepSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  type: { type: String, required: true }, // 'custom', 'technical', etc.
  postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },

  position: positionSchema,
  positionAbsolute: positionSchema,
  width: Number,
  height: Number,
  selected: Boolean,
  dragging: Boolean,

  data: dataSchema,
  connections: [connectionSchema],
}, {
  timestamps: true
});

module.exports = mongoose.model("Post_Steps", postStepSchema);
