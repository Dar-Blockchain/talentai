const Feedback = require('../models/FeedbackModel');

module.exports.createFeedback = async (data) => {
  return await Feedback.create(data);
};

module.exports.getAllFeedbacks = async () => {
  return await Feedback.find().populate('userId', 'name email');
};

module.exports.getFeedbackById = async (id) => {
  return await Feedback.findById(id).populate('userId', 'name email');
};

module.exports.updateFeedback = async (id, data) => {
  return await Feedback.findByIdAndUpdate(id, data, { new: true });
};

module.exports.deleteFeedback = async (id) => {
  return await Feedback.findByIdAndDelete(id);
};