const feedbackService = require("../services/feedback.service");

exports.create = async (req, res) => {
  try {
    const feedback = await feedbackService.createFeedback({
      ...req.body,
      userId: req.user._id, // If user is authenticated
    });
    res.status(201).json(feedback);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
