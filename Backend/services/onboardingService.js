const { Together } = require("together-ai");
require("dotenv").config();

const {
  generateOnboardingQuestionsPrompts,
  analyzeOnbordingQuestionsPrompts,
} = require("../prompts/evaluationPrompts");

const Profile = require("../models/ProfileModel");
const TodoList = require("../models/todoListModel");

const { saveInterviewDetailsForOnboarding } = require("../utils/evaluationUtils");

const together = new Together({ apiKey: process.env.TOGETHER_API_KEY });

async function generateOnboardingQuestions({ user, skills, questionsCount = 10 }) {
  if (!user) throw { status: 404, message: "User not found." };

  const profile = await Profile.findOne({ userId: user._id });
  if (!profile) throw { status: 404, message: "Profile not found" };

  const now = new Date();
  const daysSinceLastUpdate = (now - new Date(profile.quotaUpdatedAt)) / (1000 * 60 * 60 * 24);
  if (daysSinceLastUpdate >= 30) {
    profile.quota = 0;
    profile.quotaUpdatedAt = now;
  }

  if (profile.quota >= 5) throw { status: 403, message: "You have reached your test limit (5)" };

  if (!skills || !Array.isArray(skills) || skills.length === 0) {
    throw { status: 400, message: "skills is required and must be a non-empty array." };
  }

  if (skills.length != 1) {
    throw { status: 400, message: "skills must include only one skill" };
  }

  const skillName = skills[0].name;

  const systemPrompt = generateOnboardingQuestionsPrompts.getSystemPrompt(questionsCount);
  const userPrompt = generateOnboardingQuestionsPrompts.getUserPrompt(questionsCount, skillName);
  const stream = await together.chat.completions.create({
    model: "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    max_tokens: 700,
    temperature: 0.6,
    stream: true,
  });

  let raw = "";
  for await (const chunk of stream) {
    const content = chunk.choices?.[0]?.delta?.content;
    if (content) raw += content;
  }

  raw = raw.replace(/^```json\n/, "").replace(/\n```$/, "").trim();
  let questions;
  try {
    questions = JSON.parse(raw);
  } catch (e) {
    console.warn("JSON parse failed on cleaned text, falling back:", e);
    questions = [];
  }

  profile.quota += 1;
  await profile.save();

  return questions;
}

async function  analyzeOnboardingAnswers({ user, questions, skill }) {
  if (!user) throw { status: 404, message: "User not found." };

  if (!Array.isArray(skill)) {
    throw {
      status: 400,
      message: "Invalid request format: skill must be an array of skill objects",
    };
  }

  if (!Array.isArray(skill) || !Array.isArray(questions)) {
    throw {
      status: 400,
      message: "Invalid request format: questions must be an array",
    };
  }

  const isValidSkill = skill.every(
    (s) => s.name && typeof s.name === "string" && typeof s.proficiencyLevel === "number" && s.proficiencyLevel >= 1 && s.proficiencyLevel <= 5
  );

  if (!isValidSkill) {
    throw {
      status: 400,
      message: "Each skill must have a name (string) and proficiencyLevel (number 1-5)",
    };
  }

  const profile = await Profile.findById(user.profile);
  if (!profile) throw { status: 404, message: "Profile not found" };

  const todoList = await TodoList.findById(profile.todoList);
  if (!todoList) throw { status: 404, message: "TodoList not found" };

  const skillName = skill[0].name;
  const systemPrompt = analyzeOnbordingQuestionsPrompts.getSystemPrompt();
  const userPrompt = analyzeOnbordingQuestionsPrompts.getUserPrompt(skillName, questions);

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

  let analysis;
  let jsonStr;
  try {
    const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }

    jsonStr = (jsonStr || raw)
      .trim()
      .replace(/[\u200B-\u200D\uFEFF]/g, "")
      .replace(/^[^{]*/, "")
      .replace(/[^}]*$/, "");

    try {
      analysis = JSON.parse(jsonStr);
    } catch (firstError) {
      console.error("First parse attempt failed:", firstError);
      jsonStr = jsonStr
        .replace(/,(\s*[}\]])/g, "$1")
        .replace(/'/g, '"')
        .replace(/\n/g, " ")
        .replace(/\s+/g, " ");
      analysis = JSON.parse(jsonStr);
    }

    if (!analysis || typeof analysis !== "object") throw new Error("Analysis is not an object");

    const requiredFields = [
      "overallScore",
      "technicalLevel",
      "generalAssassment",
      "recommendations",
      "nextSteps",
      "skillAnalysis",
    ];
    const missingFields = requiredFields.filter((field) => !(field in analysis));
    if (missingFields.length > 0) throw new Error(`Missing required fields: ${missingFields.join(", ")}`);

    const overallScore = analysis.overallScore;
    const confidenceScore = analysis.skillAnalysis[0].confidenceScore;
    let demonstratedExperienceLevel;
    let experienceLevelString = "";

    if (confidenceScore < 6) {
      demonstratedExperienceLevel = 0;
      experienceLevelString = "NoLevel";
    } else if (confidenceScore < 16.32) {
      demonstratedExperienceLevel = 1;
      experienceLevelString = "Entry Level";
    } else if (confidenceScore < 30.32) {
      demonstratedExperienceLevel = 2;
      experienceLevelString = "Junior";
    } else if (confidenceScore < 48.31) {
      demonstratedExperienceLevel = 3;
      experienceLevelString = "Mid Level";
    } else if (confidenceScore < 69.33) {
      demonstratedExperienceLevel = 4;
      experienceLevelString = "Senior";
    } else {
      demonstratedExperienceLevel = 5;
      experienceLevelString = "Expert";
    }

    analysis.technicalLevel = experienceLevelString;
    if (Array.isArray(analysis.skillAnalysis) && analysis.skillAnalysis[0]) {
      analysis.skillAnalysis[0].requiredLevel = demonstratedExperienceLevel;
      analysis.skillAnalysis[0].demonstratedExperienceLevel = demonstratedExperienceLevel;
    }
        if (confidenceScore > 0) {
    const interviewId = await saveInterviewDetailsForOnboarding(profile, overallScore, analysis.skillAnalysis, analysis.recommendations);
     
    profile.interviewDetails.push(interviewId);
        }
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
            demonstratedExperienceLevel === 1 ? 1 : demonstratedExperienceLevel === 5 ? 5 : demonstratedExperienceLevel - 1,
        },
      ];
      profile.overallScore = overallScore;
      await profile.save();

      const index = todoList.todos.findIndex((todo) => todo.type === "Skill");
      if (index !== -1) {
        todoList.todos[index] = { ...analysis.skillAnalysis[0].todoList };
      }

      await todoList.save();
    }

    return analysis;
  } catch (error) {
    console.error("Error in analysis parsing:", error);
    throw { status: 500, message: "Failed to parse analysis", details: error.message };
  }
}

module.exports = {
  generateOnboardingQuestions,
  analyzeOnboardingAnswers,
};
