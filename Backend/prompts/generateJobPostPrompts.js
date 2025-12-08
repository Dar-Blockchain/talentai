const getQuickPrompt = (description, companyLocation) =>
  `
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
            "importance": "low/medium/high/critica",
            "category": "Frontend/Backend/Other",
            "percentage": 0
          },
          {
            "name": "Skill 2",
            "level": "1-5 (based on years of experience in the job post)",
            "importance": "low/medium/high/critica",
            "category": "Frontend/Backend/Other",
            "percentage": 0
          },
          {
            "name": "Skill 3",
            "level": "1-5 (based on years of experience in the job post)",
            "importance": "low/medium/high/critica",
            "category": "Frontend/Backend/Other",
            "percentage": 0
          }
        ],
        "softSkills": [
          {
            "name": "Soft Skill 1",
            "importance": "low/medium/high/critica",
            "percentage": 0
          },
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

    - CRITICAL: For "importance", ONLY use these EXACT lowercase values: "low", "medium", "high", "critical"

    - Set importance using these EXACT values:
      - "critical" → Must-have core requirement with years of experience required
      - "high" → Required for the job, explicitly mentioned as "Required"
      - "medium" → Preferred or nice to have, mentioned as "Preferred" or "Plus"
      - "low" → Bonus or additional skill, would be helpful

    - Only one soft skill must be generated.
    - The soft skill must always have percentage = 100.
    - The sum of all skill percentages must equal 100%.
    - LIA must determine the percentage distribution based on importance, frequency, and context in the job description.
    - If not specified, distribute evenly and logically.
    - Return only valid JSON. Avoid markdown or code blocks.

    STRICT SKILL RULES:
    - REQUIRED: Generate exactly 3 skills in "requiredSkills" — no more, no less.
    - NEVER generate general or non-technical skills such as “Web Development”, “Software Engineering”, “Programming”, or “Full Stack”.
    - Skills MUST ALWAYS be specific and technical (e.g., React.js, Next.js, Node.js, Express.js, NestJS, MongoDB, PostgreSQL, REST APIs, HTML/CSS, TypeScript, Docker, AWS, Redis, CI/CD, PHPUnit, Laravel, Symfony).
    - If the job description is vague, infer the most relevant precise technologies instead of using generic terms.
    - Categorize each skill only as: "Frontend", "Backend", "Fullstack", "DevOps", or "Other".
    - Never invent unrealistic skills; remain consistent with standard industry technical stacks.
    - The “name” field must always be a precise tool, language, framework, library, cloud service, or dev practice (NOT a job role).

    STRICT SOFT SKILL RULES:
    - Generate exactly 1 soft skill — no more, no less.
    - The soft skill must always have percentage = 100%.
    - Soft skills must be relevant to the job role (e.g., Problem solving, Communication, Teamwork, Adaptability, Time management, Leadership, Attention to detail).
    - Never use generic, vague, or irrelevant soft skills.
    - Importance values must follow: "low", "medium", "high", "critical".


    Job Description:
    ${description}
    Before generating the job details, include the following matching configuration exactly as structured:

    "matchingConfig": {
      "weights": {
        "hardSkill": "DYNAMIC based on job description, must be very close to 'experience' weight",
        "experience": "DYNAMIC based on job description, must be very close to 'hardSkill' weight",
        "SoftSkill": "DYNAMIC based on job description, smaller than 'hardSkill' and 'experience'",
        "salary": "DYNAMIC but very small weight",
        "workMode": "DYNAMIC but very small weight",
        "contract": "DYNAMIC but very small weight"
      },
      "importanceWeight": {
        "critical": 1.5,
        "high": 1.2,
        "medium": 1.0,
        "low": 0.8
      },
      "exchangeRates": {
        "USD": 1,
        "EUR": 1.1,
        "TND": 0.32
      }
    },

    - The "weights" for "hardSkill" and "experience" must be dynamically adjusted but **always very close in value**, as both are crucial for technical projects.  
    - "SoftSkill" weight should be dynamically adjusted but always smaller than "hardSkill" and "experience".  
    - "salary", "workMode", and "contract" must also be dynamically determined but **always very low compared to the others**.  
    - The total sum of all weights must always equal 100%.  
    - Return only the defined JSON fields; do NOT add any extra fields.

    The "exchangeRates" values must reflect today's real exchange rates.

`.trim();

const getDetailedPrompt = (description, companyLocation) =>
  `
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
    - CRITICAL: For "importance", ONLY use these EXACT lowercase values: "low", "medium", "high", "critical"

    - Set importance using these EXACT values:
      - "critical" → Must-have core requirement with years of experience required
      - "high" → Required for the job, explicitly mentioned as "Required"
      - "medium" → Preferred or nice to have, mentioned as "Preferred" or "Plus"
      - "low" → Bonus or additional skill, would be helpful

    - Each skill in "requiredSkills" must include a "percentage" field representing its importance weight in the job.
    - The total sum of all percentages must equal exactly 100%.
    - Only one soft skill must be generated.
    - Soft skill importance must follow: "low", "medium", "high", "critical".
    - The soft skill must always have percentage = 100 (since it is the only one).
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
            "importance": "low/medium/high/critica",
            "category": "Frontend/Backend/DevOps/etc.",
            "percentage": 0
          },
          {
            "name": "Skill 2",
            "level": "Required level (1-5) based on years of experience",
            "importance": "low/medium/high/critica",
            "category": "Frontend/Backend/DevOps/etc.",
            "percentage": 0
          },
          {
            "name": "Skill 3",
            "level": "Required level (1-5) based on years of experience",
            "importance": "low/medium/high/critica",
            "category": "Frontend/Backend/DevOps/etc.",
            "percentage": 0
          }
        ],
        "softSkills": [
          {
            "name": "Soft Skill 1",
            "importance": "low/medium/high/critica",
            "percentage": 100
          },        
        ],

        "suggestedSkills": {
          "technical": [
            {
              "name": "Skill name",
              "reason": "Why this skill is relevant",
              "category": "Frontend/Backend/DevOps/etc.",
              "priority": "Senior/Mid_Level/Junior"
            }
          ],
          "frameworks": [
            {
              "name": "Framework name",
              "relatedTo": "Related technology",
              "priority": "Senior/Mid_Level/Junior"
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

        STRICT SKILL RULES:
    - REQUIRED: Generate exactly 3 skills in "requiredSkills" — no more, no less.
    - NEVER generate general or non-technical skills such as “Web Development”, “Software Engineering”, “Programming”, or “Full Stack”.
    - Skills MUST ALWAYS be specific and technical (e.g., React.js, Next.js, Node.js, Express.js, NestJS, MongoDB, PostgreSQL, REST APIs, HTML/CSS, TypeScript, Docker, AWS, Redis, CI/CD, PHPUnit, Laravel, Symfony).
    - If the job description is vague, infer the most relevant precise technologies instead of using generic terms.
    - Categorize each skill only as: "Frontend", "Backend", "Fullstack", "DevOps", or "Other".
    - Never invent unrealistic skills; remain consistent with standard industry technical stacks.
    - The “name” field must always be a precise tool, language, framework, library, cloud service, or dev practice (NOT a job role).
    - Importance values must follow: "low", "medium", "high", "critical".

    STRICT SOFT SKILL RULES:
    - REQUIRED: Generate exactly 1 soft skill — no more, no less.
    - The soft skill must be relevant to the job role (e.g., Problem solving, Communication, Teamwork, Leadership, Adaptability, Time management).
    - The soft skill must include an "importance" field and a "percentage" field.
    - The percentage must always be 100.
    - Never use vague or irrelevant soft skills.
 
    Before generating the job details, include the following matching configuration exactly as structured:

    "matchingConfig": {
      "weights": {
        "hardSkill": "DYNAMIC based on job description, must be very close to 'experience' weight",
        "experience": "DYNAMIC based on job description, must be very close to 'hardSkill' weight",
        "SoftSkill": "DYNAMIC based on job description, smaller than 'hardSkill' and 'experience'",
        "salary": "DYNAMIC but very small weight",
        "workMode": "DYNAMIC but very small weight",
        "contract": "DYNAMIC but very small weight"
      },
      "importanceWeight": {
        "critical": 1.5,
        "high": 1.2,
        "medium": 1.0,
        "low": 0.8
      },
      "exchangeRates": {
        "USD": 1,
        "EUR": 1.1,
        "TND": 0.32
      }
    },

    - The "weights" for "hardSkill" and "experience" must be dynamically adjusted but **always very close in value**, as both are crucial for technical projects.  
    - "SoftSkill" weight should be dynamically adjusted but always smaller than "hardSkill" and "experience".  
    - "salary", "workMode", and "contract" must also be dynamically determined but **always very low compared to the others**.  
    - The total sum of all weights must always equal 100%.  
    - Return only the defined JSON fields; do NOT add any extra fields.

    The "exchangeRates" values must reflect today's real exchange rates.


`.trim();

module.exports = {
  getQuickPrompt,
  getDetailedPrompt,
};
