const { Together } = require("together-ai");
require("dotenv").config();

const Profile = require("../../models/ProfileModel");

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

  const now = new Date();
  const daysSinceLastUpdate = (now - new Date(profile.quotaUpdatedAt)) / (1000 * 60 * 60 * 24);
  if (daysSinceLastUpdate >= 30) {
    profile.quota = 0;
    profile.quotaUpdatedAt = now;
  }

  if (profile.quota >= 5) {
    throw { status: 403, message: "You have reached your test limit (5)" };
  }

  let prompt;
  if (experienceLevel && proficiencyLevel) {
    if (proficiencyLevel < 1 || proficiencyLevel > 5) {
      throw { status: 400, message: "Proficiency level must be between 1 and 5" };
    }

    prompt = `
You are an experienced technical interviewer specialized in ${skill}.
You are generating questions for a **technical test** designed to evaluate candidates with ${experienceLevel} and proficiency level ${proficiencyLevel}/5.

Generate **exactly 10** technical questions as follows:
- For levels 1 and 2: generate simpler or theoretical questions focused on fundamentals and basic concepts.
- For levels 3, 4, and 5: generate situational technical questions that:
  - Present real-world scenarios requiring decision-making
  - Focus on problem-solving and best practices
  - Encourage reflection on experience and common pitfalls
  - Assess applied knowledge and reasoning, not just theory

**Important: All questions must be answered orally. Do NOT ask for any live coding, code writing, or writing of syntax.**
Questions should simulate challenges candidates would face on the job.

Return ONLY a JSON array of strings, like:
[
  "Question 1?",
  "Question 2?"
]
`.trim();
  } else {
    prompt = `
You are a professional interviewer for the skill ${skill}.
Generate **exactly 10** interview questions for a **technical test**, covering difficulty levels 1 to 5:
- 2 questions at level 1 (simple real-world context)
- 2 at level 2 (basic problem-solving or reflection)
- 2 at level 3 (intermediate scenario or best practice dilemma)
- 2 at level 4 (complex problem-solving with trade-offs)
- 2 at level 5 (expert-level decision-making in high-impact situations)

All questions must be:
- Situational and scenario-based
- Focused on applied knowledge, reasoning, and decision-making
- Representative of challenges candidates would encounter in real projects
- **Answerable orally only, with no live coding, no code writing, and no syntax recall**

Return ONLY a JSON array of strings, like:
[
  "Question 1?",
  "Question 2?"
]
`.trim();
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
