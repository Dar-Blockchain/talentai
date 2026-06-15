const Feedback = require("./feedback.model");

module.exports.createFeedback = async (data) => {
  return await Feedback.create(data);
};
