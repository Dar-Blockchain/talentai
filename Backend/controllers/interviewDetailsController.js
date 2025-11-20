const interviewDetailsService = require("../services/interviewDetailsService");
const convertNewToOld = require("../utils/convertNewInterviewToOld");

exports.addInterviewDetails = async (req, res) => {
  try {
    const { metadata, interviewData } = req.body;
    const userId = req.user._id;
    
    // Valider les données entrantes
    if (!metadata || !interviewData) {
      return res.status(400).json({
        success: false,
        error: "metadata and interviewData are required",
      });
    }

    // Le candidate (ProfileId MongoDB) est requis
    const candidateId = userId;
    if (!candidateId) {
      return res.status(400).json({
        success: false,
        error: "candidate (profile ID) is required",
      });
    }

    // Construire newInterviewData au format attendu par convertNewToOld
    const newInterviewData = {
      metadata,
      interviewData,
    };

    // Convertir le nouveau format au format ancien
    const convertedData = convertNewToOld(newInterviewData);

    // Mapper le type d'entretien
    const interviewTypeMap = {
      "HR_INTERVIEW": "hr",
      "TECHNICAL_INTERVIEW": "skill",
      "POST_INTERVIEW": "post",
      "ONBOARDING": "onboarding",
    };

    const interviewType = interviewTypeMap[interviewData?.interviewType] || "hr";

    // Construire l'objet interview conforme au schéma MongoDB
    const interviewDetails = {
      candidate: candidateId,
      type: interviewType,
      overallScore: convertedData.overallScore,
      skillDetails: convertedData.skillDetails || [],
      recommendations: convertedData.recommendations || [],
      questions: [],
      interviewContext: {
        targetRole: metadata?.role || "N/A",
        experienceLevel: metadata?.proficiency || "N/A",
      },
    };

    // Sauvegarder en base de données
    const result = await interviewDetailsService.createInterviewDetails(
      interviewDetails
    );

    res.status(201).json({
      success: true,
      message: "Interview details added successfully",
      data: result,
      metadata: {
        sessionId: interviewData?.sessionId,
        timestamp: interviewData?.timestamp,
        analytics: interviewData?.analytics,
      },
    });
  } catch (error) {
    console.error("Error in addInterviewDetails:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
};

exports.getAll = async (req, res) => {
  try {
    const { page, limit, sort, type, profileId } = req.query;

    const result = await interviewDetailsService.getAllInterviewDetails({
      page,
      limit,
      sort,
      type,
      profileId,
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("Error in getAll:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getInterviewDetailsById = async (req, res) => {
  try {
    const { id } = req.params;
    const details = await interviewDetailsService.getInterviewDetailsById(id);
    res.status(200).json({
      success: true,
      data: details,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: error.message,
    });
  }
};
