const feedbackService = require('../services/feedbackService');

exports.create = async (req, res) => {
  try {
    const feedback = await feedbackService.createFeedback({
      ...req.body,
      userId: req.user._id, // Si l'utilisateur est authentifié
    });
    res.status(201).json(feedback);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllFeedback = async (req, res) => {
  try {
    const feedbacks = await feedbackService.getAllFeedbacks();
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
