const { Together } = require("together-ai");
require("dotenv").config();

const JobAssessmentResult = require("../models/JobAssessmentResultModel");
const Profile = require("../models/ProfileModel");
const Post = require("../models/PostModel");

const profileService = require("../services/profileService");

const {
  generateJobQuestionsPrompts,
  analyzeJobTestResultsPrompts,
} = require("../prompts/evaluationPrompts");
const { HttpError } = require("../utils/httpUtils");
const { parseAndValidateAIResponse } = require("../parsers/AIResponseParser");
const {
  updateProfileWithNewSkills,
  findAlreadyProvenSkills,
  mergeAlreadyProvenSkills,
  updateUpgradedSkills,
  processSkillsData,
} = require("../utils/evaluationUtils");

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
    max_tokens: 1000,
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

  // I. Add new skills to profile
  updateProfileWithNewSkills(profile, analysis.skillAnalysis);

  // II. Add already proven skills
  const alreadyProvenSkills = findAlreadyProvenSkills(
    profile.skills,
    jobSkills
  );
  mergeAlreadyProvenSkills(
    analysis.skillAnalysis,
    alreadyProvenSkills,
    profile.skills
  );

  // III. Update skills that are now at a higher level
  updateUpgradedSkills(profile.skills, analysis.skillAnalysis);

  await profile.save();

  // IV. Save JobAssessmentResult
  const company = await profileService.getProfileByPostId(jobId);
  const jobAssessmentResult = new JobAssessmentResult({
    timestamp: new Date(),
    assessmentType: "job",
    jobId,
    condidateId: profile._id,
    companyId: company._id,
    numberOfQuestions: questions.length,
    analysis,
  });

  await jobAssessmentResult.save();

  if (!Array.isArray(company.assessmentResults)) company.assessmentResults = [];
  company.assessmentResults.push(jobAssessmentResult._id);
  await company.save();

  // V. Update quota
  profile.quota++;
  await profile.save();

  return { analysis };
};
