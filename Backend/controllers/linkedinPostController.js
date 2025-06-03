const { Together } = require("together-ai");
require("dotenv").config();
const Company = require("../models/ProfileModel");

const together = new Together({ apiKey: process.env.TOGETHER_API_KEY });

module.exports.generateJobPost = async (req, res) => {
  try {
    const { description, type = "detailed" } = req.body;
    const user = req.user;

    const company = await Company.findById(user.profile);
    const companyLocation = company.location;

    if (!description) {
      return res.status(400).json({
        error: "Missing job description",
        required: {
          description: "Detailed description of the job position",
        },
      });
    }

    // Quick generation prompt - simpler and faster
    const quickPrompt = `
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
        "name": "Skill",
        "level": "1-5",
        "importance": "Required/Preferred",
        "category": "Frontend/Backend/Other"
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
- Return only valid JSON. Avoid markdown or code blocks.

Return only valid JSON. Avoid markdown or code blocks.
Job Description:
${description}
    `.trim();

    // Detailed generation prompt - more comprehensive
    const detailedPrompt = `
As an expert technical recruiter and AI assistant, analyze this job description and generate a JSON object with only the following structure:
1. Create a professional job post
2. Extract and suggest relevant skills
3. Format it for LinkedIn
4. Provide comprehensive skill analysis

IMPORTANT:
- Extract the exact salary range (min, max, currency) as specified in the job description. Do not estimate or change these values.


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

    // Choose prompt and configuration based on type
    const prompt = type === "quick" ? quickPrompt : detailedPrompt;
    const config =
      type === "quick"
        ? {
            max_tokens: 1000,
            temperature: 0.4,
            top_p: 0.9,
          }
        : {
            max_tokens: 2500,
            temperature: 0.7,
          };

    const stream = await together.chat.completions.create({
      model: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
      messages: [
        {
          role: "system",
          content:
            type === "quick"
              ? "You are a precise technical recruiter. Always return clean, accurate JSON with proper formatting."
              : "You are an expert technical recruiter and AI assistant specializing in job analysis, skill assessment, and creating engaging job posts. Provide comprehensive analysis while maintaining professional formatting.",
        },
        { role: "user", content: prompt },
      ],
      ...config,
      stream: true,
    });

    let raw = "";
    for await (const chunk of stream) {
      const content = chunk.choices?.[0]?.delta?.content;
      if (content) raw += content;
    }

    // const raw = response.choices[0].message.content;
    console.log("Raw API Response:", raw);

    let result;
    try {
      // Clean the response string
      let jsonStr = raw
        .replace(/```json\n?/g, "") // Remove ```json
        .replace(/```\n?/g, "") // Remove ```
        .replace(/\n/g, " ") // Replace newlines with spaces
        .replace(/\s+/g, " ") // Replace multiple spaces with single space
        .trim(); // Remove leading/trailing whitespace

      console.log("Cleaned JSON string:", jsonStr);

      try {
        result = JSON.parse(jsonStr);
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        console.error("Invalid JSON string:", jsonStr);

        // Fix common JSON issues
        jsonStr = jsonStr
          .replace(/'/g, '"') // Replace single quotes with double quotes
          .replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3') // Add quotes to property names
          .replace(/(:\s*)(\w+)(\s*[,}])/g, '$1"$2"$3') // Add quotes to string values
          .replace(/(:\s*)\[([^\]]*)\]/g, (match, p1, p2) => {
            // Fix array values
            const fixedArray = p2
              .split(",")
              .map((item) => {
                const trimmed = item.trim();
                return trimmed.startsWith('"') ? trimmed : `"${trimmed}"`;
              })
              .join(",");
            return `${p1}[${fixedArray}]`;
          });

        console.log("Attempting to parse fixed JSON:", jsonStr);
        result = JSON.parse(jsonStr);
      }

      // Generate the final LinkedIn post if not already included (for detailed type)
      if (type === "detailed" && !result.linkedinPost.finalPost) {
        const format = result.linkedinPost.formatting.emojis;
        result.linkedinPost.finalPost = `${
          result.linkedinPost.formattedContent.headline
        }
  
${format.company} ${result.linkedinPost.formattedContent.introduction}
  
${result.linkedinPost.formattedContent.companyPitch}
  
${format.requirements} Role Overview:
${result.linkedinPost.formattedContent.roleOverview}
  
${format.requirements} Key Points:
${result.linkedinPost.formattedContent.keyPoints
  .map((point) => `• ${point}`)
  .join("\n")}
  
${format.skills} Required Skills:
${result.linkedinPost.formattedContent.skillsRequired}
  
${format.benefits} What We Offer:
${result.linkedinPost.formattedContent.benefitsSection}
  
${format.location} Location: ${result.jobDetails.location}
${format.salary} Salary: ${result.jobDetails.salary.currency}${
          result.jobDetails.salary.min
        }-${result.jobDetails.salary.max}
  
${format.apply} ${result.linkedinPost.formattedContent.callToAction}
  
${result.linkedinPost.hashtags.map((tag) => "#" + tag).join(" ")}`;
      }
    } catch (e) {
      console.error("Failed to parse response:", e);
      return res.status(500).json({
        error: "Failed to generate job post and analysis",
        details: e.message,
        rawResponse: raw,
      });
    }

    res.json(result);
  } catch (error) {
    console.error("Error in job post generation:", error);
    res.status(500).json({ error: "Failed to process job post request" });
  }
};
