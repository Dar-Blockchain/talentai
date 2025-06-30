const InterviewDetails = require("../models/InterviewDetailsModel");

exports.getAllInterviewDetails = async ({ page = 1, limit = 10, sort = "-createdAt", type, profileId }) => {
  const query = {};

  if (type) query.type = type;
  if (profileId) query.candidate = profileId;

  const skip = (page - 1) * limit;

  const [results, total] = await Promise.all([
    InterviewDetails.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate("candidate", "firstName lastName email")
      .populate("company", "name")
      .populate("post", "title")
      .populate("jobAssessmentResult"),
    InterviewDetails.countDocuments(query)
  ]);

  return {
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    results,
    totalPages: Math.ceil(total / limit)
  };
};

