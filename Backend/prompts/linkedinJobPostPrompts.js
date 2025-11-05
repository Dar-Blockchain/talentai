const getQuickPrompt = (description, companyLocation) => `
    As an expert technical recruiter and AI assistant, analyze this job description and generate a JSON object with only the following structure:
    
    {
      "jobDetails": {
        "title": "Job title",
        "description": "Professional summary",
        "requirements": ["Requirement 1", "Requirement 2"],
        "responsibilities": ["Responsibility 1", "Responsibility 2"],
        "location": "Location",
        "employmentType": "Full-time/Part-time/Contract",
        "salary": {
          "min": 0,
          "max": 0,
          "currency": "USD"
        }
      },
      "skillAnalysis": {
        "requiredSkills": [
          {
            "name": "Skill 1",
            "level": "1-5 (based on years of experience in the job post)",
            "importance": "Required/Preferred",
            "category": "Frontend/Backend/Other",
            "percentage": 0
          },
          {
            "name": "Skill 2",
            "level": "1-5 (based on years of experience in the job post)",
            "importance": "Required/Preferred",
            "category": "Frontend/Backend/Other",
            "percentage": 0
          },
          {
            "name": "Skill 3",
            "level": "1-5 (based on years of experience in the job post)",
            "importance": "Required/Preferred",
            "category": "Frontend/Backend/Other",
            "percentage": 0
          }
        ],
        "suggestedSkills": {
          "technical": [],
          "frameworks": [],
          "tools": []
        },
        "skillSummary": {
          "mainTechnologies": [],
          "complementarySkills": [],
          "learningPath": [],
          "stackComplexity": "Simple/Moderate/Complex"
        }
      },
      "linkedinPost": {
        "finalPost": "Formatted LinkedIn job post with emojis and hashtags"
      }
    }
    
    IMPORTANT:
    - Always include "responsibilities", "location", and "employmentType".
    - For the "location" field, extract the location from the job description if specified.
    - If no location is specified in the job description, use the company location: "${companyLocation}".
    - Set skill level based on years of experience mentioned in the post:
      - 1 year = level 1
      - 2 years = level 2
      - 5 years = level 3
      - 10 years = level 4
      - 15+ years = level 5
    - Return only valid JSON. Avoid markdown or code blocks.
    - The sum of all skill percentages must equal 100%.  
    - LIA must determine the percentage distribution based on importance, frequency, and context in the job description.  
    - If not specified, distribute evenly and logically.  
    - Return only valid JSON. Avoid markdown or code blocks.

    Job Description:
    ${description}
`.trim();

const getDetailedPrompt = (description, companyLocation) => `
    As an expert technical recruiter and AI assistant, analyze this job description and generate a JSON object with only the following structure:
    1. Create a professional job post
    2. Extract and suggest relevant skills
    3. Format it for LinkedIn
    4. Provide comprehensive skill analysis
    
    IMPORTANT:
    - Extract the exact salary range (min, max, currency) as specified in the job description. Do not estimate or change these values.
    - For the "location" field, extract the location from the job description if specified.
    - If no location is specified in the job description, use the company location: "${companyLocation}".
    - Always include "location" in the output.
    - Set skill level based on years of experience mentioned in the job post:
      - 1 year = level 1
      - 2 years = level 2
      - 5 years = level 3
      - 10 years = level 4
      - 15+ years = level 5
      - Each skill in "requiredSkills" must include a "percentage" field representing its importance weight in the job.
      - The total sum of all percentages must equal exactly 100%.
      - LIA must infer the percentage distribution based on the importance, frequency, and emphasis of each skill mentioned in the job description.
      - If no clear priorities are specified, distribute the percentages evenly and logically among all required skills.
      - Core and frequently mentioned skills should receive higher percentages.
    
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
          "min": 0,
          "max": 0,
          "currency": "USD"
        }
      },
      "skillAnalysis": {
        "requiredSkills": [
          {
            "name": "Skill 1",
            "level": "Required level (1-5) based on years of experience",
            "importance": "Required/Preferred",
            "category": "Frontend/Backend/DevOps/etc.",
            "percentage": 0
          },
          {
            "name": "Skill 2",
            "level": "Required level (1-5) based on years of experience",
            "importance": "Required/Preferred",
            "category": "Frontend/Backend/DevOps/etc.",
            "percentage": 0
          },
          {
            "name": "Skill 3",
            "level": "Required level (1-5) based on years of experience",
            "importance": "Required/Preferred",
            "category": "Frontend/Backend/DevOps/etc.",
            "percentage": 0
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
`.trim();

module.exports = {
    getQuickPrompt,
    getDetailedPrompt
};