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

exports.generateTechniqueQuestions = async (req, res) => {
  try {
    // 1. Validate request body
    const { skill, experienceLevel, proficiencyLevel } = req.body;

    if (!skill || !experienceLevel || !proficiencyLevel) {
      return res.status(400).json({ 
        error: "Missing required fields", 
        required: {
          skill: "Name of the skill",
          experienceLevel: "Years of experience",
          proficiencyLevel: "Level from 1-5"
        }
      });
    }

    // Validate proficiency level
    if (proficiencyLevel < 1 || proficiencyLevel > 5) {
      return res.status(400).json({ 
        error: "Proficiency level must be between 1 and 5" 
      });
    }

    // 2. Build the skill description
    const skillDescription = `${skill} (Experience: ${experienceLevel} years, Proficiency: ${proficiencyLevel}/5)`;

    // 3. Prompt: ask for exactly 10 technical questions as a JSON array
    const prompt = `
You are an experienced technical interviewer specializing in ${skill}.
Based on the candidate's profile (${skillDescription}), generate **exactly 10** technical interview questions.
The questions should be appropriate for someone with ${experienceLevel} years of experience and a proficiency level of ${proficiencyLevel}/5.
Mix of theoretical and practical questions, including problem-solving scenarios.

**Return ONLY** a JSON array of strings—no commentary, no numbering, no markdown—like this:

\`\`\`json
[
  "Technical question 1?",
  "Technical question 2?",
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
          content: `You are an experienced technical interviewer specializing in ${skill} assessments. 
                   Focus on generating precise, technical questions that test both theoretical knowledge and practical experience.`
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
        .split(/\n(?=\d+\.\s)/)              // split at newline before "1. ", "2. ", etc.
        .map((q) => q.replace(/^\d+\.\s*/, "")) // strip leading "1. " etc.
        .map((q) => q.trim())
        .filter(Boolean);
    }

    // 7. Return the array with metadata
    res.json({ 
      skill,
      experienceLevel,
      proficiencyLevel,
      questions,
      totalQuestions: questions.length
    });

  } catch (error) {
    console.error("Error generating technical questions:", error);
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
          subSkills: "Sub-skill description (optional)"
        }
      });
    }

    // 2. Build the skill description with sub-skill if provided
    let skillDescription = skill;
    if (subSkills && typeof subSkills === 'string' && subSkills.trim() !== '') {
      skillDescription += ` with focus on: ${subSkills}`;
    }

    // 3. Prompt: ask for exactly 10 behavioral questions as a JSON array
    const prompt = `
You are an experienced HR interviewer specializing in assessing soft skills.
Generate **exactly 10** behavioral interview questions to evaluate "${skillDescription}".
The questions should:
- Follow the STAR (Situation, Task, Action, Result) format
- Focus on real-life scenarios
- Help assess the candidate's ${skill} abilities${subSkills ? ' particularly in ' + subSkills : ''}
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
                   Questions should follow the STAR format and encourage detailed responses.`
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
      subSkills: subSkills || '',
      questions,
      totalQuestions: questions.length,
      format: "STAR (Situation, Task, Action, Result)",
      type: "behavioral"
    });

  } catch (error) {
    console.error("Error generating soft skill questions:", error);
    res.status(500).json({ error: "Failed to generate soft skill questions" });
  }
};

const User = require('../models/UserModel');

exports.matchProfilesWithCompany = async (req, res) => {
  try {
    // Get all candidate profiles
    const candidates = await User.find({ role: 'Candidat' }).populate('profile');
    
    // Get company's required skills
    const company = req.user;
    const requiredSkills = company.profile.requiredSkills;

    const matchedProfiles = [];

    for (const candidate of candidates) {
      try {
        const candidateSkills = candidate.profile.skills;
        
        // Prepare the prompt for OpenAI with explicit JSON format
        const prompt = `Given these skills:

Required company skills: ${JSON.stringify(requiredSkills)}
Candidate skills: ${JSON.stringify(candidateSkills)}

Generate a match analysis in the following JSON format ONLY (no additional text):
{
  "matchPercentage": 85,
  "skillMatches": [
    {
      "skill": "JavaScript",
      "proficiency": 4,
      "importance": "high",
      "match": "full",
      "score": 90
    }
  ],
  "overallAssessment": "Strong match with core skills",
  "recommendations": [
    "Consider focusing on advanced JavaScript concepts"
  ]
}

Rules:
- matchPercentage should be 0-100 based on skill overlap
- Each skill should have a score 0-100
- Use "high/medium/low" for importance
- Use "full/partial/none" for match
- Keep assessment and recommendations concise`;

        const response = await openai.chat.completions.create({
          model: "gpt-4-turbo-preview",
          messages: [
            { 
              role: "system", 
              content: "You are a JSON-only response generator. Output valid JSON matching the exact format requested, with no additional text or explanation."
            },
            { role: "user", content: prompt }
          ],
          max_tokens: 500,
          temperature: 0.7
        });

        let matchResult;
        try {
          // Direct parse attempt first
          matchResult = JSON.parse(response.choices[0].message.content.trim());
        } catch (parseError) {
          console.error('Initial JSON parse failed, attempting cleanup:', parseError);
          
          // Cleanup attempt
          const cleanResponse = response.choices[0].message.content
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .trim();
          
          try {
            matchResult = JSON.parse(cleanResponse);
          } catch (secondParseError) {
            console.error('JSON parse failed after cleanup:', secondParseError);
            // Skip this candidate if we can't parse the response
            continue;
          }
        }

        // Validate the required fields
        if (!matchResult || typeof matchResult.matchPercentage !== 'number' || !Array.isArray(matchResult.skillMatches)) {
          console.error('Invalid match result structure:', matchResult);
          continue;
        }

        // Include all candidates regardless of score
        matchedProfiles.push({
          candidateInfo: {
            id: candidate._id,
            name: candidate.username,
            email: candidate.email,
            skills: candidateSkills.map(skill => ({
              name: skill.name,
              proficiencyLevel: skill.proficiencyLevel,
              experienceLevel: skill.experienceLevel
            }))
          },
          matchAnalysis: {
            percentage: matchResult.matchPercentage,
            skillMatches: matchResult.skillMatches.map(skill => ({
              ...skill,
              score: skill.score || 0
            })),
            assessment: matchResult.overallAssessment,
            recommendations: matchResult.recommendations
          }
        });
      } catch (candidateError) {
        console.error(`Error processing candidate ${candidate._id}:`, candidateError);
        // Continue with next candidate if one fails
        continue;
      }
    }

    // Sort profiles by match percentage (highest to lowest)
    matchedProfiles.sort((a, b) => b.matchAnalysis.percentage - a.matchAnalysis.percentage);

    // Filter profiles with match percentage >= 50%
    const filteredProfiles = matchedProfiles.filter(profile => profile.matchAnalysis.percentage >= 50);

    res.status(200).json({
      success: true,
      totalCandidates: filteredProfiles.length,
      matches: filteredProfiles.map(profile => ({
        ...profile,
        matchAnalysis: {
          ...profile.matchAnalysis,
          scoreCategory: getScoreCategory(profile.matchAnalysis.percentage)
        }
      }))
    });

  } catch (error) {
    console.error('Error in matchProfilesWithCompany:', error);
    res.status(500).json({
      success: false,
      error: 'Error matching profiles',
      details: error.message
    });
  }
};

// Helper function to categorize scores
function getScoreCategory(score) {
  if (score >= 90) return 'Excellent Match';
  if (score >= 70) return 'Good Match';
  if (score >= 40) return 'Partial Match';
  return 'Low Match';
}

// Helper function to get experience level from proficiency level
function getExperienceLevel(proficiencyLevel) {
  const levels = ['Entry Level', 'Junior', 'Mid Level', 'Senior', 'Expert'];
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

const profileService = require('../services/profileService');

exports.analyzeProfileAnswers = async (req, res) => {
  try {
    const { type, skill, questions } = req.body;
    const user = req.user;

    // 1. Validate input
    if (!type || !Array.isArray(skill) || !Array.isArray(questions)) {
      return res.status(400).json({
        error: "Invalid request format",
        required: {
          type: "Type of assessment (e.g., 'technical')",
          skill: "Array of skill objects with name and proficiencyLevel",
          questions: "Array of question-answer pairs"
        }
      });
    }

    const isValidSkill = skill.every(s =>
      s.name &&
      typeof s.name === 'string' &&
      typeof s.proficiencyLevel === 'number' &&
      s.proficiencyLevel >= 1 &&
      s.proficiencyLevel <= 5
    );

    if (!isValidSkill) {
      return res.status(400).json({
        error: "Invalid skill format",
        message: "Each skill must have a name (string) and proficiencyLevel (1-5)"
      });
    }

    // 2. Build prompt
    const prompt = `
You are a kind and insightful ${type} interviewer. Your goal is to evaluate a candidate's understanding and thinking based on the meaning of their spoken answers (transcribed below), without focusing on grammar, fluency, or pronunciation.

The goal is not to be strict, but to give a fair and helpful evaluation, highlighting strengths and areas to improve in a constructive tone.

Assessment Type: ${type}
Skills being assessed:
${skill.map(s => `  • ${s.name} (Self-rated level: ${s.proficiencyLevel}/5)`).join('\n')}

Candidate's transcribed answers:
${questions.map(qa => `Q: ${qa.question}\nA: ${qa.answer}`).join('\n\n')}

Please return your evaluation **only** in this exact JSON format:
{
  "overallScore": 0, // Between 0 and 100. Most good answers should be in the 60-85 range.
  "skillAnalysis": [
    {
      "skillName": "React",
      "currentProficiency": 3,
      "demonstratedProficiency": 3,
      "strengths": ["Clear understanding of component logic"],
      "weaknesses": ["Could improve explanation of state management"],
      "confidenceScore": 75,
      "improvement": "unchanged"
    }
  ],
  "generalAssessment": "Summarize the candidate’s performance in a kind and constructive tone",
  "recommendations": [
    "Give 1–3 friendly suggestions to improve understanding or confidence"
  ],
  "technicalLevel": "beginner" | "intermediate" | "advanced",
  "nextSteps": [
    "Recommend exercises, study materials, or small projects"
  ],
  "assessmentType": "${type}",
  "evaluationContext": "Based on general ${type} interview expectations with a focus on understanding and growth potential"
}`;

    // 3. Call OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `You are a gentle but insightful evaluator. Focus on understanding and logical reasoning.`
        },
        { role: "user", content: prompt }
      ],
      max_tokens: 1000,
      temperature: 0.7
    });

    // 4. Parse JSON from OpenAI response
    let analysis;
    try {
      let jsonStr = response.choices[0].message.content.trim();
      const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) jsonStr = jsonMatch[1];

      jsonStr = jsonStr.trim()
        .replace(/[\u200B-\u200D\uFEFF]/g, '')
        .replace(/^[^{]*/, '')
        .replace(/[^}]*$/, '');

      try {
        analysis = JSON.parse(jsonStr);
      } catch (firstError) {
        jsonStr = jsonStr
          .replace(/,(\s*[}\]])/g, '$1')
          .replace(/'/g, '"')
          .replace(/\n/g, ' ')
          .replace(/\s+/g, ' ');
        analysis = JSON.parse(jsonStr);
      }

      if (!analysis || typeof analysis !== 'object' || !Array.isArray(analysis.skillAnalysis)) {
        throw new Error('Invalid GPT response structure');
      }

      const requiredFields = ['overallScore', 'skillAnalysis', 'generalAssessment', 'recommendations'];
      const missingFields = requiredFields.filter(f => !(f in analysis));
      if (missingFields.length > 0) throw new Error(`Missing fields: ${missingFields.join(', ')}`);

      // Normalize and score safely
      analysis = {
        overallScore: Math.max(Number(analysis.overallScore), 60), // Force minimum of 60 if below
        skillAnalysis: analysis.skillAnalysis.map(skill => {
          const current = Number(skill.currentProficiency) || 1;
          const score = Number(skill.confidenceScore) || 60;
          let demo = current;
          if (score > 80) demo++;
          else if (score < 50) demo--;

          demo = Math.min(Math.max(demo, 1), 5);
          return {
            skillName: skill.skillName || '',
            currentProficiency: current,
            demonstratedProficiency: demo,
            currentExperienceLevel: getExperienceLevel(current),
            demonstratedExperienceLevel: getExperienceLevel(demo),
            strengths: Array.isArray(skill.strengths) ? skill.strengths : [],
            weaknesses: Array.isArray(skill.weaknesses) ? skill.weaknesses : [],
            confidenceScore: score,
            improvement:
              demo > current ? 'increased' :
              demo < current ? 'decreased' :
              'unchanged'
          };
        }),
        generalAssessment: analysis.generalAssessment || '',
        recommendations: Array.isArray(analysis.recommendations) ? analysis.recommendations : [],
        technicalLevel: analysis.technicalLevel || 'intermediate',
        nextSteps: Array.isArray(analysis.nextSteps) ? analysis.nextSteps : [],
        experienceLevels: ['Entry Level', 'Junior', 'Mid Level', 'Senior', 'Expert']
      };

    } catch (error) {
      console.error("Failed to parse GPT analysis:", error);
      return res.status(200).json({
        success: true,
        result: {
          timestamp: new Date(),
          assessmentType: type,
          skillsAssessed: skill.map(s => ({
            ...s,
            experienceLevel: getExperienceLevel(s.proficiencyLevel)
          })),
          numberOfQuestions: questions.length,
          analysis: {
            overallScore: 70,
            experienceLevels: ['Entry Level', 'Junior', 'Mid Level', 'Senior', 'Expert'],
            skillAnalysis: skill.map(s => ({
              skillName: s.name,
              currentProficiency: s.proficiencyLevel,
              demonstratedProficiency: s.proficiencyLevel,
              currentExperienceLevel: getExperienceLevel(s.proficiencyLevel),
              demonstratedExperienceLevel: getExperienceLevel(s.proficiencyLevel),
              strengths: ["Answer not fully analyzed"],
              weaknesses: ["Retry recommended"],
              confidenceScore: 60,
              improvement: "unchanged"
            })),
            generalAssessment: "Evaluation incomplete",
            recommendations: ["Please retry the assessment"],
            technicalLevel: "intermediate",
            nextSteps: ["Repeat the test"]
          }
        }
      });
    }

    // 5. Update profile
    const result = {
      timestamp: new Date(),
      assessmentType: type,
      skillsAssessed: skill.map(s => ({
        ...s,
        experienceLevel: getExperienceLevel(s.proficiencyLevel)
      })),
      numberOfQuestions: questions.length,
      analysis: {
        ...analysis,
        skillProgression: analysis.skillAnalysis.map(skillAnalysis => {
          const originalSkill = skill.find(s => s.name === skillAnalysis.skillName);
          const currentLevel = originalSkill ? originalSkill.proficiencyLevel : 1;
          return {
            ...skillAnalysis,
            proficiencyChange: skillAnalysis.demonstratedProficiency - currentLevel,
            masteryCategory: getMasteryCategory(skillAnalysis.confidenceScore),
            levelProgression: {
              from: getExperienceLevel(currentLevel),
              to: getExperienceLevel(skillAnalysis.demonstratedProficiency),
              changed: currentLevel !== skillAnalysis.demonstratedProficiency
            }
          };
        })
      }
    };

    if (user.profile.overallScore === 0 && type === "technical") {
      await profileService.createOrUpdateProfile(user._id, {
        overallScore: analysis.overallScore,
        skills: analysis.skillAnalysis.map(skill => ({
          name: skill.skillName,
          proficiencyLevel: skill.demonstratedProficiency,
          experienceLevel: getExperienceLevel(skill.demonstratedProficiency)
        }))
      });
    } else if (type === "technical") {
      const oldProfile = await profileService.getProfileByUserId(user._id);
      await profileService.createOrUpdateProfile(user._id, {
        overallScore: (oldProfile.overallScore + analysis.overallScore) / 2,
        skills: analysis.skillAnalysis.map(skill => ({
          name: skill.skillName,
          proficiencyLevel: skill.demonstratedProficiency,
          experienceLevel: getExperienceLevel(skill.demonstratedProficiency),
          ScoreTest: skill.confidenceScore
        }))
      });
    }

    if (type === "soft") {
      await profileService.createOrUpdateProfile(user._id, {
        softSkills: analysis.skillAnalysis.map(s => ({
          name: s.skillName,
          category: s.category || '',
          experienceLevel: getExperienceLevel(s.demonstratedProficiency),
          ScoreTest: s.confidenceScore
        }))
      });
    }

    return res.status(200).json({
      success: true,
      result
    });

  } catch (error) {
    console.error("Fatal error in profile analysis:", error);
    return res.status(500).json({
      success: false,
      error: "Profile evaluation failed",
      details: error.message
    });
  }
};