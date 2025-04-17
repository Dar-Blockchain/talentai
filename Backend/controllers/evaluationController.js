// generateQuestions.js

const { OpenAI } = require("openai");
require("dotenv").config();

// Configure the OpenAI client with your API key
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

exports.generateQuestions = async (req, res) => {
  try {
    const user = req.user;

    // 1. Validate user profile & skills
    if (!user.profile) {
      return res.status(400).json({ error: "User profile not found." });
    }
    const { skills } = user.profile;
    if (!skills || skills.length === 0) {
      return res.status(400).json({ error: "No skills found in the user profile." });
    }

    // 2. Build a readable skills list
    const skillsList = skills
      .map(
        (s) =>
          `${s.name} (Experience: ${s.experienceLevel}, Proficiency: ${s.proficiencyLevel}/5)`
      )
      .join(", ");

    // 3. Prompt: ask for exactly 10 questions as a JSON array
    const prompt = `
You are an experienced technical interviewer.
Based on the candidate's skills (${skillsList}), generate **exactly 10** situational interview questions.
**Return ONLY** a JSON array of strings—no commentary, no numbering, no markdown—like this:

\`\`\`json
[
  "Question 1?",
  "Question 2?",
  // …
]
\`\`\`
`.trim();

    // 4. Call OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an experienced interviewer." },
        { role: "user", content: prompt },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const raw = response.choices[0].message.content;

    // 5. Try to extract & parse the JSON array
    let questions;
    const jsonMatch = raw.match(/\[([\s\S]*)\]/);
    if (jsonMatch) {
      const jsonText = "[" + jsonMatch[1] + "]";
      try {
        questions = JSON.parse(jsonText);
      } catch (e) {
        console.warn("JSON parse failed on extracted text, falling back:", e);
      }
    }

    // 6. Fallback: parse as a numbered list if JSON failed
    if (!Array.isArray(questions)) {
      console.warn("Falling back to numbered-list parsing");
      questions = raw
        .split(/\n(?=\d+\.\s)/)              // split at newline before "1. ", "2. ", etc.
        .map((q) => q.replace(/^\d+\.\s*/, "")) // strip leading "1. " etc.
        .map((q) => q.trim())
        .filter(Boolean);
    }

    // 7. Return the array
    res.json({ questions });
  } catch (error) {
    console.error("Error generating questions:", error);
    res.status(500).json({ error: "Failed to generate questions" });
  }
};
