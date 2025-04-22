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
    // 1. Validate request body
    const { type, skill, questions } = req.body;
    const user = req.user;

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

    // Validate skill objects
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
        message: "Each skill must have a name (string) and proficiencyLevel (number 1-5)"
      });
    }

    // 2. Prepare the data for GPT analysis
    const prompt = `
As an expert ${type} interviewer, analyze the following assessment:

Assessment Type: ${type}
Skills being assessed: 
${skill.map(s => `- ${s.name} (Current Proficiency Level: ${s.proficiencyLevel}/5)`).join('\n')}

Questions and Answers:
${questions.map(qa => `Q: ${qa.question}\nA: ${qa.answer}`).join('\n\n')}

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
                   Provide detailed, actionable feedback in JSON format only.`
        },
        { role: "user", content: prompt }
      ],
      max_tokens: 1000,
      temperature: 0.7
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
      jsonStr = jsonStr.trim()
        .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove zero-width spaces
        .replace(/^[^{]*/, '') // Remove any text before the first {
        .replace(/[^}]*$/, ''); // Remove any text after the last }


      try {
        analysis = JSON.parse(jsonStr);
      } catch (firstError) {
        console.error('First parse attempt failed:', firstError);
        
        // Second attempt: Try to fix common JSON issues
        jsonStr = jsonStr
          .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
          .replace(/'/g, '"') // Replace single quotes with double quotes
          .replace(/\n/g, ' ') // Remove newlines
          .replace(/\s+/g, ' '); // Normalize whitespace
        
        analysis = JSON.parse(jsonStr);
      }

      // Validate required fields
      if (!analysis || typeof analysis !== 'object') {
        throw new Error('Analysis is not an object');
      }

      if (!analysis.skillAnalysis || !Array.isArray(analysis.skillAnalysis)) {
        throw new Error('Missing or invalid skillAnalysis array');
      }

      // Ensure all required fields are present
      const requiredFields = ['overallScore', 'skillAnalysis', 'generalAssessment', 'recommendations'];
      const missingFields = requiredFields.filter(field => !(field in analysis));
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Normalize the response structure if needed
      analysis = {
        overallScore: Number(analysis.overallScore) || 0,
        skillAnalysis: analysis.skillAnalysis.map(skill => ({
          skillName: skill.skillName || skill.skill || '',
          currentProficiency: Number(skill.currentProficiency) || 0,
          demonstratedProficiency: Number(skill.demonstratedProficiency) || 0,
          currentExperienceLevel: getExperienceLevel(Number(skill.currentProficiency) || 0),
          demonstratedExperienceLevel: getExperienceLevel(Number(skill.demonstratedProficiency) || 0),
          strengths: Array.isArray(skill.strengths) ? skill.strengths : [],
          weaknesses: Array.isArray(skill.weaknesses) ? skill.weaknesses : [],
          confidenceScore: Number(skill.confidenceScore) || 0,
          improvement: skill.improvement || 'unchanged'
        })),
        generalAssessment: analysis.generalAssessment || '',
        recommendations: Array.isArray(analysis.recommendations) ? analysis.recommendations : [],
        technicalLevel: analysis.technicalLevel || 'intermediate',
        nextSteps: Array.isArray(analysis.nextSteps) ? analysis.nextSteps : [],
        experienceLevels: ['Entry Level', 'Junior', 'Mid Level', 'Senior', 'Expert']
      };

    } catch (error) {
      console.error("Detailed error in analysis parsing:", error);
      console.error("Original response:", response.choices[0].message.content);
      
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
              strengths: ["Assessment incomplete"],
              weaknesses: ["Could not analyze in detail"],
              confidenceScore: 60,
              improvement: "unchanged"
            })),
            generalAssessment: "Analysis could not be completed fully",
            recommendations: ["Please try the assessment again"],
            technicalLevel: "intermediate",
            nextSteps: ["Retry the assessment"]
          }
        }
      });
    }

    // 5. Add metadata to the response
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
    console.log(user);
    if(user.profile.overallScore === 0){
      console.log("test");
      const profile = await profileService.createOrUpdateProfile(user._id, {
        overallScore: analysis.overallScore,
        skills: analysis.skillAnalysis.map(skill => ({
          name: skill.skillName,
          proficiencyLevel: skill.demonstratedProficiency,
          experienceLevel: getExperienceLevel(skill.demonstratedProficiency),
        }))
      });
      console.log(profile);
    }else{
      console.log("test2");
      const profileOverallScore = await profileService.getProfileByUserId(user._id);
      const profile = await profileService.createOrUpdateProfile(user._id, {
        overallScore: (profileOverallScore.overallScore + analysis.overallScore)/2,
        skills: analysis.skillAnalysis.map(skill => ({
          name: skill.skillName,
          proficiencyLevel: skill.demonstratedProficiency,
          experienceLevel: getExperienceLevel(skill.demonstratedProficiency),
          ScoreTest:skill.confidenceScore
        }))
      });
      console.log(profile);
    }

    


    res.status(200).json({
      success: true,
      result
    });

  } catch (error) {
    console.error("Error analyzing profile answers:", error);
    res.status(500).json({
      success: false,
      error: "Failed to analyze profile",
      details: error.message
    });
  }
};

exports.generateJobPost = async (req, res) => {
  try {
    const { description } = req.body;

    if (!description) {
      return res.status(400).json({ 
        error: "Missing job description",
        required: {
          description: "Detailed description of the job position"
        }
      });
    }

    const prompt = `
As an expert technical recruiter and AI assistant, analyze this job description to:
1. Create a professional job post
2. Extract and suggest relevant skills
3. Format it for LinkedIn
4. Provide comprehensive skill analysis

Job Description:
${description}

Return the response in the following JSON format:

{
  "jobDetails": {
    "title": "Job title",
    "description": "Engaging job description with clear sections",
    "requirements": ["List of specific requirements"],
    "responsibilities": ["List of key responsibilities"],
    "location": "Job location",
    "employmentType": "Full-time/Part-time/Contract",
    "experienceLevel": "Required experience level",
    "salary": {
      "min": minimum salary,
      "max": maximum salary,
      "currency": "Currency code"
    }
  },
  "skillAnalysis": {
    "requiredSkills": [
      {
        "name": "Skill name",
        "level": "Required level (1-5)",
        "importance": "Required/Preferred",
        "category": "Frontend/Backend/DevOps/etc."
      }
    ],
    "suggestedSkills": {
      "technical": [
        {
          "name": "Skill name",
          "reason": "Why this skill is relevant",
          "category": "Frontend/Backend/DevOps/etc.",
          "priority": "High/Medium/Low"
        }
      ],
      "frameworks": [
        {
          "name": "Framework name",
          "relatedTo": "Related technology",
          "priority": "High/Medium/Low"
        }
      ],
      "tools": [
        {
          "name": "Tool name",
          "purpose": "What it's used for",
          "category": "Version Control/CI-CD/Testing/etc."
        }
      ]
    },
    "skillSummary": {
      "mainTechnologies": ["Core technologies required"],
      "complementarySkills": ["Skills that would add value"],
      "learningPath": ["Suggested skills to learn"],
      "stackComplexity": "Simple/Moderate/Complex"
    }
  },
  "linkedinPost": {
    "formattedContent": {
      "headline": "Attention-grabbing headline",
      "introduction": "Engaging opening paragraph",
      "companyPitch": "Brief compelling pitch",
      "roleOverview": "Clear role description",
      "keyPoints": ["Bullet points of key aspects"],
      "skillsRequired": "Formatted skills section",
      "benefitsSection": "What we offer",
      "callToAction": "Engaging call to action"
    },
    "hashtags": ["Relevant", "Hashtags"],
    "formatting": {
      "emojis": {
        "company": "🏢",
        "location": "📍",
        "salary": "💰",
        "requirements": "📋",
        "skills": "💻",
        "benefits": "🎯",
        "apply": "✨"
      }
    },
    "finalPost": "The complete formatted post ready for LinkedIn"
  }
}

Ensure:
1. All sections are professional and engaging
2. Skills analysis is thorough and relevant
3. LinkedIn post is properly formatted with emojis and sections
4. Suggested skills are modern and appropriate for the role
`.trim();

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { 
          role: "system", 
          content: "You are an expert technical recruiter and AI assistant specializing in job analysis, skill assessment, and creating engaging job posts. Provide comprehensive analysis while maintaining professional formatting."
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 2500,
      temperature: 0.7,
    });

    // Parse the response
    const raw = response.choices[0].message.content;
    let result;
    try {
      // Try to extract JSON if it's wrapped in markdown code blocks
      const jsonMatch = raw.match(/```json\n?([\s\S]*?)\n?```/) || raw.match(/```\n?([\s\S]*?)\n?```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : raw;
      
      result = JSON.parse(jsonStr);

      // Generate the final LinkedIn post if not already included
      if (!result.linkedinPost.finalPost) {
        const format = result.linkedinPost.formatting.emojis;
        result.linkedinPost.finalPost = `${result.linkedinPost.formattedContent.headline}

${format.company} ${result.linkedinPost.formattedContent.introduction}

${result.linkedinPost.formattedContent.companyPitch}

${format.requirements} Role Overview:
${result.linkedinPost.formattedContent.roleOverview}

${format.requirements} Key Points:
${result.linkedinPost.formattedContent.keyPoints.map(point => `• ${point}`).join('\n')}

${format.skills} Required Skills:
${result.linkedinPost.formattedContent.skillsRequired}

${format.benefits} What We Offer:
${result.linkedinPost.formattedContent.benefitsSection}

${format.location} Location: ${result.jobDetails.location}
${format.salary} Salary: ${result.jobDetails.salary.currency}${result.jobDetails.salary.min}-${result.jobDetails.salary.max}

${format.apply} ${result.linkedinPost.formattedContent.callToAction}

${result.linkedinPost.hashtags.map(tag => '#' + tag).join(' ')}`;
      }

    } catch (e) {
      console.error("Failed to parse response:", e);
      return res.status(500).json({ error: "Failed to generate job post and analysis" });
    }

    res.json(result);
  } catch (error) {
    console.error("Error in job post generation:", error);
    res.status(500).json({ error: "Failed to process job post request" });
  }
};


