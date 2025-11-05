const { Together } = require("together-ai");
require("dotenv").config();

const Profile = require("../../models/ProfileModel");
const { targetedPrompt, mixedPrompt } = require("../../prompts/TechnicalQuestionPrompt");

function getTogetherClient() {
  const apiKey = process.env.TOGETHER_API_KEY;
  if (!apiKey) {
    throw { status: 500, message: "TOGETHER_API_KEY is not configured on the server" };
  }
  return new Together({ apiKey });
}

/**
 * Génère des questions techniques en appelant Together AI.
 * Inputs: { skill, experienceLevel, proficiencyLevel, userId }
 * Returns: { skill, mode, experienceLevel, proficiencyLevel, questions, totalQuestions }
 */
async function generateTechniqueQuestions({ skill, experienceLevel, proficiencyLevel, userId }) {
  if (!skill) throw { status: 400, message: "Missing 'skill' field" };

  const profile = await Profile.findOne({ userId });
  if (!profile) throw { status: 404, message: "Profile not found" };

  if (profile.quota >= 5) {
    throw { status: 403, message: "You have reached your test limit (5)" };
  }

  let prompt;
  if (experienceLevel && proficiencyLevel) {
    if (proficiencyLevel < 1 || proficiencyLevel > 5) {
      throw { status: 400, message: "Proficiency level must be between 1 and 5" };
    }

    prompt = targetedPrompt(skill, experienceLevel, proficiencyLevel);
  } else {
    prompt = mixedPrompt(skill);
  }

  const together = getTogetherClient();
  const stream = await together.chat.completions.create({
    model: "meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8",
    messages: [
      { role: "system", content: `You are a technical interviewer generating skill-based questions.` },
      { role: "user", content: prompt },
    ],
    max_tokens: 1000,
    temperature: 0.7,
    stream: true,
  });

  let raw = "";
  for await (const chunk of stream) {
    const content = chunk.choices?.[0]?.delta?.content;
    if (content) raw += content;
  }

  // Try extracting JSON
  let questions;
  const jsonMatch = raw.match(/\[([\s\S]*)\]/);
  if (jsonMatch) {
    try {
      questions = JSON.parse("[" + jsonMatch[1] + "]");
    } catch (e) {
      console.warn("JSON parse failed, fallback:", e);
    }
  }

  if (!Array.isArray(questions)) {
    questions = raw
      .split(/\n(?=\d+\.\s)/)
      .map((q) => q.replace(/^\d+\.\s*/, "").trim())
      .filter(Boolean);
  }

  profile.quota += 1;
  await profile.save();

  return {
    skill,
    mode: experienceLevel && proficiencyLevel ? "targeted" : "mixed",
    experienceLevel: experienceLevel || "all",
    proficiencyLevel: proficiencyLevel || "1-5",
    questions,
    totalQuestions: questions.length,
    newQuota: profile.quota,
  };
}

module.exports = { generateTechniqueQuestions };
