const service = require("./webinar.service");

exports.getActive = async (req, res) => {
  try {
    const doc = await service.getActiveWebinar();
    res.json({ success: true, data: doc });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getPublic = async (req, res) => {
  try {
    const doc = await service.getPublicWebinar(req.params.id);
    res.json({ success: true, data: doc });
  } catch (err) {
    res.status(404).json({ success: false, error: err.message });
  }
};

exports.list = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const result = await service.listWebinars({ page: +page, limit: +limit, status });
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.get = async (req, res) => {
  try {
    const doc = await service.getWebinar(req.params.id);
    res.json({ success: true, data: doc });
  } catch (err) {
    res.status(404).json({ success: false, error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const doc = await service.createWebinar({ ...req.body, userId });
    res.status(201).json({ success: true, data: doc });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const doc = await service.updateWebinar(req.params.id, req.body);
    res.json({ success: true, data: doc });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await service.deleteWebinar(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(404).json({ success: false, error: err.message });
  }
};

exports.verify = async (req, res) => {
  try {
    const doc = await service.verifyWebinar(req.params.id);
    res.json({ success: true, data: doc });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.archive = async (req, res) => {
  try {
    const doc = await service.archiveWebinar(req.params.id);
    res.json({ success: true, data: doc });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.listSubmissions = async (req, res) => {
  try {
    const { page = 1, limit = 50, completed } = req.query;
    const result = await service.listSubmissions({
      webinarId: req.params.id,
      page: +page, limit: +limit,
      completed: completed === undefined ? undefined : completed === "true",
    });
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.sendLinkReminder = async (req, res) => {
  try {
    const result = await service.sendLinkReminder(req.params.id);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.refreshStats = async (req, res) => {
  try {
    const doc = await service.refreshStats(req.params.id);
    res.json({ success: true, data: doc });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
