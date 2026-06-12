const validateUpdateUsername = (req, res, next) => {
  const { username } = req.body;
  if (!username || typeof username !== "string" || !username.trim()) {
    return res.status(400).json({ success: false, error: "username is required and must be a non-empty string" });
  }
  const trimmed = username.trim();
  if (trimmed.length < 3 || trimmed.length > 30) {
    return res.status(400).json({ success: false, error: "username must be between 3 and 30 characters" });
  }
  if (!/^[a-zA-Z0-9_.-]+$/.test(trimmed)) {
    return res.status(400).json({ success: false, error: "username may only contain letters, numbers, underscores, dots, and hyphens" });
  }
  next();
};

module.exports = { validateUpdateUsername };
