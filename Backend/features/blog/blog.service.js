const BlogPost = require("./blog.model");
const { BLOG_STATUS } = require("./blog.constants");

function slugify(title) {
  return String(title)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function uniqueSlug(title, excludeId) {
  const base = slugify(title) || "post";
  let slug = base;
  let n = 1;
  while (true) {
    const filter = excludeId ? { slug, _id: { $ne: excludeId } } : { slug };
    const existing = await BlogPost.findOne(filter).select("_id").lean();
    if (!existing) return slug;
    n += 1;
    slug = `${base}-${n}`;
  }
}

const PUBLIC_LIST_FIELDS = "title_en title_fr slug excerpt_en excerpt_fr coverImage_en coverImage_fr publishedAt";

exports.listPostsForAdmin = async ({ page = 1, limit = 10, status, search } = {}) => {
  const filter = {};
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { title_en: { $regex: search, $options: "i" } },
      { title_fr: { $regex: search, $options: "i" } },
    ];
  }
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    BlogPost.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    BlogPost.countDocuments(filter),
  ]);
  return { data, total, page, totalPages: Math.ceil(total / limit) };
};

exports.getPostForAdmin = async (id) => {
  const doc = await BlogPost.findById(id).lean();
  if (!doc) throw new Error("Blog post not found");
  return doc;
};

exports.createPost = async ({ title_en, title_fr, content_en, content_fr, excerpt_en, excerpt_fr, coverImage_en, coverImage_fr, status, userId }) => {
  const slugSource = title_en || title_fr;
  if (!slugSource) throw new Error("Title (English or French) is required");
  const slug = await uniqueSlug(slugSource);
  const finalStatus = status === BLOG_STATUS.PUBLISHED ? BLOG_STATUS.PUBLISHED : BLOG_STATUS.DRAFT;
  return BlogPost.create({
    slug,
    title_en: title_en || "",
    title_fr: title_fr || "",
    content_en: content_en || "",
    content_fr: content_fr || "",
    excerpt_en: excerpt_en || "",
    excerpt_fr: excerpt_fr || "",
    coverImage_en: coverImage_en || "",
    coverImage_fr: coverImage_fr || "",
    status: finalStatus,
    publishedAt: finalStatus === BLOG_STATUS.PUBLISHED ? new Date() : null,
    createdBy: userId,
  });
};

exports.updatePost = async (id, patch) => {
  const existing = await BlogPost.findById(id);
  if (!existing) throw new Error("Blog post not found");

  const update = {};
  const hasTitle = patch.title_en !== undefined || patch.title_fr !== undefined;
  if (hasTitle) {
    if (patch.title_en !== undefined) update.title_en = patch.title_en;
    if (patch.title_fr !== undefined) update.title_fr = patch.title_fr;
    const newTitleEn = patch.title_en !== undefined ? patch.title_en : existing.title_en;
    const newTitleFr = patch.title_fr !== undefined ? patch.title_fr : existing.title_fr;
    const slugSource = newTitleEn || newTitleFr;
    if (slugSource && slugSource !== (existing.title_en || existing.title_fr)) {
      update.slug = await uniqueSlug(slugSource, id);
    }
  }
  if (patch.content_en !== undefined) update.content_en = patch.content_en;
  if (patch.content_fr !== undefined) update.content_fr = patch.content_fr;
  if (patch.excerpt_en !== undefined) update.excerpt_en = patch.excerpt_en;
  if (patch.excerpt_fr !== undefined) update.excerpt_fr = patch.excerpt_fr;
  if (patch.coverImage_en !== undefined) update.coverImage_en = patch.coverImage_en;
  if (patch.coverImage_fr !== undefined) update.coverImage_fr = patch.coverImage_fr;

  if (patch.status !== undefined && patch.status !== existing.status) {
    update.status = patch.status;
    if (patch.status === BLOG_STATUS.PUBLISHED && !existing.publishedAt) {
      update.publishedAt = new Date();
    }
    if (patch.status === BLOG_STATUS.DRAFT) {
      update.publishedAt = null;
    }
  }

  const doc = await BlogPost.findByIdAndUpdate(id, { $set: update }, { new: true });
  return doc;
};

exports.setStatus = async (id, status) => {
  const update = { status };
  update.publishedAt = status === BLOG_STATUS.PUBLISHED ? new Date() : null;
  const doc = await BlogPost.findByIdAndUpdate(id, { $set: update }, { new: true });
  if (!doc) throw new Error("Blog post not found");
  return doc;
};

exports.deletePost = async (id) => {
  const doc = await BlogPost.findByIdAndDelete(id);
  if (!doc) throw new Error("Blog post not found");
};

exports.listPublishedPosts = async ({ page = 1, limit = 10 } = {}) => {
  const filter = { status: BLOG_STATUS.PUBLISHED };
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    BlogPost.find(filter)
      .select(PUBLIC_LIST_FIELDS)
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    BlogPost.countDocuments(filter),
  ]);
  return { data, total, page, totalPages: Math.ceil(total / limit) };
};

exports.getPublishedPostBySlug = async (slug) => {
  const doc = await BlogPost.findOne({ slug, status: BLOG_STATUS.PUBLISHED }).lean();
  if (!doc) throw new Error("Blog post not found");
  return doc;
};

/** Admin preview — returns the post regardless of status (draft or published),
 * so an admin can review a post before it's live. */
exports.getPostBySlugForAdmin = async (slug) => {
  const doc = await BlogPost.findOne({ slug }).lean();
  if (!doc) throw new Error("Blog post not found");
  return doc;
};
