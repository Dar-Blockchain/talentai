const MAX_NAME_LEN = 100;
const MAX_DESC_LEN = 500;

/**
 * POST /departments  — body: { name, description? }
 */
exports.validateCreate = (req, res, next) => {
  const { name, description } = req.body;

  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ success: false, error: "name is required" });
  }
  if (name.trim().length > MAX_NAME_LEN) {
    return res.status(400).json({ success: false, error: `name must be at most ${MAX_NAME_LEN} characters` });
  }
  if (description !== undefined && typeof description !== "string") {
    return res.status(400).json({ success: false, error: "description must be a string" });
  }
  if (description && description.length > MAX_DESC_LEN) {
    return res.status(400).json({ success: false, error: `description must be at most ${MAX_DESC_LEN} characters` });
  }

  req.body.name        = name.trim();
  req.body.description = description ? description.trim() : "";
  next();
};

/**
 * PUT /departments/:id  — body: { name?, description? }
 */
exports.validateUpdate = (req, res, next) => {
  const { name, description } = req.body;

  if (name !== undefined) {
    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ success: false, error: "name must be a non-empty string" });
    }
    if (name.trim().length > MAX_NAME_LEN) {
      return res.status(400).json({ success: false, error: `name must be at most ${MAX_NAME_LEN} characters` });
    }
    req.body.name = name.trim();
  }

  if (description !== undefined) {
    if (typeof description !== "string") {
      return res.status(400).json({ success: false, error: "description must be a string" });
    }
    if (description.length > MAX_DESC_LEN) {
      return res.status(400).json({ success: false, error: `description must be at most ${MAX_DESC_LEN} characters` });
    }
    req.body.description = description.trim();
  }

  if (name === undefined && description === undefined) {
    return res.status(400).json({ success: false, error: "Provide at least one field to update (name, description)" });
  }

  next();
};
