const service = require("./webinar.service");

// Wraps a handler to avoid repeating try/catch in every export
const handle = (fn, status = 500) => async (req, res) => {
  try { await fn(req, res); }
  catch (err) { res.status(status).json({ success: false, error: err.message }); }
};

exports.getActive = handle(async (req, res) => {
  const doc = await service.getActiveWebinar();
  res.json({ success: true, data: doc });
});

exports.getPublic = handle(async (req, res) => {
  const doc = await service.getPublicWebinar(req.params.id);
  res.json({ success: true, data: doc });
}, 404);

exports.list = handle(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const result = await service.listWebinars({ page: +page, limit: +limit, status });
  res.json({ success: true, ...result });
});

exports.get = handle(async (req, res) => {
  const doc = await service.getWebinar(req.params.id);
  res.json({ success: true, data: doc });
}, 404);

exports.create = handle(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const doc = await service.createWebinar({ ...req.body, userId });
  res.status(201).json({ success: true, data: doc });
}, 400);

exports.update = handle(async (req, res) => {
  const doc = await service.updateWebinar(req.params.id, req.body);
  res.json({ success: true, data: doc });
}, 400);

exports.remove = handle(async (req, res) => {
  await service.deleteWebinar(req.params.id);
  res.json({ success: true });
}, 404);

exports.verify = handle(async (req, res) => {
  const doc = await service.verifyWebinar(req.params.id);
  res.json({ success: true, data: doc });
}, 400);

exports.listSubmissions = handle(async (req, res) => {
  const { page = 1, limit = 50, completed } = req.query;
  const result = await service.listSubmissions({
    webinarId: req.params.id,
    page: +page, limit: +limit,
    completed: completed === undefined ? undefined : completed === "true",
  });
  res.json({ success: true, ...result });
});

exports.sendLinkReminder = handle(async (req, res) => {
  const result = await service.sendLinkReminder(req.params.id);
  res.json({ success: true, data: result });
}, 400);
