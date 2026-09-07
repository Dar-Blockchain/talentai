const SkillInterviewAssessmentService = require("./skill-interview.service");

// ========== GET - Retrieve by ID ==========
const getById = async (req, res) => {
  try {
    const { id } = req.params;

    const assessment =
      await SkillInterviewAssessmentService.getAssessmentById(id);

    return res.status(200).json({
      success: true,
      data: assessment,
    });
  } catch (error) {
    console.error("Error retrieving assessment:", error);
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

const getMy = async (req, res) => {
  try {
    const { page = 1, limit = 10, skillType } = req.query;

    const filters = {};
    if (skillType) filters.skillType = skillType;
    filters.candidateId = req.user.profile;

    const result = await SkillInterviewAssessmentService.getAllAssessments(
      parseInt(page),
      parseInt(limit),
      filters,
    );

    return res.status(200).json({
      success: true,
      message: "Assessments retrieved successfully",
      ...result,
    });
  } catch (error) {
    console.error("Error in getMy:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

module.exports = {
  getMy,
  getById,
};
