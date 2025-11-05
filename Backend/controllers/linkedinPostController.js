const { Together } = require("together-ai");
require("dotenv").config();
const Company = require("../models/ProfileModel");

const together = new Together({ apiKey: process.env.TOGETHER_API_KEY });

module.exports.generateJobPost = async (req, res) => {
  try {
    const { description, type = "detailed" } = req.body;
    const user = req.user;

    const company = await Company.findById(user.profile);
    const companyLocation = company.companyDetails.location;
    console.log(company);

    if (!description) {
      return res.status(400).json({
        error: "Missing job description",
        required: {
          description: "Detailed description of the job position",
        },
      });
    }

    const { getQuickPrompt, getDetailedPrompt } = require('../prompts/linkedinJobPostPrompts');
    const prompt = type === "quick" ? getQuickPrompt(description, companyLocation) : getDetailedPrompt(description, companyLocation);
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
    //console.log("Raw API Response:", raw);

    let result;
    try {
      // Clean the response string
      let jsonStr = raw
        .replace(/```json\n?/g, "") // Remove ```json
        .replace(/```\n?/g, "") // Remove ```
        .replace(/\n/g, " ") // Replace newlines with spaces
        .replace(/\s+/g, " ") // Replace multiple spaces with single space
        .trim(); // Remove leading/trailing whitespace

      // console.log("Cleaned JSON string:", jsonStr);

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

        //console.log("Attempting to parse fixed JSON:", jsonStr);
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
