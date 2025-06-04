const feedbackService = require('../services/feedbackService');

exports.create = async (req, res) => {
  try {
    const feedback = await feedbackService.createFeedback({
      ...req.body,
      userId: req.user._id, // si authentifié
    });
    res.status(201).json(feedback);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const feedbacks = await feedbackService.getAllFeedbacks();
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const feedback = await feedbackService.getFeedbackById(req.params.id);
    if (!feedback) return res.status(404).json({ message: 'Not found' });
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const updated = await feedbackService.updateFeedback(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const deleted = await feedbackService.deleteFeedback(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Feedback deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
