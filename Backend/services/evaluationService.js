const { Together } = require("together-ai");
require("dotenv").config();

const JobAssessmentResult = require("../models/JobAssessmentResultModel");
const Profile = require("../models/ProfileModel");
const Post = require("../models/PostModel");
const TodoList = require("../models/todoListModel");

const profileService = require("../services/profileService");

const {
  generateJobQuestionsPrompts,
  analyzeJobTestResultsPrompts,
  generateHRQuestionsPrompts,
  analyzeHRAnswersPrompts,
} = require("../prompts/evaluationPrompts");
const { HttpError } = require("../utils/httpUtils");
const {
  parseAndValidateAIResponse,
  parseAIResponse,
} = require("../parsers/AIResponseParser");
const {
  updateProfileWithNewSkills,
  findAlreadyProvenSkills,
  mergeAlreadyProvenSkills,
  updateUpgradedSkills,
  processSkillsData,
  processAnalysisData,
  updateTodoListWithNewSkills,
  handleAddSoftSkills,
  saveInterviewDetails,
  saveInterviewDetailsForJob,
  handleHROverallScore,
} = require("../utils/evaluationUtils");

const InterviewDetails = require("../models/InterviewDetailsModel");

const together = new Together({ apiKey: process.env.TOGETHER_API_KEY });

module.exports.generateTechniqueQuestionsForJob = async (
  jobRequiredSkillList,
  user
) => {
  try {
    const userSkills = user.profile.skills;

    // Filter out skills the user already has (at or above the required proficiency level).
    // Only generate questiosn for skills, that the job requires that the user lacks or hasn't mastered yet.
    let skillListToTest = jobRequiredSkillList.filter((reqSkill) => {
      return !userSkills.some(
        (userSkill) =>
          userSkill.name.toLowerCase() === reqSkill.name.toLowerCase() &&
          userSkill.proficiencyLevel >= parseInt(reqSkill.level)
      );
    });

    // 3️⃣ generate skillList details , to include in the prompt
    const skillsListDetails = skillListToTest
      .map((skill) => `- ${skill.name} (ProficiencyLevel: ${skill.level})`)
      .join("\n");
    let questionsCount = 10;

    const systemPrompt =
      generateJobQuestionsPrompts.getSystemPrompt(questionsCount);

    const userPrompt = generateJobQuestionsPrompts.getUserPrompt(
      questionsCount,
      skillsListDetails
    );

    // 5️⃣ Call TogetherAI API
    const stream = await together.chat.completions.create({
      model: "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.6,
      max_tokens: 1000,
      stream: true,
    });

    let raw = "";
    for await (const chunk of stream) {
      const content = chunk.choices?.[0]?.delta?.content;
      if (content) raw += content;
    }

    raw = raw
      .replace(/^```json\n/, "")
      .replace(/\n```$/, "")
      .trim();

    // 6️⃣ Extract questions as JSON array
    let questions;
    try {
      questions = JSON.parse(raw);
    } catch (e) {
      console.warn("JSON parse failed on cleaned text, falling back:", e);
      questions = [];
    }

    return {
      requiredSkills: jobRequiredSkillList,
      testedSkills: skillListToTest,
      questions,
      totalQuestions: questions.length,
    };
  } catch (error) {
    if (error instanceof HttpError) throw error;

    throw new HttpError(500, "Internal server error");
  }
};

exports.analyzeJobTestResults = async ({
  questions,
  testedSkills,
  jobId,
  user,
}) => {
  const profile = await Profile.findById(user.profile);
  if (!profile)
    throw new HttpError(404, "Aucun profil trouvé pour cet utilisateur.");

  const todoList = await TodoList.findOne({ profile: profile._id });

  const post = await Post.findById(jobId);
  if (!post) throw new HttpError(404, "Post not found in the DB");

  const jobSkills = post.skillAnalysis.requiredSkills || [];
  if (!Array.isArray(jobSkills) || jobSkills.length === 0) {
    throw new HttpError(400, "Post has no requiredSkills");
  }

  const requiredSkills = testedSkills.map((s) => ({
    name: s.name,
    proficiencyLevel: s.level,
  }));

  const systemPrompt = analyzeJobTestResultsPrompts.getSystemPrompt();
  const userPrompt = analyzeJobTestResultsPrompts.getUserPrompt(
    requiredSkills,
    questions
  );

  const stream = await together.chat.completions.create({
    model: "deepseek-ai/DeepSeek-V3",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    max_tokens: 2500,
    temperature: 0.6,
    stream: true,
  });

  let raw = "";
  for await (const chunk of stream) {
    const content = chunk.choices?.[0]?.delta?.content;
    if (content) raw += content;
  }

  let analysis = await parseAndValidateAIResponse(raw);

  // 0. process profeciencyLevel of each skill, depending on its requiredLevel and the condidenceScore (generated with AI)
  processSkillsData(analysis);

  // II. Update the todoList with the new skills
  // await updateTodoListWithNewSkills(todoList, analysis )

  // III. Add already proven skills
  const alreadyProvenSkills = findAlreadyProvenSkills(
    profile.skills,
    jobSkills
  );

  mergeAlreadyProvenSkills(
    analysis.skillAnalysis,
    alreadyProvenSkills,
    profile.skills
  );

  // IV. Update skills that are now at a higher level
  updateUpgradedSkills(profile.skills, analysis.skillAnalysis);

  // V. Add new skills to profile
  updateProfileWithNewSkills(profile, analysis.skillAnalysis);

  // VI. Process analysis for overallScore
  processAnalysisData(analysis);

  await profile.save();

  // VII. Save interview details
  const interviewId = await saveInterviewDetailsForJob(
    profile,
    analysis.overallScore,
    analysis.skillAnalysis,
    jobId
  );

  // VIII. Save JobAssessmentResult
  const company = await profileService.getProfileByPostId(jobId);
  const jobAssessmentResult = new JobAssessmentResult({
    timestamp: new Date(),
    assessmentType: "job",
    jobId,
    condidateId: profile._id,
    companyId: company._id,
    numberOfQuestions: questions.length,
    analysis,
    interviewId: interviewId,
  });

  await jobAssessmentResult.save();

  if (!Array.isArray(company.assessmentResults)) company.assessmentResults = [];
  company.assessmentResults.push(jobAssessmentResult._id);
  await company.save();

  await InterviewDetails.findByIdAndUpdate(interviewId, {
    $set: { jobAssessmentResult: jobAssessmentResult._id },
  });

  // IX. Update quota
  profile.quota++;

  // X. update profile with interview details
  if (!profile.interviewDetails) {
    profile.interviewDetails = [];
  }
  profile.interviewDetails.push(interviewId);
  await profile.save();

  return { analysis };
};

module.exports.generateHRQuestions = async (profile, formData) => {
  try {
    const userSkills = profile.skills;

    const skillsListDetails = userSkills
      .map(
        (skill) => `- ${skill.name} (experienceLevel: ${skill.experienceLevel})`
      )
      .join("\n");

    const systemPrompt = generateHRQuestionsPrompts.getSystemPrompt(formData);

    const userPrompt = generateHRQuestionsPrompts.getUserPrompt(
      skillsListDetails,
      formData
    );

    const stream = await together.chat.completions.create({
      model: "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.6,
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
    if (error instanceof HttpError) throw error;

    throw new HttpError(500, `Internal server error: ${error}`);
  }
};

exports.analyzeHRAnswers = async ({ questions, user, formData }) => {
  const profile = await Profile.findById(user.profile);
  if (!profile)
    throw new HttpError(404, "Aucun profil trouvé pour cet utilisateur.");

  // for now , candidates are going to be tested on a default softSkill list
  // possible optimization:  Enabling the companies to set their preferred softSkillList to test
  const systemPrompt = analyzeHRAnswersPrompts.getSystemPrompt();
  const userPrompt = analyzeHRAnswersPrompts.getUserPrompt(questions);

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

  console.log("old value", analysis.overallScore);
  analysis.overallScore = handleHROverallScore(analysis.skillAnalysis);
  console.log("new value", analysis.overallScore);

  // II.
  // store softskills in the candidate's profile (if any are proven)
  // update todoList : Pass HR Test : isCompleted
  await handleAddSoftSkills(profile, analysis.skillAnalysis);

  const interviewId = await saveInterviewDetails(
    profile,
    analysis.overallScore,
    analysis.skillAnalysis,
    formData,
    analysis.recommendations
  );

  profile.quota++;

  if (!profile.interviewDetails) {
    profile.interviewDetails = [];
  }
  profile.interviewDetails.push(interviewId);
  await profile.save();

  return { analysis };
};
