const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  prompt: { type: String, required: true },
  status: { type: String, enum: ["drafts", "posted", "scheduled"], default: "drafts" },
  createdAt: { type: Date, default: Date.now },
  image: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
});


const Post = mongoose.model("Post", postSchema);
module.exports = Post;