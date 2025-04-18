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
    // Récupérer tous les profils de candidats
    const candidates = await User.find({ role: 'Candidat' }).populate('profile');
    
    // Récupérer les compétences requises de l'entreprise
    const company = req.user;
    const requiredSkills = company.profile.requiredSkills;

    const matchedProfiles = [];

    for (const candidate of candidates) {
      const candidateSkills = candidate.profile.skills;
      
      // Préparer le prompt pour OpenAI
      const prompt = `
        Compare these candidate skills: ${candidateSkills.join(', ')} 
        with these required skills: ${requiredSkills.join(', ')}. 
        Return a JSON with a match percentage (between 70 and 100) and explanation.
        The match percentage should reflect how well the candidate's skills match the required skills.
      `;

      console.log(prompt);

      const response = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          { 
            role: "system", 
            content: "You are an expert at matching candidate skills with job requirements. Return only valid JSON without any markdown formatting or backticks. The match percentage must be between 70 and 100."
          },
          { role: "user", content: prompt }
        ],
        max_tokens: 150,
        temperature: 0.7
      });

      // Nettoyer la réponse avant de la parser
      let cleanResponse = response.choices[0].message.content
        .replace(/```json\n?/g, '')  // Enlever ```json
        .replace(/```\n?/g, '')      // Enlever les backticks restants
        .trim();                     // Enlever les espaces

      const matchResult = JSON.parse(cleanResponse);
      
      // Vérifier que le pourcentage est entre 70 et 100
      if (matchResult.matchPercentage >= 70 && matchResult.matchPercentage <= 100) {
        matchedProfiles.push({
          candidate: {
            id: candidate._id,
            name: candidate.name,
            email: candidate.email,
            skills: candidateSkills
          },
          matchPercentage: matchResult.matchPercentage,
          explanation: matchResult.explanation
        });
      }
    }

    // Trier les profils par pourcentage de correspondance
    matchedProfiles.sort((a, b) => b.matchPercentage - a.matchPercentage);

    res.status(200).json({
      success: true,
      data: matchedProfiles
    });

  } catch (error) {
    console.error('Error in matchProfilesWithCompany:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la correspondance des profils'
    });
  }
};
