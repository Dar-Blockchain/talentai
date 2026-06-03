const User   = require("../models/User.model");
const logger = require("../utils/logger");

module.exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user._id.toString() !== userId) {
      return res.status(403).json({ success: false, error: "Forbidden" });
    }

    const { username } = req.body;
    if (!username || typeof username !== "string" || !username.trim()) {
      return res.status(400).json({ success: false, error: "username is required" });
    }

    const trimmed = username.trim();

    const conflict = await User.findOne({ username: trimmed, _id: { $ne: userId } }).lean();
    if (conflict) {
      return res.status(409).json({ success: false, error: "Username already taken" });
    }

    const updated = await User.findByIdAndUpdate(
      userId,
      { username: trimmed },
      { new: true, runValidators: true }
    ).select("_id username email role language").lean();

    if (!updated) return res.status(404).json({ success: false, error: "User not found" });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    logger.error("updateUser error:", error?.message || error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};
