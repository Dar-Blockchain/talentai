const { Together } = require("together-ai");
require("dotenv").config();

const Post = require("../models/PostModel");

const recruitementService = require("../services/recruitementStepService");
const {
  saveInterviewDetailsForOnboarding,
  saveInterviewDetailsForAddSkill,
} = require("../utils/evaluationUtils");
const { HttpError } = require("../utils/httpUtils");
const Post_Steps = require("../models/post_StepsModel");

exports.generateQuestions = async (req, res) => {
  try {
    const company = req.user;
    const stepId = req.params.postStepId;

    if (!company) {
      throw new HttpError(500, `User of type company not found`);
    }
    if (!company.profile) {
      throw new HttpError(500, `User of type company has not profile.`);
    }
    const companyDetails = company.profile.companyDetails; 

    const postStep = await Post_Steps.findById(stepId);
    if (!postStep.postId) {
      throw new HttpError(400, `postId in postStep not found`);
    }

    const post = await Post.findById(postStep.postId);
    if (!post) {
      throw new HttpError(500, "post not found in the db");
    }

    const jobRequiredSkillList = post.skillAnalysis.requiredSkills;
    if (
      !jobRequiredSkillList ||
      !Array.isArray(jobRequiredSkillList) ||
      jobRequiredSkillList.length === 0
    ) {
      throw new HttpError(500, "post has no requiredSkills");
    }

    const result = await recruitementService.generateQuestions(companyDetails, postStep, post, jobRequiredSkillList);

    res.status(200).json(
      result
    );
  } catch (error) {
    // Handle known HttpError with custom status and message
    if (error instanceof HttpError) {
      return res.status(error.statusCode || 500).json({
        error: error.message || "A HTTP error occurred.",
      });
    }

    // Handle unexpected errors
    return res.status(500).json({
      error:
        "An unexpected error occurred while generating technical questions for job.",
    });
  }
};
