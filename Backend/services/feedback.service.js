const Feedback = require('../models/feedbackModel');

module.exports.createFeedback = async (data) => {
  return await Feedback.create(data);
};

module.exports.getAllFeedbacks = async () => {
  return await Feedback.find().populate('userId', 'name email');
};