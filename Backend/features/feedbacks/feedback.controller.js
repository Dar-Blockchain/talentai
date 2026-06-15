const feedbackService = require("./feedback.service");

exports.create = async (req, res) => {
  try {
    const feedback = await feedbackService.createFeedback({
      ...req.body,
      userId: req.user._id,
    });
    res.status(201).json(feedback);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
