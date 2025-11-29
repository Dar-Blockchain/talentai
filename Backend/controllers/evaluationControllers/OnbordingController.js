const onboardingService = require("../../services/evaluationServices/onboardingService");

exports.generateOnboardingQuestions = async (req, res) => {
  try {
    const { skills } = req.body;
    const questions = await onboardingService.generateOnboardingQuestions({ user: req.user, skills });
    res.json({ questions });
  } catch (err) {
    console.error("Error generating questions:", err);
    const status = err.status || 500;
    const message = err.message || "Failed to generate questions";
    res.status(status).json({ error: message, details: err.details });
  }
};

// Code testé: Cette fonction a été validée manuellement et fonctionne très bien. (20/08/2025)
exports.analyzeOnboardingAnswers = async (req, res) => {
  try {
    const { questions, skill } = req.body;
    const analysis = await onboardingService.analyzeOnboardingAnswers({ user: req.user, questions, skill });
    res.status(200).json({ success: true, result: { analysis } });
  } catch (err) {
    console.error("Error analyzing onboardingAnswers results:", err);
    const status = err.status || 500;
    const message = err.message || "Failed to analyze onboardingAnswers";
    res.status(status).json({ success: false, error: message, details: err.details || err.message });
  }
};