const service = require("./blog.service");

const handle = (fn, status = 500) => async (req, res) => {
  try { await fn(req, res); }
  catch (err) { res.status(status).json({ success: false, error: err.message }); }
};

// ── Public ───────────────────────────────────────────────────────────────────
exports.listPublic = handle(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const result = await service.listPublishedPosts({ page: +page, limit: +limit });
  res.json({ success: true, ...result });
});

exports.getPublicBySlug = handle(async (req, res) => {
  const doc = await service.getPublishedPostBySlug(req.params.slug);
  res.json({ success: true, data: doc });
}, 404);

// ── Admin ────────────────────────────────────────────────────────────────────
exports.previewBySlug = handle(async (req, res) => {
  const doc = await service.getPostBySlugForAdmin(req.params.slug);
  res.json({ success: true, data: doc });
}, 404);

exports.list = handle(async (req, res) => {
  const { page = 1, limit = 10, status, search } = req.query;
  const result = await service.listPostsForAdmin({ page: +page, limit: +limit, status, search });
  res.json({ success: true, ...result });
});

exports.get = handle(async (req, res) => {
  const doc = await service.getPostForAdmin(req.params.id);
  res.json({ success: true, data: doc });
}, 404);

exports.create = handle(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const { title_en, title_fr, content_en, content_fr, excerpt_en, excerpt_fr, coverImage_en, coverImage_fr, status } = req.body;
  if (!title_en && !title_fr) return res.status(400).json({ success: false, error: "Title (English or French) is required" });
  const doc = await service.createPost({ title_en, title_fr, content_en, content_fr, excerpt_en, excerpt_fr, coverImage_en, coverImage_fr, status, userId });
  res.status(201).json({ success: true, data: doc });
}, 400);

exports.update = handle(async (req, res) => {
  const doc = await service.updatePost(req.params.id, req.body);
  res.json({ success: true, data: doc });
}, 400);

exports.remove = handle(async (req, res) => {
  await service.deletePost(req.params.id);
  res.json({ success: true });
}, 404);

exports.publish = handle(async (req, res) => {
  const doc = await service.setStatus(req.params.id, "published");
  res.json({ success: true, data: doc });
}, 400);

exports.unpublish = handle(async (req, res) => {
  const doc = await service.setStatus(req.params.id, "draft");
  res.json({ success: true, data: doc });
}, 400);

exports.uploadImage = handle(async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, error: "No file uploaded" });
  res.json({ success: true, data: { url: `/uploads/images/${req.file.filename}` } });
}, 400);
