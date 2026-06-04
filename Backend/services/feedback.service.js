const Feedback = require('../models/Feedbacks.model');

module.exports.createFeedback = async (data) => {
  return await Feedback.create(data);
};