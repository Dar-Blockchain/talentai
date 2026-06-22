const userService = require("./user.service");
const logger      = require("../../utils/logger");

module.exports.updateUser = async (req, res) => {
  try {
    const data = await userService.updateUsername(req.params.userId, req.body.username, req.user._id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    logger.error("updateUser error:", error?.message || error);
    res.status(error.status || 500).json({ success: false, error: error.message || "Internal server error" });
  }
};
