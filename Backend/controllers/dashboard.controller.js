// usersController.js
const dashboardService = require("../services/dashboard.service");

module.exports.getAllUsers = async (req, res) => {
  try {
    const {
      username = "",
      email = "",
      role = "",
      page = 1,
      limit = 10,
    } = req.query;

    // Create searchQuery object to pass to service
    const searchQuery = { username, email, role };

    // Call service to retrieve users with pagination and search
    const result = await dashboardService.getAllUsers(searchQuery, page, limit);

    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({
        message:
          error.message || "Error retrieving users",
      });
  }
};

// Function to manage request and send results
module.exports.getCounts = async (req, res) => {
  try {
    // Call service function to get results
    const counts = await dashboardService.getCounts();
    res.status(200).json({ success: true, data: counts });
  } catch (error) {
    // In case of error, return an error message
    res.status(500).json({ success: false, message: error.message });
  }
};

// Function to manage request and send results
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

// Function to manage request and send results
module.exports.getCountsByDay = async (req, res) => {
  try {
    // Call service function to get results
    const countsByDay = await dashboardService.getCountsByDay();
    res.status(200).json({ success: true, data: countsByDay });
  } catch (error) {
    // In case of error, return an error message
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
