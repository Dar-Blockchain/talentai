const { OpenAI } = require("openai");
require("dotenv").config();

// Configure the OpenAI client with your API key
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

module.exports.generateJobPost = async (req, res) => {
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
Create a job post for: ${description}

Return JSON only:
{
  "jobDetails": {
    "title": "title",
    "description": "short description",
    "requirements": ["req1", "req2"],
    "responsibilities": ["resp1", "resp2"],
    "location": "location",
    "employmentType": "type",
    "experienceLevel": "level",
    "salary": {"min": 0, "max": 0, "currency": "USD"}
  },
  "skillAnalysis": {
    "requiredSkills": [{"name": "skill", "level": "1-5", "importance": "Required/Nice", "category": "category"}],
    "suggestedSkills": {
      "technical": [{"name": "skill", "reason": "why", "category": "type", "priority": "High/Med/Low"}],
      "frameworks": [{"name": "framework", "relatedTo": "tech", "priority": "priority"}],
      "tools": [{"name": "tool", "purpose": "use", "category": "type"}]
    },
    "skillSummary": {
      "mainTechnologies": ["tech1"],
      "complementarySkills": ["skill1"],
      "learningPath": ["path1"],
      "stackComplexity": "level"
    }
  },
  "linkedinPost": {
    "formattedContent": {
      "headline": "title",
      "introduction": "intro",
      "companyPitch": "pitch",
      "roleOverview": "overview",
      "keyPoints": ["point1"],
      "skillsRequired": "skills",
      "benefitsSection": "benefits",
      "callToAction": "apply now"
    },
    "hashtags": ["tag1"],
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
    "finalPost": ""
  }
}`.trim();
  
      const response = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          { 
            role: "system", 
            content: "You are a recruiter. Return only JSON."
          },
          { role: "user", content: prompt }
        ],
        max_tokens: 1000,
        temperature: 0.5,
        response_format: { type: "json_object" }
      });

      // Parse the response
      const raw = response.choices[0].message.content;
      let result;
      try {
        result = JSON.parse(raw);
  
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

${result.linkedinPost.hashtags.map(tag => '#' + tag).join(' ')}

🔗 Take the test and apply now at: https://staging.talentai.bid/test`;
        }
  
        res.json(result);
      } catch (e) {
        console.error("Failed to parse response:", e);
        return res.status(500).json({ error: "Failed to generate job post and analysis" });
      }
    } catch (error) {
      console.error("Error in job post generation:", error);
      res.status(500).json({ error: "Failed to process job post request" });
    }
};