// generateQuestions.js
const { Together } = require("together-ai");
require("dotenv").config();



const JobAssessmentResult = require("../../models/JobAssessmentResultModel");
const Profile = require("../../models/ProfileModel");
const TodoList = require("../../models/todoListModel");
const Post = require("../../models/PostModel");
const InterviewDetails = require("../../models/InterviewDetailsModel");

const postService = require("../../services/PosteServices/postService");
const evaluationservice = require("../../services/evaluationServices/evaluationService");


// Configure the Together AI client
const together = new Together({ apiKey: process.env.TOGETHER_API_KEY });

exports.generateQuestions = async (req, res) => {
  try {
    const user = req.user;

    // 1. Validate user profile & skills
    if (!user.profile) {
      return res.status(400).json({ error: "User profile not found." });
    }

    const skillsArray = req.body.skills || [];

    // Extraire uniquement les noms des skills
    const skillsList = skillsArray.map((skill) => skill.name).join(", ");

    const profile = await Profile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    console.log("skillsList", skillsList);

    const now = new Date();

    const daysSinceLastUpdate =
      (now - new Date(profile.quotaUpdatedAt)) / (1000 * 60 * 60 * 24);
    if (daysSinceLastUpdate >= 30) {
      profile.quota = 0;
      profile.quotaUpdatedAt = now;
    }

    if (profile.quota >= 5) {
      return res
        .status(403)
        .json({ error: "You have reached your test limit (5)" });
    }

    // 3. Prompt: ask for exactly 10 questions as a JSON array
    const prompt = `
You are an experienced technical interviewer.
Based on the candidate's skills (${skillsList}), generate **exactly 10** purely technical interview questions.
These questions must be 100% technical and designed to be answered **orally**, without requiring any live coding.
They should focus on applied understanding, architecture decisions, debugging, system reasoning, trade-offs, or performance analysis.
Avoid behavioral, soft skills or theoretical recall.
**Return ONLY** a JSON array of strings—no commentary, no numbering, no markdown—like this:

\`\`\`json
[
  "Question 1?",
  "Question 2?",
  // …
]
\`\`\`
`.trim();

    const stream = await together.chat.completions.create({
      model: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
      messages: [
        { role: "system", content: "You are an experienced interviewer." },
        { role: "user", content: prompt },
      ],
      max_tokens: 500,
      temperature: 0.7,
      stream: true,
    });

    let raw = "";
    for await (const chunk of stream) {
      const content = chunk.choices?.[0]?.delta?.content;
      if (content) raw += content;
    }

    // 5. Try to extract & parse the JSON array
    let questions;
    const jsonMatch = raw.match(/\[([\s\S]*)\]/);
    if (jsonMatch) {
      try {
        questions = JSON.parse("[" + jsonMatch[1] + "]");
      } catch (e) {
        console.warn("JSON parse failed on extracted text, falling back:", e);
      }
    }

    // 6. Fallback: parse as a numbered list if JSON failed
    if (!Array.isArray(questions)) {
      console.warn("Falling back to numbered-list parsing");
      questions = raw
        .split(/\n(?=\d+\.\s)/) // split at newline before "1. ", "2. ", etc.
        .map((q) => q.replace(/^\d+\.\s*/, "")) // strip leading "1. " etc.
        .map((q) => q.trim())
        .filter(Boolean);
    }

    profile.quota += 1;
    await profile.save();

    // 7. Return the array
    res.json({ questions });
  } catch (error) {
    console.error("Error generating questions:", error);
    res.status(500).json({ error: "Failed to generate questions" });
  }
};



exports.generateTechniqueQuestionsForJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    if (!jobId) {
      throw new HttpError(400, `missing required param: jobId`);
    }

    const user = req.user;
    if (!user) {
      throw new HttpError(500, `User not found`);
    }

    if (!user.profile) {
      throw new HttpError(500, `User has not profile.`);
    }

    const post = await Post.findById(jobId);
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

    const { requiredSkills, testedSkills, questions } =
      await evaluationservice.generateTechniqueQuestionsForJob(
        jobRequiredSkillList,
        user
      );

    res.status(200).json({
      jobId,
      requiredSkills,
      testedSkills,
      questions,
      totalQuestions: questions.length,
    });
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




exports.analyzeJobTestResults = async (req, res) => {
  try {
    const { questions, testedSkills, jobId } = req.body;
    const user = req.user;

    const profile = user.profile;

    const now = new Date();
    const daysSinceLastUpdate =
      (now - new Date(profile.quotaUpdatedAt)) / (1000 * 60 * 60 * 24);
    if (daysSinceLastUpdate >= 30) {
      profile.quota = 0;
      profile.quotaUpdatedAt = now;
    }

    if (profile.quota >= 5) {
      return res
        .status(403)
        .json({ error: "You have reached your test limit (5)" });
    }

    if (!Array.isArray(questions) || !jobId) {
      return res.status(400).json({
        error: "Invalid request format",
        required: {
          questions: "Array of question-answer pairs",
          jobId: "ID of the job posting",
        },
      });
    }

    const result = await evaluationservice.analyzeJobTestResults({
      questions,
      testedSkills,
      jobId,
      user,
    });

    res.status(200).json({ success: true, result });
  } catch (error) {
    console.error("Error analyzing job test results:", error);
    res.status(500).json({
      success: false,
      error: "Failed to analyze job test results",
      details: error.message,
    });
  }
};





exports.generateHRQuestions = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      throw new HttpError(500, `User not found`);
    }
    if (!user.profile) {
      throw new HttpError(500, `User has not profile.`);
    }

    const profile = await Profile.findById({ _id: user.profile._id });
    if (!profile) {
      throw new HttpError(500, `profile not found.`);
    }
    profile.quota += 1;
    await profile.save();

    if (profile.quota >= 5) {
      throw { status: 403, message: "You have reached your test limit (5)" };
    }
    // Extract form data from request body for personalization
    const formData = {
      targetCompany: req.body.targetCompany,
      companyIndustry: req.body.companyIndustry,
      companyCulture: req.body.companyCulture,
      targetRole: req.body.targetRole,
      experienceLevel: req.body.experienceLevel,
      interviewFormat: req.body.interviewFormat,
      simulationGoal: req.body.simulationGoal,
    };

    const result = await evaluationservice.generateHRQuestions(
      profile,
      formData
    );

    res.status(200).json(result);
  } catch (error) {
    if (error instanceof HttpError) {
      return res.status(error.statusCode || 500).json({
        error: error.message || "A HTTP error occurred.",
      });
    }

    return res.status(500).json({
      error: "An unexpected error occurred while generating HR questions.",
    });
  }
};

/**
 * Analyzes HR interview answers and updates the candidate's profile.
 *
 * @param {Object} req - Express request containing the candidate's answers.
 * @param {Object} res - Express response.
 *
 * Process:
 * 1. Evaluates the candidate’s soft skills based on HR answers.
 * 2. Updates the profile with any validated soft skills (experienceLevel > 0).
 * 3. Marks the "Pass HR Test" task as completed in the candidate's TodoList.
 *
 * @returns {Object} analysis of the questions/answers
 */
exports.analyzeHRAnswers = async (req, res) => {
  try {
    const { questions, formData } = req.body;
    const user = req.user;

    const profile = user.profile;

    const now = new Date();
    const daysSinceLastUpdate =
      (now - new Date(profile.quotaUpdatedAt)) / (1000 * 60 * 60 * 24);
    if (daysSinceLastUpdate >= 30) {
      profile.quota = 0;
      profile.quotaUpdatedAt = now;
    }

    if (profile.quota >= 5) {
      return res
        .status(403)
        .json({ error: "You have reached your test limit (5)" });
    }

    if (!Array.isArray(questions)) {
      return res.status(400).json({
        error: "Invalid request format",
        required: {
          questions: "Array of question-answer pairs",
        },
      });
    }

    const result = await evaluationservice.analyzeHRAnswers({
      questions,
      user,
      formData,
    });

    res.status(200).json({ success: true, result });
  } catch (error) {
    console.error("Error analyzing HR answers:", error);
    res.status(500).json({
      success: false,
      error: "Failed to analyze HRAnswers",
      details: error.message,
    });
  }
};
