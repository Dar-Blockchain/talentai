const interviewDetailsService = require("../services/interviewDetailsService");
const convertNewToOld = require("../utils/convertNewInterviewToOld");

exports.addInterviewDetails = async (req, res) => {
  try {
    const { newInterviewData, profileId } = req.body;

    // Valider les données entrantes
    if (!newInterviewData) {
      return res.status(400).json({
        success: false,
        error: "newInterviewData is required",
      });
    }

    if (!profileId) {
      return res.status(400).json({
        success: false,
        error: "profileId is required",
      });
    }

    // Convertir le nouveau format au format ancien
    const convertedData = convertNewToOld(newInterviewData);

    // Ajouter profileId et userId
    const interviewDetails = {
      ...convertedData,
      profileId,
      userId: req.user?.id || req.body.userId,
      createdAt: new Date(),
    };

    // Sauvegarder en base de données
    const result = await interviewDetailsService.createInterviewDetails(
      interviewDetails
    );

    res.status(201).json({
      success: true,
      message: "Interview details added successfully",
      data: result,
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
