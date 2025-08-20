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
  analyzeOnbordingQuestionsPrompts,
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
  saveInterviewDetailsForOnboarding,
} = require("../utils/evaluationUtils");

const InterviewDetails = require("../models/InterviewDetailsModel");

const together = new Together({ apiKey: process.env.TOGETHER_API_KEY });

/**
 * Analyze onboarding answers for a given user and skill.
 *
 * - Validates input arrays and skill objects
 * - Calls TogetherAI with onboarding prompts
 * - Parses and validates JSON response from AI
 * - Derives demonstrated experience level from overall score
 * - Persists interview details and updates profile/todoList accordingly
 *
 * Tested: Très bien testé manuellement le 20/08/2025
 */
exports.analyzeOnboardingAnswersService = async ({ user, skill, questions }) => {
  if (!Array.isArray(skill) || !Array.isArray(questions)) {
    throw new HttpError(400, "Invalid request format: arrays required");
  }

  const isValidSkill = skill.every(
    (s) =>
      s.name &&
      typeof s.name === "string" &&
      typeof s.proficiencyLevel === "number" &&
      s.proficiencyLevel >= 1 &&
      s.proficiencyLevel <= 5
  );

  if (!isValidSkill) {
    throw new HttpError(
      400,
      "Invalid skill format: name (string) and proficiencyLevel (1-5) required"
    );
  }

  if (!user) throw new HttpError(404, "User not found");

  const profile = await Profile.findById(user.profile);
  if (!profile) throw new HttpError(404, "Profile not found");

  const todoList = await TodoList.findById(profile.todoList);

  const skillName = skill[0].name;
  const systemPrompt = analyzeOnbordingQuestionsPrompts.getSystemPrompt();
  const userPrompt = analyzeOnbordingQuestionsPrompts.getUserPrompt(
    skillName,
    questions
  );

  const stream = await together.chat.completions.create({
    model: "deepseek-ai/DeepSeek-V3",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    max_tokens: 2500,
    temperature: 0.7,
    stream: true,
  });

  let raw = "";
  for await (const chunk of stream) {
    const content = chunk.choices?.[0]?.delta?.content;
    if (content) raw += content;
  }

  // Parse AI JSON fenced block
  let analysis;
  let jsonStr;
  const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1];
  } else {
    jsonStr = raw;
  }

  jsonStr = jsonStr
    .trim()
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/^[^{]*/, "")
    .replace(/[^}]*$/, "");

  try {
    analysis = JSON.parse(jsonStr);
  } catch (firstError) {
    jsonStr = jsonStr
      .replace(/,(\s*[}\]])/g, "$1")
      .replace(/'/g, '"')
      .replace(/\n/g, " ")
      .replace(/\s+/g, " ");
    analysis = JSON.parse(jsonStr);
  }

  if (!analysis || typeof analysis !== "object") {
    throw new HttpError(422, "AI analysis parsing failed");
  }

  if (!analysis.skillAnalysis || !Array.isArray(analysis.skillAnalysis)) {
    throw new HttpError(422, "Invalid AI response: skillAnalysis missing");
  }

  const requiredFields = [
    "overallScore",
    "technicalLevel",
    "generalAssassment",
    "recommendations",
    "nextSteps",
    "skillAnalysis",
  ];
  const missingFields = requiredFields.filter((f) => !(f in analysis));
  if (missingFields.length > 0) {
    throw new HttpError(422, `AI response missing fields: ${missingFields.join(", ")}`);
  }

  // Derive demonstrated experience level from overallScore
  const overallScore = analysis.overallScore;
  let demonstratedExperienceLevel;
  let experienceLevelString = "";
  if (overallScore < 6) {
    demonstratedExperienceLevel = 0;
    experienceLevelString = "NoLevel";
  } else if (overallScore < 16.32) {
    demonstratedExperienceLevel = 1;
    experienceLevelString = "Entry Level";
  } else if (overallScore < 30.32) {
    demonstratedExperienceLevel = 2;
    experienceLevelString = "Junior";
  } else if (overallScore < 48.31) {
    demonstratedExperienceLevel = 3;
    experienceLevelString = "Mid Level";
  } else if (overallScore < 69.33) {
    demonstratedExperienceLevel = 4;
    experienceLevelString = "Senior";
  } else {
    demonstratedExperienceLevel = 5;
    experienceLevelString = "Expert";
  }

  analysis.technicalLevel = experienceLevelString;
  analysis.skillAnalysis[0].requiredLevel = demonstratedExperienceLevel;
  analysis.skillAnalysis[0].demonstratedExperienceLevel =
    demonstratedExperienceLevel;

  const interviewId = await saveInterviewDetailsForOnboarding(
    profile,
    overallScore,
    analysis.skillAnalysis,
    analysis.recommendations
  );

  if (!profile.interviewDetails) profile.interviewDetails = [];
  profile.interviewDetails.push(interviewId);
  await profile.save();

  if (demonstratedExperienceLevel > 0) {
    profile.skills = [
      {
        name: analysis.skillAnalysis[0].skillName,
        proficiencyLevel: demonstratedExperienceLevel,
        experienceLevel: experienceLevelString,
        NumberTestPassed: 1,
        ScoreTest: overallScore,
        Levelconfirmed:
          demonstratedExperienceLevel === 1
            ? 1
            : demonstratedExperienceLevel === 5
            ? 5
            : demonstratedExperienceLevel - 1,
      },
    ];
    await profile.save();

    if (todoList) {
      const index = todoList.todos.findIndex((todo) => todo.type === "Skill");
      if (index !== -1) {
        todoList.todos[index] = {
          ...analysis.skillAnalysis[0].todoList,
        };
      }
      await todoList.save();
    }
  }

  return { analysis };
};

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
    max_tokens: 3000,
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
    jobId, 
    analysis.recommendations
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
