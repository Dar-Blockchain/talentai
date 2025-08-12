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
const Profile = require("../models/ProfileModel");

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
      jobRequiredSkills
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
    const { questions, formData } = req.body;

    if (!Array.isArray(questions)) {
      return res.status(400).json({
        error: "Invalid request format",
        required: {
          questions: "Array of question-answer pairs",
        },
      });
    }

    // Normalize optional formData
    const normalizedFormData = Array.isArray(formData) ? formData : null;

    // Sanitize questions: ensure shape { question: string, answer: string }
    const sanitizedQuestions = questions
      .filter((qa) => qa && typeof qa.question === "string")
      .map((qa) => ({
        question:
          typeof qa.question === "string" ? qa.question : String(qa.question),
        answer:
          typeof qa.answer === "string"
            ? qa.answer
            : qa.answer == null
            ? ""
            : String(qa.answer),
      }));

    if (sanitizedQuestions.length === 0) {
      return res.status(400).json({
        error: "questions must contain at least one valid item with a 'question' field",
      });
    }

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
  
    // Load candidate profile document
    const profile = await Profile.findOne({ userId: user._id });
    if (!profile) {
      throw new HttpError(500, "Candidate profile not found");
    }

    const result = await recruitementService.analyseQuestions({
      questions: sanitizedQuestions,
      postStep,
      formData: normalizedFormData,
      profile,
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
        "An unexpected error occurred while generating technical questions for job.",
    });
  }
};

