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

module.exports.getJobAssessmentResultsGroupedByJobId = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    // Call service to retrieve assessment results grouped by jobId
    const result = await dashboardService.getJobAssessmentResultsGroupedByJobId(
      page,
      limit,
    );

    // Return response with results and pagination
    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({
        message:
          error.message ||
          "Error retrieving job assessment results",
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

// Function to manage request and send results
module.exports.getUserCountsByLocation = async (req, res) => {
  try {
    // Call service function to get number of users by location
    const userCountsByLocation =
      await dashboardService.getUserCountsByLocation();
    res.status(200).json({ success: true, data: userCountsByLocation });
  } catch (error) {
    // In case of error, return an error message
    res.status(500).json({ success: false, message: error.message });
  }
};

// Controller that returns all JobAssessmentResult for a specific skill
module.exports.getJobAssessmentsBySkill = async (req, res) => {
  const { skillName } = req.body; // Retrieve the skill name from URL parameters

  try {
    const assessments =
      await dashboardService.getJobAssessmentsBySkill(skillName);

    if (!assessments || assessments.length === 0) {
      return res
        .status(404)
        .json({ message: "No assessment found for this skill." });
    }

    // Returns assessment results
    return res.status(200).json({ assessments });
  } catch (error) {
    return res.status(500).json({ message: error.message });
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

module.exports.downloadUserExcel = async (req, res) => {
  try {
    // Call the service to generate Excel file
    const fileBuffer = await dashboardService.generateUserExcel();

    // Set response headers for file download
    res.setHeader("Content-Disposition", "attachment; filename=users.xlsx");
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );

    // Send the file in response
    res.send(fileBuffer);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur interne du serveur", error: error.message });
  }
};

module.exports.downloadUserExcelWithAssessmentZero = async (req, res) => {
  try {
    // Call service to generate Excel file for users with overallScore of 0
    const fileBuffer =
      await dashboardService.generateUserExcelWithAssessmentZero();

    // Set response headers for file download
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=users_with_score_0.xlsx",
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );

    // Send the file in response
    res.send(fileBuffer);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

module.exports.downloadUserExcelWithAssessmentAbove50 = async (req, res) => {
  try {
    // Call service to generate Excel file for users with overallScore of 0
    const fileBuffer =
      await dashboardService.generateUserExcelWithAssessmentAbove50();

    // Set response headers for file download
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=users_with_score_0.xlsx",
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );

    // Send the file in response
    res.send(fileBuffer);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
