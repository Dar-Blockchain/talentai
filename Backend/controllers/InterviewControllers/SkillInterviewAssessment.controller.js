const SkillInterviewAssessmentService = require("../../services/InterviewServices/SkillInterviewAssessment.service");
const Profile = require("../../models/Profile.model");

// ========== POST - Create a new assessment ==========
const create = async (req, res) => {
  try {
    const data = req.body;
    const userId = req.user?._id;
    const userRole = req.user?.role;

    // Check if user is a Company - not allowed
    if (userRole === 'Company') {
      return res.status(403).json({
        success: false,
        message: "Company users do not have permission to create skill interview assessments",
      });
    }

    // Check if user quota has reached limit
    const userProfile = await Profile.findOne({ userId });
    if (userProfile && userProfile.quota === 5) {
      return res.status(403).json({
        success: false,
        message: "You have reached your assessment quota limit. Please upgrade to the next level to create more assessments.",
      });
    }

    // Basic validation
    if (!data.interviewData?.sessionId) {
      return res.status(400).json({
        success: false,
        message: "sessionId is required",
      });
    }

    // Ensure candidateId is set
    if (!data.candidateId && userId) {
      const userProfile = await Profile.findOne({ userId });
      if (userProfile) {
        data.candidateId = userProfile._id;
        console.log("Candidate ID set from user profile:", data.candidateId);
      }
    }

    if (!data.candidateId) {
      return res.status(400).json({
        success: false,
        message: "candidateId is required or user must have a profile",
      });
    }

    const rawInterviewData = data.interviewData;

    const assessment = await SkillInterviewAssessmentService.createAssessment(
      data,
      rawInterviewData,
      userId,
    );

    return res.status(201).json({
      success: true,
      message: "Skill assessment created successfully",
      data: assessment,
    });
  } catch (error) {
    console.error("Error creating assessment:", error);

    // Handle duplicate key error (E11000)
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "An assessment with this session ID already exists. Please use a unique session ID.",
        code: "DUPLICATE_SESSION_ID",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========== GET - Retrieve all assessments ==========
const getAll = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      interviewType,
      candidateId,
      interviewerId,
    } = req.query;

    const filters = {};
    if (interviewType) filters.interviewType = interviewType;
    if (candidateId) filters.candidateId = candidateId;
    if (interviewerId) filters.interviewerId = interviewerId;

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
    console.error("Error in getAll:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

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
  create,
  getAll,
  getMy,
  getById,
};
