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
      .populate({
        path: "post",
        select: "title jobDetails.title jobDetails.description post_Steps",
        populate: {
          path: "post_Steps",
          model: "Post_Steps",
          select: "id order type data position connections"
        }
      })
      .populate("jobAssessmentResult")
      .populate("postSteps") // Using the virtual populate
      .exec(),
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



module.exports.getInterviewDetailsById = async (id) => {
  const interview = await InterviewDetails.findById(id)
    .populate("candidate", "firstName lastName email") // adapte les champs si besoin
    .populate("company", "name email")
    .populate({
      path: "post",
      select: "title jobDetails post_Steps",
      populate: {
        path: "post_Steps",
        model: "Post_Steps",
        select: "id type data position connections"
      }
    })
    .populate("jobAssessmentResult")
    .populate("postSteps"); // Using the virtual populate
  if (!interview) throw new Error("InterviewDetails non trouvée !");
  return interview;
};
