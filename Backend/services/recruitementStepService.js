const { Together } = require("together-ai");
require("dotenv").config();

const { HttpError } = require("../utils/httpUtils");
const { parseAIResponse } = require("../parsers/AIResponseParser");
const Post = require("../models/PostModel");
const {
  saveInterviewDetails,
  saveInterviewDetailsForJob,
  handleHROverallScore,
} = require("../utils/evaluationUtils");

const {
  generateHRStepQuestionsPrompts,
  generateSoftSkillStepQuestionsPrompts,
  generateTechnicalSkillStepQuestionsPrompts,
} = require("../prompts/recruitementStepPrompts");


const evaluationPrompts = require("../prompts/evaluationPrompts");

const together = new Together({ apiKey: process.env.TOGETHER_API_KEY });

module.exports.generateQuestions = async (
  companyDetails,
  postStep,
  post,
  userSkills, 
  jobRequiredSkills,
) => {
  try {
    let systemPrompt = "";
    let userPrompt = "";

    const stepType = postStep.data.type;
    const stepPrompt = postStep.data.config.lastPrompt;

    if (stepType == "interview") {
      // refers to an hrInterview
      questionsCount = 10;
      systemPrompt = generateHRStepQuestionsPrompts.getSystemPrompt(
        questionsCount,
        stepPrompt,
        companyDetails,
        post.jobDetails
      );

      userPrompt = generateHRStepQuestionsPrompts.getUserPrompt(
        userSkills,
        questionsCount,
        stepPrompt,
        companyDetails,
        post.jobDetails
      );
    } else if (stepType == "soft") {
      questionsCount = 10;
      systemPrompt = generateSoftSkillStepQuestionsPrompts.getSystemPrompt(
        questionsCount,
        stepPrompt,
        companyDetails,
        post.jobDetails
      );

      userPrompt = generateSoftSkillStepQuestionsPrompts.getUserPrompt(
        userSkills,
        questionsCount,
        stepPrompt,
        companyDetails,
        post.jobDetails
      );
    } else if (stepType == "technical") {
      questionsCount = 10;
      systemPrompt = generateTechnicalSkillStepQuestionsPrompts.getSystemPrompt(
        questionsCount,
        
      );

      userPrompt = generateTechnicalSkillStepQuestionsPrompts.getUserPrompt(
        questionsCount, jobRequiredSkills
      );
    }

    console.log("aaaa: ", systemPrompt);
    console.log("bbbb: ", userPrompt);

    const stream = await together.chat.completions.create({
      model: "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 1000,
      stream: true,
    });

    let raw = "";
    for await (const chunk of stream) {
      const content = chunk.choices?.[0]?.delta?.content;
      if (content) raw += content;
    }

    let questions = await parseAIResponse(raw);

    return { questions, totalQuestions: questions.length };
  } catch (error) {
    console.error("Error generating post step questions:", error);
    if (error instanceof HttpError) throw error;

    throw new HttpError(500, `Internal server error: ${error}`);
  }
};

exports.analyseQuestions = async ({ questions, postStep, formData, profile, jobId }) => {
  let systemPrompt = "";
  let userPrompt = "";

  const stepType = postStep.data.type;

  if (stepType === "interview" || stepType === "soft") {
    systemPrompt = evaluationPrompts.analyzeHRAnswersPrompts.getSystemPrompt();
    userPrompt = evaluationPrompts.analyzeHRAnswersPrompts.getUserPrompt(questions);
  } else if (stepType === "technical") {
    systemPrompt = evaluationPrompts.analyzeJobTestResultsPrompts.getSystemPrompt();

    const effectiveJobId = jobId || postStep.postId;
    const post = await Post.findById(effectiveJobId);
    if (!post) throw new HttpError(404, "Post not found in the DB");

    const jobSkills = post.skillAnalysis?.requiredSkills || [];
    if (!Array.isArray(jobSkills) || jobSkills.length === 0) {
      throw new HttpError(400, "Post has no requiredSkills");
    }

    const requiredSkills = jobSkills.map((s) => ({
      name: s.name,
      proficiencyLevel: parseInt(s.level ?? s.proficiencyLevel ?? 3),
    }));

    userPrompt = evaluationPrompts.analyzeJobTestResultsPrompts.getUserPrompt(
      requiredSkills,
      questions
    );
  } else {
    throw new HttpError(400, `Unsupported step type: ${stepType}`);
  }

  const stream = await together.chat.completions.create({
    model: "deepseek-ai/DeepSeek-V3",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    max_tokens: 2048,
    temperature: 0.3,
    stream: true,
  });

  let raw = "";
  for await (const chunk of stream) {
    const content = chunk.choices?.[0]?.delta?.content;
    if (content) raw += content;
  }

  // I. parse AI response
  let analysis = await parseAIResponse(raw);

  if (stepType === "interview" || stepType === "soft") {
    analysis.overallScore = handleHROverallScore(analysis.skillAnalysis);

    const interviewId = await saveInterviewDetails(
      profile,
      analysis.overallScore,
      analysis.skillAnalysis,
      formData,
      analysis.recommendations
    );

    profile.quota = (profile.quota || 0) + 1;
    if (!Array.isArray(profile.interviewDetails)) {
      profile.interviewDetails = [];
    }
    profile.interviewDetails.push(interviewId);
    await profile.save();
  } else if (stepType === "technical") {
    // Save as job-related interview details
    const effectiveJobId = jobId || postStep.postId;
    const interviewId = await saveInterviewDetailsForJob(
      profile,
      analysis.overallScore,
      analysis.skillAnalysis,
      effectiveJobId,
      analysis.recommendations
    );

    profile.quota = (profile.quota || 0) + 1;
    if (!Array.isArray(profile.interviewDetails)) {
      profile.interviewDetails = [];
    }
    profile.interviewDetails.push(interviewId);
    await profile.save();
  }

  return { analysis };
};