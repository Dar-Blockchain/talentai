const User = require("./user.model");
const logger = require("../../utils/logger");

module.exports.updateUsername = async (userId, username, requestingUserId) => {
  if (requestingUserId.toString() !== userId) {
    const err = new Error("Forbidden");
    err.status = 403;
    throw err;
  }

  if (!username || typeof username !== "string" || !username.trim()) {
    const err = new Error("username is required");
    err.status = 400;
    throw err;
  }

  const trimmed = username.trim();

  const conflict = await User.findOne({ username: trimmed, _id: { $ne: userId } }).lean();
  if (conflict) {
    const err = new Error("Username already taken");
    err.status = 409;
    throw err;
  }

  const updated = await User.findByIdAndUpdate(
    userId,
    { username: trimmed },
    { new: true, runValidators: true }
  ).select("_id username email role language").lean();

  if (!updated) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }

  return updated;
};
