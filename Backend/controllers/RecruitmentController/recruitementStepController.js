const { Together } = require("together-ai");
require("dotenv").config();

const Post = require("../../models/PostModel");

const recruitementService = require("../../services/RecruitmentServices/recruitementStepService");
const { HttpError } = require("../../utils/httpUtils");
const Post_Steps = require("../../models/post_StepsModel");
const Profile = require("../../models/ProfileModel");

exports.generateQuestions = async (req, res) => {
  try {
    const user = req.user;
    const stepId = req.params.postStepId;

    if (!user) {
      throw new HttpError(500, `User  not found`);
    }
    if (!user.profile) {
      throw new HttpError(500, `User  has not profile.`);
    }

    const postStep = await Post_Steps.findById(stepId);
    if (!postStep.postId) {
      throw new HttpError(400, `postId in postStep not found`);
    }

    const post = await Post.findById(postStep.postId);
    if (!post) {
      throw new HttpError(500, "post not found in the db");
    }

    console.log(post)

    const company = post.user;
    const companyProfile = await Profile.findOne({ userId: company });
    const companyDetails = companyProfile.companyDetails;

    const userProfile = await Profile.findOne({ userId: user._id });
    const userSkills = userProfile.skills;
    const jobRequiredSkills = JSON.stringify(post.skillAnalysis.requiredSkills);

    const result = await recruitementService.generateQuestions(
      companyDetails,
      postStep,
      post,
      userSkills,
      jobRequiredSkills,
      user
    );

    res.status(200).json(result);
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


exports.analyseQuestions = async (req, res) => {
  try {
    const user = req.user;
    const stepId = req.params.postStepId;
    const { questions } = req.body;

    if (!Array.isArray(questions)) {
      return res.status(400).json({
        error: "Invalid request format",
        required: {
          questions: "Array of question-answer pairs",
        },
      });
    }

    const postStep = await Post_Steps.findById(stepId);
    if (!postStep.postId) {
      throw new HttpError(400, `postId in postStep not found`);
    }

console.log(postStep.data.type)
    const post = await Post.findById(postStep.postId);
    if (!post) {
      throw new HttpError(500, "post not found in the db");
    }

    const result = await recruitementService.analyseQuestions({
      questions,
      postStep,
      user,      
    });

    res.status(200).json(result);
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
        "An unexpected error occurred while generating analyse questions.",
    });
  }
};

