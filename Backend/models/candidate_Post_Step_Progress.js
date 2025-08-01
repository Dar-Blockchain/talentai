const mongoose = require("mongoose");

const candidate_Post_Step_ProgressSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  type: { type: String, required: true },
  prompt: { type: String, required: true },
  parentStep: { type: String, required: true },
  order: { type: String, required: true },
  details: { type: String, required: true },
  position: { type: String, required: true },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
  },});

module.exports = mongoose.model("candidate_Post_Step_Progress", candidate_Post_Step_ProgressSchema);
