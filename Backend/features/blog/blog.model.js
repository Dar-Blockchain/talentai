const mongoose = require("mongoose");
const { BLOG_STATUS } = require("./blog.constants");

const BlogPostSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },

  title_en: { type: String, default: "" },
  title_fr: { type: String, default: "" },
  excerpt_en: { type: String, default: "" },
  excerpt_fr: { type: String, default: "" },
  content_en: { type: String, default: "" },
  content_fr: { type: String, default: "" },

  coverImage_en: { type: String, default: "" },
  coverImage_fr: { type: String, default: "" },
  status: {
    type: String,
    enum: Object.values(BLOG_STATUS),
    default: BLOG_STATUS.DRAFT,
  },
  publishedAt: { type: Date, default: null },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
}, { timestamps: true });

BlogPostSchema.index({ status: 1, publishedAt: -1 });

module.exports = mongoose.models.BlogPost || mongoose.model("BlogPost", BlogPostSchema);
