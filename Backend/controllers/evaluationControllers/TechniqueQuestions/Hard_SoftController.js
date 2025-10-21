// generateQuestions.js
const analyzeProfileService = require("../../../services/evaluation/analyzeProfileService");
const techniqueService = require("../../../services/evaluation/techniqueQuestionsService");

exports.generateTechniqueQuestions = async (req, res) => {
  try {
    const { skill, experienceLevel, proficiencyLevel } = req.body;

    const result = await techniqueService.generateTechniqueQuestions({
      skill,
      experienceLevel,
      proficiencyLevel,
      userId: req.user._id,
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("Error generating technical questions:", error);
    if (error && error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to generate technical questions" });
  }
};


exports.analyzeProfileAnswers = async (req, res) => {
  return analyzeProfileService.analyzeProfileAnswers(req, res);
};
