// generateQuestions.js

const { OpenAI } = require("openai");
require("dotenv").config();

const JobAssessmentResult = require("../models/JobAssessmentResultModel");
const Profile = require("../models/ProfileModel");

const postService = require("../services/postService");

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
      return res
        .status(400)
        .json({ error: "No skills found in the user profile." });
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
        .split(/\n(?=\d+\.\s)/) // split at newline before "1. ", "2. ", etc.
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

exports.generateTechniqueQuestions = async (req, res) => {
  try {
    const { skill, experienceLevel, proficiencyLevel } = req.body;

    if (!skill) {
      return res.status(400).json({ error: "Missing 'skill' field" });
    }

    const profile = await Profile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

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

    // Determine mode: Specific level OR Mixed levels (1 to 5)
    let prompt;
    if (experienceLevel && proficiencyLevel) {
      if (proficiencyLevel < 1 || proficiencyLevel > 5) {
        return res
          .status(400)
          .json({ error: "Proficiency level must be between 1 and 5" });
      }

      const skillDescription = `${skill} (Experience: ${experienceLevel} years, Proficiency: ${proficiencyLevel}/5)`;
      prompt = `
You are an experienced technical interviewer specializing in ${skill}.
Generate **exactly 10** technical interview questions for someone with ${experienceLevel} years of experience and proficiency level ${proficiencyLevel}/5.
Questions should be a mix of theoretical and practical ones.

Return ONLY a JSON array of strings, like:
[
  "Question 1?",
  "Question 2?"
]
`.trim();
    } else {
      // Only skill provided → Mixed difficulty
      prompt = `
You are an expert interviewer for ${skill}.
Generate **exactly 10** interview questions covering levels 1 to 5:
- 2 easy questions (level 1)
- 2 beginner/intermediate (level 2)
- 2 intermediate+ (level 3)
- 2 advanced (level 4)
- 2 expert-level (level 5)

Return ONLY a JSON array of strings, like:
[
  "Question 1?",
  "Question 2?"
]
`.trim();
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `You are a technical interviewer generating skill-based questions.`,
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const raw = response.choices[0].message.content;

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

    // Fallback if not a clean JSON array
    if (!Array.isArray(questions)) {
      questions = raw
        .split(/\n(?=\d+\.\s)/)
        .map((q) => q.replace(/^\d+\.\s*/, "").trim())
        .filter(Boolean);
    }

    profile.quota += 1;
    await profile.save();

    res.json({
      skill,
      mode: experienceLevel && proficiencyLevel ? "targeted" : "mixed",
      experienceLevel: experienceLevel || "all",
      proficiencyLevel: proficiencyLevel || "1-5",
      questions,
      totalQuestions: questions.length,
      newQuota: profile.quota,
    });
  } catch (error) {
    console.error("Error generating technical questions:", error);
    res.status(500).json({ error: "Failed to generate technical questions" });
  }
};


exports.generateTechniqueQuestionsForJob = async (req, res) => {
  try {
    const jobId = req.params.id;

    if (!jobId) {
      return res.status(400).json({
        error: "Missing required params",
        required: {
          id: "The ID of the job",
        },
      });
    }

    // 2️⃣ Fetch required skills for the job
    const skillsData = await postService.getRequiredSkillsByPostId(jobId);

    if (
      !skillsData ||
      !skillsData.requiredSkills ||
      skillsData.requiredSkills.length === 0
    ) {
      return res
        .status(404)
        .json({ error: "No required skills found for this job" });
    }

    // 3️⃣ Format skill list for prompt
    const skillsList = skillsData.requiredSkills
      .map((skill) => `- ${skill.name} (Proficiency: ${skill.level}/5)`)
      .join("\n");

    // 4️⃣ Construct AI Prompt
    const prompt = `
You are an experienced technical interviewer specializing in multiple skills. 
Based on the candidate's profile, generate **exactly 10** technical interview questions.

Skills and proficiency levels:
${skillsList}

The questions should be appropriate for the given proficiency levels, mixing theoretical concepts, practical applications, and problem-solving scenarios.

**Return ONLY** a JSON array of strings—no commentary, no numbering, no markdown—like this:

[
  "Technical question 1?",
  "Technical question 2?",
  ...
]
`.trim();

    // 5️⃣ Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "Generate 10 highly relevant technical questions tailored to the listed skills and proficiency levels.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const raw = response.choices[0].message.content;

    // 6️⃣ Extract questions as JSON array
    let questions;
    try {
      questions = JSON.parse(raw.match(/\[([\s\S]*)\]/)[0]); // Extract JSON array safely
    } catch (error) {
      console.warn(
        "Failed to parse JSON, falling back to manual extraction:",
        error
      );
      questions = raw
        .split("\n")
        .map((q) => q.trim())
        .filter(Boolean)
        .slice(0, 10); // Fallback method
    }

    // 7️⃣ Return structured response
    res.json({
      jobId,
      requiredSkills: skillsData.requiredSkills,
      questions,
      totalQuestions: questions.length,
    });
  } catch (error) {
    console.error("Error generating multiple technical questions:", error);
    res.status(500).json({ error: "Failed to generate technical questions" });
  }
};

exports.generateSoftSkillQuestions = async (req, res) => {
  try {
    // 1. Validate request body
    const { skill, subSkills } = req.body;

    if (!skill) {
      return res.status(400).json({
        error: "Missing required fields",
        required: {
          skill: "Main soft skill (e.g., 'Communication', 'Leadership')",
          subSkills: "Sub-skill description (optional)",
        },
      });
    }

    // 2. Build the skill description with sub-skill if provided
    let skillDescription = skill;
    if (subSkills && typeof subSkills === "string" && subSkills.trim() !== "") {
      skillDescription += ` with focus on: ${subSkills}`;
    }

    // 3. Prompt: ask for exactly 10 behavioral questions as a JSON array
    const prompt = `
You are an experienced HR interviewer specializing in assessing soft skills.
Generate **exactly 10** behavioral interview questions to evaluate "${skillDescription}".
The questions should:
- Follow the STAR (Situation, Task, Action, Result) format
- Focus on real-life scenarios
- Help assess the candidate's ${skill} abilities${
      subSkills ? " particularly in " + subSkills : ""
    }
- Include questions about handling challenges and success stories
- Be specific and actionable

**Return ONLY** a JSON array of strings—no commentary, no numbering, no markdown—like this:

\`\`\`json
[
  "Behavioral question 1?",
  "Behavioral question 2?",
  // …
]
\`\`\`
`.trim();

    // 4. Call OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `You are an expert HR interviewer specializing in evaluating soft skills and behavioral competencies. 
                   Focus on creating questions that reveal past behaviors and experiences related to ${skillDescription}.
                   Questions should follow the STAR format and encourage detailed responses.`,
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 1000,
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
        .split(/\n(?=\d+\.\s)/)
        .map((q) => q.replace(/^\d+\.\s*/, ""))
        .map((q) => q.trim())
        .filter(Boolean);
    }

    // 7. Return the array with metadata
    res.json({
      skill,
      subSkills: subSkills || "",
      questions,
      totalQuestions: questions.length,
      format: "STAR (Situation, Task, Action, Result)",
      type: "behavioral",
    });
  } catch (error) {
    console.error("Error generating soft skill questions:", error);
    res.status(500).json({ error: "Failed to generate soft skill questions" });
  }
};

// Helper function to categorize scores
function getScoreCategory(score) {
  if (score >= 90) return "Excellent Match";
  if (score >= 70) return "Good Match";
  if (score >= 40) return "Partial Match";
  return "Low Match";
}

// Helper function to get experience level from proficiency level
function getExperienceLevel(proficiencyLevel) {
  const levels = ["Entry Level", "Junior", "Mid Level", "Senior", "Expert"];
  return levels[Math.min(Math.max(0, proficiencyLevel - 1), 4)];
}

// Helper function to determine mastery category
function getMasteryCategory(score) {
  if (score >= 90) return "Mastered";
  if (score >= 75) return "Proficient";
  if (score >= 60) return "Competent";
  if (score >= 40) return "Developing";
  return "Novice";
}

const profileService = require("../services/profileService");

exports.analyzeProfileAnswers = async (req, res) => {
  try {
    // 1. Validate request body
    const { type, skill, questions } = req.body;
    const user = req.user;

    if (!type || !Array.isArray(skill) || !Array.isArray(questions)) {
      return res.status(400).json({
        error: "Invalid request format",
        required: {
          type: "Type of assessment (e.g., 'technical')",
          skill: "Array of skill objects with name and proficiencyLevel",
          questions: "Array of question-answer pairs",
        },
      });
    }

    // Validate skill objects
    const isValidSkill = skill.every(
      (s) =>
        s.name &&
        typeof s.name === "string" &&
        typeof s.proficiencyLevel === "number" &&
        s.proficiencyLevel >= 1 &&
        s.proficiencyLevel <= 5
    );

    if (!isValidSkill) {
      return res.status(400).json({
        error: "Invalid skill format",
        message:
          "Each skill must have a name (string) and proficiencyLevel (number 1-5)",
      });
    }

    // 2. Prepare the data for GPT analysis
    const prompt = `
As an expert ${type} interviewer, analyze the following assessment:

Assessment Type: ${type}
Skills being assessed: 
${skill
  .map(
    (s) => `- ${s.name} (Current Proficiency Level: ${s.proficiencyLevel}/5)`
  )
  .join("\n")}

Questions and Answers:
${questions.map((qa) => `Q: ${qa.question}\nA: ${qa.answer}`).join("\n\n")}

Based on this ${type} assessment, provide a detailed analysis in the following JSON format ONLY (no additional text):
{
  "overallScore": 85,
  "skillAnalysis": [
    {
      "skillName": "JavaScript",
      "currentProficiency": 3,
      "demonstratedProficiency": 4,
      "strengths": ["Good understanding of core concepts"],
      "weaknesses": ["May need more practice with advanced topics"],
      "confidenceScore": 80,
      "improvement": "increased"
    }
  ],
  "generalAssessment": "Strong foundational knowledge with some areas for improvement",
  "recommendations": [
    "Focus on advanced JavaScript concepts",
    "Practice more with React hooks"
  ],
  "technicalLevel": "intermediate",
  "nextSteps": [
    "Suggested learning resources",
    "Practice projects to undertake"
  ],
  "assessmentType": "${type}",
  "evaluationContext": "Based on ${type} interview standards"
}`;

    // 3. Call OpenAI for analysis
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `You are an expert ${type} interviewer specializing in evaluating developer skills. 
                   Analyze both the answers and the progression from their current proficiency levels.
                   Provide detailed, actionable feedback in JSON format only.`,
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    // 4. Parse and validate the response
    let analysis;
    try {
      const rawResponse = response.choices[0].message.content.trim();

      // Try to extract JSON if it's wrapped in markdown code blocks
      let jsonStr = rawResponse;
      const jsonMatch = rawResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      }

      // Clean the string before parsing
      jsonStr = jsonStr
        .trim()
        .replace(/[\u200B-\u200D\uFEFF]/g, "") // Remove zero-width spaces
        .replace(/^[^{]*/, "") // Remove any text before the first {
        .replace(/[^}]*$/, ""); // Remove any text after the last }

      try {
        analysis = JSON.parse(jsonStr);
      } catch (firstError) {
        console.error("First parse attempt failed:", firstError);

        // Second attempt: Try to fix common JSON issues
        jsonStr = jsonStr
          .replace(/,(\s*[}\]])/g, "$1") // Remove trailing commas
          .replace(/'/g, '"') // Replace single quotes with double quotes
          .replace(/\n/g, " ") // Remove newlines
          .replace(/\s+/g, " "); // Normalize whitespace

        analysis = JSON.parse(jsonStr);
      }

      // Validate required fields
      if (!analysis || typeof analysis !== "object") {
        throw new Error("Analysis is not an object");
      }

      if (!analysis.skillAnalysis || !Array.isArray(analysis.skillAnalysis)) {
        throw new Error("Missing or invalid skillAnalysis array");
      }

      // Ensure all required fields are present
      const requiredFields = [
        "overallScore",
        "skillAnalysis",
        "generalAssessment",
        "recommendations",
      ];
      const missingFields = requiredFields.filter(
        (field) => !(field in analysis)
      );

      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
      }

      // Normalize the response structure if needed
      analysis = {
        overallScore: Number(analysis.overallScore) || 0,
        skillAnalysis: analysis.skillAnalysis.map((skill) => {
          console.log("skill", skill);
          // Valeurs brutes envoyées par ChatGPT (ou par ta logique précédente)
          const current = Number(skill.currentProficiency) || 0;
          const rawDemo = Number(skill.demonstratedProficiency) || current;
          const score = Number(skill.confidenceScore) || 0;
          console.log("current", current);
          console.log("rawDemo", rawDemo);
          console.log("score", score);
          // ➜ Appliquer la règle demandée
          let demo;
          if (score > 70) demo = current + 1;
          else if (score >= 50) demo = current;
          else demo = current - 1;

          // S'assurer que le niveau reste entre 1 et 5
          demo = Math.min(Math.max(demo, 1), 5);
          console.log("demo", demo);
          return {
            skillName: skill.skillName || skill.skill || "",
            currentProficiency: current,
            demonstratedProficiency: demo,
            currentExperienceLevel: getExperienceLevel(current),
            demonstratedExperienceLevel: getExperienceLevel(demo),
            strengths: Array.isArray(skill.strengths) ? skill.strengths : [],
            weaknesses: Array.isArray(skill.weaknesses) ? skill.weaknesses : [],
            confidenceScore: score,
            improvement:
              demo > current
                ? "increased"
                : demo < current
                ? "decreased"
                : "unchanged",
          };
        }),
        generalAssessment: analysis.generalAssessment || "",
        recommendations: Array.isArray(analysis.recommendations)
          ? analysis.recommendations
          : [],
        technicalLevel: analysis.technicalLevel || "intermediate",
        nextSteps: Array.isArray(analysis.nextSteps) ? analysis.nextSteps : [],
        experienceLevels: [
          "Entry Level",
          "Junior",
          "Mid Level",
          "Senior",
          "Expert",
        ],
      };
      console.log(analysis);
    } catch (error) {
      console.error("Detailed error in analysis parsing:", error);
      console.error("Original response:", response.choices[0].message.content);

      return res.status(200).json({
        success: true,
        result: {
          timestamp: new Date(),
          assessmentType: type,
          skillsAssessed: skill.map((s) => ({
            ...s,
            experienceLevel: getExperienceLevel(s.proficiencyLevel),
          })),
          numberOfQuestions: questions.length,
          analysis: {
            overallScore: 70,
            experienceLevels: [
              "Entry Level",
              "Junior",
              "Mid Level",
              "Senior",
              "Expert",
            ],
            skillAnalysis: skill.map((s) => ({
              skillName: s.name,
              currentProficiency: s.proficiencyLevel,
              demonstratedProficiency: s.proficiencyLevel,
              currentExperienceLevel: getExperienceLevel(s.proficiencyLevel),
              demonstratedExperienceLevel: getExperienceLevel(
                s.proficiencyLevel
              ),
              strengths: ["Assessment incomplete"],
              weaknesses: ["Could not analyze in detail"],
              confidenceScore: 60,
              improvement: "unchanged",
            })),
            generalAssessment: "Analysis could not be completed fully",
            recommendations: ["Please try the assessment again"],
            technicalLevel: "intermediate",
            nextSteps: ["Retry the assessment"],
          },
        },
      });
    }

    // 5. Add metadata to the response
    const result = {
      timestamp: new Date(),
      assessmentType: type,
      skillsAssessed: skill.map((s) => ({
        ...s,
        experienceLevel: getExperienceLevel(s.proficiencyLevel),
      })),
      numberOfQuestions: questions.length,
      analysis: {
        ...analysis,
        skillProgression: analysis.skillAnalysis.map((skillAnalysis) => {
          const originalSkill = skill.find(
            (s) => s.name === skillAnalysis.skillName
          );
          const currentLevel = originalSkill
            ? originalSkill.proficiencyLevel
            : 1;
          return {
            ...skillAnalysis,
            proficiencyChange:
              skillAnalysis.demonstratedProficiency - currentLevel,
            masteryCategory: getMasteryCategory(skillAnalysis.confidenceScore),
            levelProgression: {
              from: getExperienceLevel(currentLevel),
              to: getExperienceLevel(skillAnalysis.demonstratedProficiency),
              changed: currentLevel !== skillAnalysis.demonstratedProficiency,
            },
          };
        }),
      },
    };
    console.log(user);
    console.log(result);
    if (user.profile.overallScore === 0 && type === "technical") {
      console.log("test");
      const profile = await profileService.createOrUpdateProfile(user._id, {
        overallScore: analysis.overallScore,
        skills: analysis.skillAnalysis.map((skill) => ({
          name: skill.skillName,
          proficiencyLevel: skill.demonstratedProficiency,
          experienceLevel: getExperienceLevel(skill.demonstratedProficiency),
        })),
      });
      console.log(profile);
    } else {
      console.log("test2");
      const profileOverallScore = await profileService.getProfileByUserId(
        user._id
      );
      const profile = await profileService.createOrUpdateProfile(user._id, {
        overallScore:
          (profileOverallScore.overallScore + analysis.overallScore) / 2,
        skills: analysis.skillAnalysis.map((skill) => ({
          name: skill.skillName,
          proficiencyLevel: skill.demonstratedProficiency,
          experienceLevel: getExperienceLevel(skill.demonstratedProficiency),
          ScoreTest: skill.confidenceScore,
        })),
      });
      console.log(profile);
    }

    if (user.profile.overallScore === 0 && type === "soft") {
      await profileService.createOrUpdateProfile(user._id, {
        softSkills: analysis.skillAnalysis.map((s) => ({
          // ✅
          name: s.skillName,
          category: s.category || "", // si fourni
          experienceLevel: getExperienceLevel(s.demonstratedProficiency),
          ScoreTest: s.confidenceScore,
        })),
      });
    } else if (type === "soft") {
      const old = await profileService.getProfileByUserId(user._id);
      await profileService.createOrUpdateProfile(user._id, {
        softSkills: analysis.skillAnalysis.map((s) => ({
          name: s.skillName,
          category: s.category || "",
          experienceLevel: getExperienceLevel(s.demonstratedProficiency),
          ScoreTest: s.confidenceScore,
        })),
      });
    }

    res.status(200).json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("Error analyzing profile answers:", error);
    res.status(500).json({
      success: false,
      error: "Failed to analyze profile",
      details: error.message,
    });
  }
};

exports.analyzeJobTestResults = async (req, res) => {
  try {
    // 1. Validate request body
    const { questions, jobId } = req.body;
    const user = req.user;
    const condidateProfile = await profileService.getProfileByUserId(user._id);

    if (!condidateProfile) {
      return { message: "Aucun profil trouvé pour cet utilisateur." };
    }
    const condidateId = condidateProfile._id;

    if (!Array.isArray(questions) || !jobId) {
      return res.status(400).json({
        error: "Invalid request format",
        required: {
          questions: "Array of question-answer pairs",
          jobId: "ID of the job posting",
        },
      });
    }

    // 2. Get job requirements
    const skillsData = await postService.getRequiredSkillsByPostId(jobId);
    if (
      !skillsData ||
      !skillsData.requiredSkills ||
      skillsData.requiredSkills.length === 0
    ) {
      return res
        .status(404)
        .json({ error: "No required skills found for this job" });
    }

    // 3. Prepare the data for GPT analysis
    const prompt = `
As an expert technical interviewer, analyze the following job assessment:

Required Skills for the Position:
${skillsData.requiredSkills
  .map((skill) => `- ${skill.name} (Required Level: ${skill.level}/5)`)
  .join("\n")}

Questions and Answers:
${questions
  .map((qa) => `Q: ${qa.question}\nA: ${qa.answer || "No answer provided"}`)
  .join("\n\n")}

Based on this assessment, provide a detailed analysis in the following JSON format ONLY (no additional text):
{
  "overallScore": 85,
  "skillAnalysis": [
    {
      "skillName": "JavaScript",
      "requiredLevel": 4,
      "demonstratedLevel": 3,
      "strengths": ["Good understanding of core concepts"],
      "weaknesses": ["May need more practice with advanced topics"],
      "confidenceScore": 75,
      "match": "partial"
    }
  ],
  "generalAssessment": "Strong foundational knowledge with some areas for improvement",
  "recommendations": [
    "Focus on advanced JavaScript concepts",
    "Practice more with React hooks"
  ],
  "technicalLevel": "intermediate",
  "nextSteps": [
    "Suggested learning resources",
    "Practice projects to undertake"
  ],
  "jobMatch": {
    "percentage": 75,
    "status": "partial",
    "keyGaps": ["Advanced JavaScript", "React Hooks"]
  }
}`;

    // 4. Call OpenAI for analysis
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `You are an expert technical interviewer specializing in evaluating developer skills for job positions. 
                   Analyze both the answers and compare them against the required skill levels.
                   Provide detailed, actionable feedback in JSON format only.`,
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    // 5. Parse and validate the response
    let analysis;
    try {
      const rawResponse = response.choices[0].message.content.trim();
      let jsonStr = rawResponse;
      const jsonMatch = rawResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      }

      // Clean the string before parsing
      jsonStr = jsonStr
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

      // Validate required fields
      if (!analysis || typeof analysis !== "object") {
        throw new Error("Analysis is not an object");
      }

      if (!analysis.skillAnalysis || !Array.isArray(analysis.skillAnalysis)) {
        throw new Error("Missing or invalid skillAnalysis array");
      }

      // Ensure all required fields are present
      const requiredFields = [
        "overallScore",
        "skillAnalysis",
        "generalAssessment",
        "recommendations",
        "jobMatch",
      ];
      const missingFields = requiredFields.filter(
        (field) => !(field in analysis)
      );

      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
      }

      // Normalize the response structure
      analysis = {
        overallScore: Number(analysis.overallScore) || 0,
        skillAnalysis: analysis.skillAnalysis.map((skill) => ({
          skillName: skill.skillName || skill.skill || "",
          requiredLevel: Number(skill.requiredLevel) || 0,
          demonstratedLevel: Number(skill.demonstratedLevel) || 0,
          strengths: Array.isArray(skill.strengths) ? skill.strengths : [],
          weaknesses: Array.isArray(skill.weaknesses) ? skill.weaknesses : [],
          confidenceScore: Number(skill.confidenceScore) || 0,
          match: skill.match || "none",
          levelGap:
            Number(skill.requiredLevel) - Number(skill.demonstratedLevel),
        })),
        generalAssessment: analysis.generalAssessment || "",
        recommendations: Array.isArray(analysis.recommendations)
          ? analysis.recommendations
          : [],
        technicalLevel: analysis.technicalLevel || "intermediate",
        nextSteps: Array.isArray(analysis.nextSteps) ? analysis.nextSteps : [],
        jobMatch: {
          percentage: Number(analysis.jobMatch?.percentage) || 0,
          status: analysis.jobMatch?.status || "none",
          keyGaps: Array.isArray(analysis.jobMatch?.keyGaps)
            ? analysis.jobMatch.keyGaps
            : [],
        },
      };
    } catch (error) {
      console.error("Error in analysis parsing:", error);
      return res.status(200).json({
        success: true,
        result: {
          timestamp: new Date(),
          assessmentType: "job",
          jobId,
          numberOfQuestions: questions.length,
          analysis: {
            overallScore: 70,
            skillAnalysis: skillsData.requiredSkills.map((skill) => ({
              skillName: skill.name,
              requiredLevel: skill.level,
              demonstratedLevel: skill.level - 1,
              strengths: ["Assessment incomplete"],
              weaknesses: ["Could not analyze in detail"],
              confidenceScore: 60,
              match: "partial",
              levelGap: 1,
            })),
            generalAssessment: "Analysis could not be completed fully",
            recommendations: ["Please try the assessment again"],
            technicalLevel: "intermediate",
            nextSteps: ["Retry the assessment"],
            jobMatch: {
              percentage: 60,
              status: "partial",
              keyGaps: ["Assessment incomplete"],
            },
          },
        },
      });
    }

    const company = await profileService.getProfileByPostId(jobId);
    const companyId = company._id;
    // 6. Format final response
    const result = new JobAssessmentResult({
      timestamp: new Date(),
      assessmentType: "job",
      jobId,
      condidateId,
      companyId,
      numberOfQuestions: questions.length,
      analysis: {
        ...analysis,
        skillProgression: analysis.skillAnalysis.map((skillAnalysis) => {
          const requiredSkill = skillsData.requiredSkills.find(
            (s) => s.name === skillAnalysis.skillName
          );
          return {
            ...skillAnalysis,
            requiredSkill: requiredSkill
              ? {
                  name: requiredSkill.name,
                  level: requiredSkill.level,
                  experienceLevel: getExperienceLevel(requiredSkill.level),
                }
              : null,
            demonstratedExperienceLevel: getExperienceLevel(
              skillAnalysis.demonstratedLevel
            ),
            masteryCategory: getMasteryCategory(skillAnalysis.confidenceScore),
          };
        }),
      },
    });

    await result.save();

    // 3. Save the updated profile with the new assesmentResult
    if (!Array.isArray(company.assessmentResults)) {
      company.assessmentResults = [];
    }
    company.assessmentResults.push(result._id);
    await company.save();

    res.status(200).json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("Error analyzing job test results:", error);
    res.status(500).json({
      success: false,
      error: "Failed to analyze job test results",
      details: error.message,
    });
  }
};
