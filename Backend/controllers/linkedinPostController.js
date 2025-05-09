const { OpenAI } = require("openai");
require("dotenv").config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

module.exports.generateJobPost = async (req, res) => {
  try {
    const { description, mode } = req.body;
    if (!description) {
      return res.status(400).json({
        error: "Missing job description",
        required: {
          description: "Detailed description of the job position"
        }
      });
    }
    if (mode === "fast") {
    // Define the JSON schema for Function Calling
    const functions = [
      {
        name: "generateJobPost",
        description: "Returns jobDetails, skillAnalysis and linkedinPost.finalPost in the exact structure required",
        parameters: {
          type: "object",
          properties: {
            jobDetails: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                requirements: {
                  type: "array",
                  items: { type: "string" }
                },
                responsibilities: {
                  type: "array",
                  items: { type: "string" }
                },
                location: { type: "string" },
                employmentType: { type: "string" },
                salary: {
                  type: "object",
                  properties: {
                    min: { type: "number" },
                    max: { type: "number" },
                    currency: { type: "string" }
                  },
                  required: ["min", "max", "currency"]
                }
              },
              required: [
                "title",
                "description",
                "requirements",
                "responsibilities",
                "location",
                "employmentType",
                "salary"
              ]
            },
            skillAnalysis: {
              type: "object",
              properties: {
                requiredSkills: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      level: { type: "string" },
                      importance: { type: "string" },
                      category: { type: "string" }
                    },
                    required: ["name", "level", "importance", "category"]
                  }
                },
                suggestedSkills: {
                  type: "object",
                  properties: {
                    technical: {
                      type: "array",
                      items: { type: "object", additionalProperties: true }
                    },
                    frameworks: {
                      type: "array",
                      items: { type: "object", additionalProperties: true }
                    },
                    tools: {
                      type: "array",
                      items: { type: "object", additionalProperties: true }
                    }
                  },
                  required: ["technical", "frameworks", "tools"]
                },
                skillSummary: {
                  type: "object",
                  properties: {
                    mainTechnologies: {
                      type: "array",
                      items: { type: "string" }
                    },
                    complementarySkills: {
                      type: "array",
                      items: { type: "string" }
                    },
                    learningPath: {
                      type: "array",
                      items: { type: "string" }
                    },
                    stackComplexity: { type: "string" }
                  },
                  required: [
                    "mainTechnologies",
                    "complementarySkills",
                    "learningPath",
                    "stackComplexity"
                  ]
                }
              },
              required: ["requiredSkills", "suggestedSkills", "skillSummary"]
            },
            linkedinPost: {
              type: "object",
              properties: {
                finalPost: { type: "string" }
              },
              required: ["finalPost"]
            }
          },
          required: ["jobDetails", "skillAnalysis", "linkedinPost"]
        }
      }
    ];

    // Minimal system + user messages
    const messages = [
      {
        role: "system",
        content:
          "You are an expert technical recruiter and AI assistant. " +
          "Based on the user's job description, call the function 'generateJobPost' " +
          "to return the exact JSON schema with jobDetails, skillAnalysis, and linkedinPost.finalPost."
      },
      { role: "user", content: description }
    ];

    // Call the faster model with function-calling
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
      functions,
      function_call: { name: "generateJobPost" },
      max_tokens: 1000,
      temperature: 0.4,
      top_p: 0.9
    });

    // Parse the function arguments as our result
    const rawArgs = response.choices[0].message.function_call.arguments;
    const result = JSON.parse(rawArgs);

    // Return the same JSON structure as before
    return res.json(result);
  }
  else if (mode === "deep") {
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
  }
  } catch (error) {
    console.error("Error in generateJobPost:", error);
    return res.status(500).json({ error: "Failed to generate job post" });
  }
};
