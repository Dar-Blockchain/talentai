const { Together } = require("together-ai");
require("dotenv").config();

const {
  generateOnboardingQuestionsPrompts,
  analyzeOnbordingQuestionsPrompts,
} = require("../../../prompts/evaluationPrompts");

const Profile = require("../../../models/ProfileModel");
const TodoList = require("../../../models/todoListModel");

const {
  saveInterviewDetailsForOnboarding,
} = require("../../../utils/evaluationUtils");

// Configure the Together AI client
const together = new Together({ apiKey: process.env.TOGETHER_API_KEY });


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

// Code testé: Cette fonction a été validée manuellement et fonctionne très bien. (20/08/2025)
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
      max_tokens: 2500,
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

      console.log("analysis.skillAnalysis", );
      // save interview details and update profile with interview ID
      const interviewId = await saveInterviewDetailsForOnboarding(
        profile,
        overallScore,
        analysis.skillAnalysis,
        analysis.recommendations
      );

      profile.interviewDetails.push(interviewId);
      await profile.save();

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
              demonstratedExperienceLevel === 1
                ? 1
                : demonstratedExperienceLevel === 5
                ? 5
                : demonstratedExperienceLevel - 1,
          },
        ];
        profile.overallScore = overallScore;
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