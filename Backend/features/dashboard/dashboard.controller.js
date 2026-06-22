const dashboardService = require("./dashboard.service");

module.exports.getAllUsers = async (req, res) => {
  try {
    const {
      username = "",
      email = "",
      role = "",
      page = 1,
      limit = 10,
    } = req.query;

    const searchQuery = { username, email, role };
    const result = await dashboardService.getAllUsers(searchQuery, page, limit);

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message || "Error retrieving users" });
  }
};

module.exports.getCounts = async (req, res) => {
  try {
    const counts = await dashboardService.getCounts();
    res.status(200).json({ success: true, data: counts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports.getStatsCards = async (req, res) => {
  try {
    const userId = req.user._id;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID missing in request' });
    }
    const stats = await dashboardService.getStatsCards(userId);
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports.getCountsByDay = async (req, res) => {
  try {
    const countsByDay = await dashboardService.getCountsByDay();
    res.status(200).json({ success: true, data: countsByDay });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports.getRichStats = async (req, res) => {
  try {
    const userId = req.user._id;
    if (!userId) return res.status(400).json({ success: false, message: 'User ID missing' });
    const data = await dashboardService.getRichStats(userId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
