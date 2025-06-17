// generateQuestions.js
const { Together } = require("together-ai");
require("dotenv").config();

const {
  generateOnboardingQuestionsPrompts,
  analyzeOnbordingQuestionsPrompts,
  analyzeJobTestResultsPrompts,
} = require("../prompts/evaluationPrompts");

const JobAssessmentResult = require("../models/JobAssessmentResultModel");
const Profile = require("../models/ProfileModel");
const TodoList = require("../models/todoListModel");
const Post = require("../models/PostModel");

const postService = require("../services/postService");
const evaluationservice = require("../services/evaluationService");

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

      //situational 3 ,4 ,5
    } else {
      // Only skill provided → Mixed difficulty
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

    // 5️⃣ Call TogetherAI API
    const stream = await together.chat.completions.create({
      model: "meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8",
      messages: [
        {
          role: "system",
          content: `You are a technical interviewer generating skill-based questions.`,
        },
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

    // 5️⃣ Call TogetherAI API
    const stream = await together.chat.completions.create({
      model: "meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8",
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

    profile.quota += 1;
    await profile.save();

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
const { HttpError } = require("../utils/httpUtils");

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
          skill:
            "Array of skill objects with name and proficiencyLevel (and optional subcategory)",
          questions: "Array of question-answer pairs",
        },
      });
    }

    // Validate skill objects - allow optional subcategory for soft skills
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

    // Build a map for skillName -> subcategory (for soft skills)
    const skillSubcategories = {};
    skill.forEach((s) => {
      if (s.name && s.subcategory) {
        skillSubcategories[s.name] = s.subcategory;
      }
    });

    // 2. Prepare the data for GPT analysis
    const prompt = `
As an expert ${type} interviewer, analyze the following assessment:

Assessment Type: ${type}
Skills being assessed: 
${skill
  .map(
    (s) =>
      `- ${s.name} (Current Proficiency Level: ${s.proficiencyLevel}/5${
        s.subcategory ? `, Subcategory: ${s.subcategory}` : ""
      })`
  )
  .join("\n")}

Questions and Answers:
${questions.map((qa) => `Q: ${qa.question}\nA: ${qa.answer}`).join("\n\n")}

Based on this ${type} assessment, provide a detailed analysis in the following JSON format ONLY (no additional text):
{
  "overallScore": 85,
  "skillAnalysis": [
    {
      "skillName": "Teamwork",
      "currentProficiency": 3,
      "demonstratedProficiency": 4,
      "strengths": ["Good communication"],
      "weaknesses": ["Needs improvement in conflict resolution"],
      "confidenceScore": 80,
      "improvement": "increased",
      "subcategory": "conflict-resolution"  // optional, if applicable
    }
  ],
  "generalAssessment": "Strong foundational knowledge with some areas for improvement",
  "recommendations": [
    "Focus on advanced communication techniques",
    "Practice conflict management"
  ],
  "technicalLevel": "intermediate",
  "nextSteps": [
    "Suggested learning resources",
    "Practice projects to undertake"
  ],
  "assessmentType": "${type}",
  "evaluationContext": "Based on ${type} interview standards"
}`;

    const response = await together.chat.completions.create({
      model: "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
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
      stream: true,
    });

    let rawResponse = "";
    for await (const chunk of response) {
      const content = chunk.choices?.[0]?.delta?.content;
      if (content) rawResponse += content;
    }

    // 4. Parse and validate the response
    let analysis;
    try {
      rawResponse = rawResponse.trim();

      let jsonStr = rawResponse;
      const jsonMatch = rawResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      }

      jsonStr = jsonStr
        .trim()
        .replace(/[\u200B-\u200D\uFEFF]/g, "") // Remove zero-width spaces
        .replace(/^[^{]*/, "") // Remove any text before the first {
        .replace(/[^}]*$/, ""); // Remove any text after the last }

      try {
        analysis = JSON.parse(jsonStr);
      } catch (firstError) {
        // Attempt to fix common JSON issues
        jsonStr = jsonStr
          .replace(/,(\s*[}\]])/g, "$1") // Remove trailing commas
          .replace(/'/g, '"') // Replace single quotes with double quotes
          .replace(/\n/g, " ") // Remove newlines
          .replace(/\s+/g, " "); // Normalize whitespace

        analysis = JSON.parse(jsonStr);
      }

      if (!analysis || typeof analysis !== "object") {
        throw new Error("Analysis is not an object");
      }

      if (!analysis.skillAnalysis || !Array.isArray(analysis.skillAnalysis)) {
        throw new Error("Missing or invalid skillAnalysis array");
      }

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

      analysis = {
        overallScore: Number(analysis.overallScore) || 0,
        skillAnalysis: analysis.skillAnalysis.map((skill) => {
          const current = Number(skill.currentProficiency) || 0;
          const rawDemo = Number(skill.demonstratedProficiency) || current;
          const score = Number(skill.confidenceScore) || 0;

          let demo;
          /*if (score > 70) demo = current + 1;
          else if (score >= 50) demo = current;
          else demo = current - 1;*/

          if (score >= 65) demo = current + 1;
          else demo = current;

          demo = Math.min(Math.max(demo, 1), 5);

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
            // Pass subcategory if returned by GPT or fallback to known from front
            subcategory:
              skill.subcategory ||
              skillSubcategories[skill.skillName || skill.skill] ||
              "",
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
    } catch (error) {
      console.error("Detailed error in analysis parsing:", error);
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
              subcategory: s.subcategory || "",
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

    // 6. Save profile data based on assessment type
    if (type === "technical") {
      console.log("type", type);
      const profileOverallScore = await profileService.getProfileByUserId(
        user._id
      );
      await profileService.createOrUpdateProfile(user._id, {
        overallScore:
          profileOverallScore.overallScore === 0
            ? analysis.overallScore
            : (profileOverallScore.overallScore + analysis.overallScore) / 2,
        skills: analysis.skillAnalysis.map((skill) => ({
          name: skill.skillName,
          proficiencyLevel: skill.demonstratedProficiency,
          experienceLevel: getExperienceLevel(skill.demonstratedProficiency),
          ScoreTest: skill.confidenceScore,
          Levelconfirmed:
          skill.demonstratedProficiency === 5 && skill.confidenceScore > 75
            ? 5
            : profLevel - 1,          })),
      });
    }

    if (type === "soft") {
      const profile = await Profile.findOne({ userId: user._id });
      const newOverallScore =
        profile.overallScore === 0
          ? analysis.overallScore
          : (profile.overallScore + analysis.overallScore) / 2;

      const updated = await Profile.findOneAndUpdate(
        { userId: user._id },
        {
          overallScore: newOverallScore,
          softSkills: analysis.skillAnalysis.map((s) => ({
            name: s.skillName,
            category: s.subcategory || "",
            experienceLevel: getExperienceLevel(s.demonstratedProficiency),
            ScoreTest: s.confidenceScore,
            Levelconfirmed:
            skill.demonstratedProficiency === 5 && skill.confidenceScore > 75
              ? 5
              : profLevel - 1,            })),
        },
        { new: true }
      );
      console.log("Updated profile softSkills:", updated.softSkills);
    }

    // Après avoir reçu et parsé la réponse brute de GPT en "analysis"
    if (type === "technicalSkill") {
      //AddNewTechnicalSkill
      const profileOverallScore = await profileService.getProfileByUserId(
        user._id
      );

      function proficiencyFromConfidenceScore(score) {
        if (score >= 0 && score <= 20) return 1;
        if (score > 20 && score <= 30) return 2;
        if (score > 30 && score <= 50) return 3;
        if (score > 50 && score <= 80) return 4;
        if (score > 80 && score <= 100) return 5;
        return 1; // défaut si hors bornes
      }

      const experienceLevels = [
        "Entry Level",
        "Junior",
        "Mid Level",
        "Senior",
        "Expert",
      ];

      // Construction des compétences à partir des données valides
      const validSkills = analysis.skillAnalysis.filter(
        (skill) => Number(skill.confidenceScore) > 0
      );

      const mappedSkills = validSkills.map((skill) => {
        const confScore = Number(skill.confidenceScore);
        const profLevel = proficiencyFromConfidenceScore(confScore);
        return {
          skillName: skill.skillName || skill.skill || "",
          currentProficiency: Number(skill.currentProficiency) || 1,
          demonstratedProficiency: Number(skill.demonstratedProficiency) || 1,
          currentExperienceLevel: getExperienceLevel(
            Number(skill.currentProficiency) || 1
          ),
          demonstratedExperienceLevel: getExperienceLevel(
            Number(skill.demonstratedProficiency) || 1
          ),
          strengths: Array.isArray(skill.strengths) ? skill.strengths : [],
          weaknesses: Array.isArray(skill.weaknesses) ? skill.weaknesses : [],
          confidenceScore: confScore,
          improvement:
            (Number(skill.demonstratedProficiency) || 1) >
            (Number(skill.currentProficiency) || 1)
              ? "increased"
              : (Number(skill.demonstratedProficiency) || 1) <
                (Number(skill.currentProficiency) || 1)
              ? "decreased"
              : "unchanged",
          subcategory:
            skill.subcategory ||
            skillSubcategories[skill.skillName || skill.skill] ||
            "",
          proficiencyLevel: profLevel,
          experienceLevel: experienceLevels[profLevel - 1],
        };
      });

      // Utiliser uniquement si on a au moins une skill valide
      if (mappedSkills.length > 0) {
        await profileService.createOrUpdateProfile(user._id, {
          overallScore:
            profileOverallScore.overallScore === 0
              ? analysis.overallScore
              : (profileOverallScore.overallScore + analysis.overallScore) / 2,
          skills: validSkills.map((skill) => {
            const confScore = Number(skill.confidenceScore);
            const profLevel = proficiencyFromConfidenceScore(confScore);
            return {
              name: skill.skillName || skill.skill || "",
              proficiencyLevel: profLevel,
              experienceLevel: experienceLevels[profLevel - 1],
              ScoreTest: confScore,
              Levelconfirmed:
              skill.demonstratedProficiency === 5 && skill.confidenceScore > 75
                ? 5
                : profLevel - 1,                    
            };
          }),
        });
      }
    }

    // 7. Return the response
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

// exports.analyzeJobTestResults = async (req, res) => {
//   try {
//     // 1. Validate request body
//     const { questions, jobId } = req.body;
//     const user = req.user;
//     const condidateProfile = await profileService.getProfileByUserId(user._id);

//     if (!condidateProfile) {
//       return { message: "Aucun profil trouvé pour cet utilisateur." };
//     }
//     const condidateId = condidateProfile._id;

//     if (!Array.isArray(questions) || !jobId) {
//       return res.status(400).json({
//         error: "Invalid request format",
//         required: {
//           questions: "Array of question-answer pairs",
//           jobId: "ID of the job posting",
//         },
//       });
//     }

//     // 2. Get job requirements
//     const skillsData = await postService.getRequiredSkillsByPostId(jobId);
//     if (
//       !skillsData ||
//       !skillsData.requiredSkills ||
//       skillsData.requiredSkills.length === 0
//     ) {
//       return res
//         .status(404)
//         .json({ error: "No required skills found for this job" });
//     }

//     // 3. Prepare the data for GPT analysis
//     const prompt = `
// As an expert technical interviewer, analyze the following job assessment:

// Required Skills for the Position:
// ${skillsData.requiredSkills
//   .map((skill) => `- ${skill.name} (Required Level: ${skill.level}/5)`)
//   .join("\n")}

// Questions and Answers:
// ${questions
//   .map((qa) => `Q: ${qa.question}\nA: ${qa.answer || "No answer provided"}`)
//   .join("\n\n")}

// Based on this assessment, provide a detailed analysis in the following JSON format ONLY (no additional text):
// {
//   "overallScore": 85,
//   "skillAnalysis": [
//     {
//       "skillName": "JavaScript",
//       "requiredLevel": 4,
//       "demonstratedLevel": 3,
//       "strengths": ["Good understanding of core concepts"],
//       "weaknesses": ["May need more practice with advanced topics"],
//       "confidenceScore": 75,
//       "match": "partial"
//     }
//   ],
//   "generalAssessment": "Strong foundational knowledge with some areas for improvement",
//   "recommendations": [
//     "Focus on advanced JavaScript concepts",
//     "Practice more with React hooks"
//   ],
//   "technicalLevel": "intermediate",
//   "nextSteps": [
//     "Suggested learning resources",
//     "Practice projects to undertake"
//   ],
//   "jobMatch": {
//     "percentage": 75,
//     "status": "partial",
//     "keyGaps": ["Advanced JavaScript", "React Hooks"]
//   }
// }`;

//     // 4. Call TogetherAI API for analysis
//     const stream = await together.chat.completions.create({
//       model: "deepseek-ai/DeepSeek-V3",
//       messages: [
//         {
//           role: "system",
//           content: `You are an expert technical interviewer specializing in evaluating developer skills for job positions.
//                    Analyze both the answers and compare them against the required skill levels.
//                    Provide detailed, actionable feedback in JSON format only.`,
//         },
//         { role: "user", content: prompt },
//       ],
//       max_tokens: 1000,
//       temperature: 0.7,
//       stream: true,
//     });

//     let raw = "";
//     for await (const chunk of stream) {
//       const content = chunk.choices?.[0]?.delta?.content;
//       if (content) raw += content;
//     }

//     // 5. Parse and validate the response
//     let analysis;
//     try {
//       const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
//       if (jsonMatch) {
//         jsonStr = jsonMatch[1];
//       }

//       // Clean the string before parsing
//       jsonStr = jsonStr
//         .trim()
//         .replace(/[\u200B-\u200D\uFEFF]/g, "")
//         .replace(/^[^{]*/, "")
//         .replace(/[^}]*$/, "");

//       try {
//         analysis = JSON.parse(jsonStr);
//       } catch (firstError) {
//         console.error("First parse attempt failed:", firstError);
//         jsonStr = jsonStr
//           .replace(/,(\s*[}\]])/g, "$1")
//           .replace(/'/g, '"')
//           .replace(/\n/g, " ")
//           .replace(/\s+/g, " ");
//         analysis = JSON.parse(jsonStr);
//       }

//       // Validate required fields
//       if (!analysis || typeof analysis !== "object") {
//         throw new Error("Analysis is not an object");
//       }

//       if (!analysis.skillAnalysis || !Array.isArray(analysis.skillAnalysis)) {
//         throw new Error("Missing or invalid skillAnalysis array");
//       }

//       // Ensure all required fields are present
//       const requiredFields = [
//         "overallScore",
//         "skillAnalysis",
//         "generalAssessment",
//         "recommendations",
//         "jobMatch",
//       ];
//       const missingFields = requiredFields.filter(
//         (field) => !(field in analysis)
//       );

//       if (missingFields.length > 0) {
//         throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
//       }

//       // Normalize the response structure
//       analysis = {
//         overallScore: Number(analysis.overallScore) || 0,
//         skillAnalysis: analysis.skillAnalysis.map((skill) => ({
//           skillName: skill.skillName || skill.skill || "",
//           requiredLevel: Number(skill.requiredLevel) || 0,
//           demonstratedLevel: Number(skill.demonstratedLevel) || 0,
//           strengths: Array.isArray(skill.strengths) ? skill.strengths : [],
//           weaknesses: Array.isArray(skill.weaknesses) ? skill.weaknesses : [],
//           confidenceScore: Number(skill.confidenceScore) || 0,
//           match: skill.match || "none",
//           levelGap:
//             Number(skill.requiredLevel) - Number(skill.demonstratedLevel),
//         })),
//         generalAssessment: analysis.generalAssessment || "",
//         recommendations: Array.isArray(analysis.recommendations)
//           ? analysis.recommendations
//           : [],
//         technicalLevel: analysis.technicalLevel || "intermediate",
//         nextSteps: Array.isArray(analysis.nextSteps) ? analysis.nextSteps : [],
//         jobMatch: {
//           percentage: Number(analysis.jobMatch?.percentage) || 0,
//           status: analysis.jobMatch?.status || "none",
//           keyGaps: Array.isArray(analysis.jobMatch?.keyGaps)
//             ? analysis.jobMatch.keyGaps
//             : [],
//         },
//       };
//     } catch (error) {
//       console.error("Error in analysis parsing:", error);
//       return res.status(200).json({
//         success: true,
//         result: {
//           timestamp: new Date(),
//           assessmentType: "job",
//           jobId,
//           numberOfQuestions: questions.length,
//           analysis: {
//             overallScore: 70,
//             skillAnalysis: skillsData.requiredSkills.map((skill) => ({
//               skillName: skill.name,
//               requiredLevel: skill.level,
//               demonstratedLevel: skill.level - 1,
//               strengths: ["Assessment incomplete"],
//               weaknesses: ["Could not analyze in detail"],
//               confidenceScore: 60,
//               match: "partial",
//               levelGap: 1,
//             })),
//             generalAssessment: "Analysis could not be completed fully",
//             recommendations: ["Please try the assessment again"],
//             technicalLevel: "intermediate",
//             nextSteps: ["Retry the assessment"],
//             jobMatch: {
//               percentage: 60,
//               status: "partial",
//               keyGaps: ["Assessment incomplete"],
//             },
//           },
//         },
//       });
//     }

//     const company = await profileService.getProfileByPostId(jobId);
//     const companyId = company._id;
//     // 6. Format final response
//     const result = new JobAssessmentResult({
//       timestamp: new Date(),
//       assessmentType: "job",
//       jobId,
//       condidateId,
//       companyId,
//       numberOfQuestions: questions.length,
//       analysis: {
//         ...analysis,
//         skillProgression: analysis.skillAnalysis.map((skillAnalysis) => {
//           const requiredSkill = skillsData.requiredSkills.find(
//             (s) => s.name === skillAnalysis.skillName
//           );
//           return {
//             ...skillAnalysis,
//             requiredSkill: requiredSkill
//               ? {
//                   name: requiredSkill.name,
//                   level: requiredSkill.level,
//                   experienceLevel: getExperienceLevel(requiredSkill.level),
//                 }
//               : null,
//             demonstratedExperienceLevel: getExperienceLevel(
//               skillAnalysis.demonstratedLevel
//             ),
//             masteryCategory: getMasteryCategory(skillAnalysis.confidenceScore),
//           };
//         }),
//       },
//     });

//     await result.save();

//     // 3. Save the updated profile with the new assesmentResult
//     if (!Array.isArray(company.assessmentResults)) {
//       company.assessmentResults = [];
//     }
//     company.assessmentResults.push(result._id);
//     await company.save();

//     res.status(200).json({
//       success: true,
//       result,
//     });
//   } catch (error) {
//     console.error("Error analyzing job test results:", error);
//     res.status(500).json({
//       success: false,
//       error: "Failed to analyze job test results",
//       details: error.message,
//     });
//   }
// };

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

exports.generateOnboardingQuestions = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({ error: "User not found." });
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

    const { skills } = req.body;
    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      return res
        .status(400)
        .json({ error: "skills is required and must be a non-empty array." });
    }

    if (skills.length != 1) {
      return res
        .status(400)
        .json({ error: "skills must include only one skill" });
    }

    const skillName = skills[0].name;

    const questionsCount = 10;

    const systemPrompt =
      generateOnboardingQuestionsPrompts.getSystemPrompt(questionsCount);
    const userPrompt = generateOnboardingQuestionsPrompts.getUserPrompt(
      questionsCount,
      skillName
    );
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

    // 5. Try to extract & parse the JSON array
    raw = raw
      .replace(/^```json\n/, "")
      .replace(/\n```$/, "")
      .trim();
    let questions;

    try {
      questions = JSON.parse(raw);
    } catch (e) {
      console.warn("JSON parse failed on cleaned text, falling back:", e);
      questions = [];
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

exports.analyzeOnboardingAnswers = async (req, res) => {
  try {
    const { questions, skill } = req.body;
    const user = req.user;

    if (!Array.isArray(skill)) {
      return res.status(400).json({
        error: "Invalid request format",
        required: {
          skill:
            "Array of skill objects with name and proficiencyLevel (and optional subcategory)",
        },
      });
    }

    if (!Array.isArray(skill) || !Array.isArray(questions)) {
      return res.status(400).json({
        error: "Invalid request format",
        required: {
          questions: "Array of question-answer pairs",
        },
      });
    }

    // Validate skill objects - allow optional subcategory for soft skills
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

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const profile = await Profile.findById(user.profile);
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    const todoList = await TodoList.findById(profile.todoList);
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    const skillName = skill[0].name;
    const systemPrompt = analyzeOnbordingQuestionsPrompts.getSystemPrompt();
    const userPrompt = analyzeOnbordingQuestionsPrompts.getUserPrompt(
      skillName,
      questions
    );

    // 4. Call TogetherAI API for analysis
    const stream = await together.chat.completions.create({
      model: "deepseek-ai/DeepSeek-V3",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        { role: "user", content: userPrompt },
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

    // 5. Parse and validate the response
    let analysis;
    let jsonStr;
    try {
      const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
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
        "technicalLevel",
        "generalAssassment",
        "recommendations",
        "nextSteps",
        "skillAnalysis",
      ];
      const missingFields = requiredFields.filter(
        (field) => !(field in analysis)
      );

      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
      }

      /*Depending on the calculated overallScore in the analysis Set: 
       - the technicalLevel 
       - demonstratedExperienceLevel 
      */
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

      // set the technicalLevel in the analysis result:
      analysis.technicalLevel = experienceLevelString;
      analysis.skillAnalysis[0].requiredLevel = demonstratedExperienceLevel;
      analysis.skillAnalysis[0].demonstratedExperienceLevel =
        demonstratedExperienceLevel;

      // add skill to profile if experienceLevel is proven
      if (demonstratedExperienceLevel > 0) {
        profile.skills = [
          {
            name: analysis.skillAnalysis[0].skillName,
            proficiencyLevel: demonstratedExperienceLevel,
            experienceLevel: experienceLevelString,
            NumberTestPassed: 1,
            ScoreTest: overallScore,
            Levelconfirmed:
            demonstratedExperienceLevel === 5 && overallScore > 75
              ? 5
              : demonstratedExperienceLevel - 1,  
          },
        ];

        await profile.save();

        const index = todoList.todos.findIndex((todo) => todo.type === "Skill");
        if (index !== -1) {
          todoList.todos[index] = {
            ...analysis.skillAnalysis[0].todoList,
          };
        }

        await todoList.save();
      }
    } catch (error) {
      console.error("Error in analysis parsing:", error);
    }

    res.status(200).json({
      success: true,
      result: { analysis },
    });
  } catch (error) {
    console.error("Error analyzing onboardingAnswers results:", error);
    res.status(500).json({
      success: false,
      error: "Failed to analyze onboardingAnswers",
      details: error.message,
    });
  }
};
