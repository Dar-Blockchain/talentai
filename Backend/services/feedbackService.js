const Feedback = require('../models/FeedbackModel');

const createFeedback = async (data) => {
  return await Feedback.create(data);
};

const getAllFeedbacks = async () => {
  return await Feedback.find().populate('userId', 'name email');
};

const getFeedbackById = async (id) => {
  return await Feedback.findById(id).populate('userId', 'name email');
};

const updateFeedback = async (id, data) => {
  return await Feedback.findByIdAndUpdate(id, data, { new: true });
};

const deleteFeedback = async (id) => {
  return await Feedback.findByIdAndDelete(id);
};

module.exports = {
  createFeedback,
  getAllFeedbacks,
  getFeedbackById,
  updateFeedback,
  deleteFeedback,
};
