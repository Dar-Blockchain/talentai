const { Together } = require("together-ai");
require("dotenv").config();
const Company = require("../../models/ProfileModel");
const { getQuickPrompt, getDetailedPrompt } = require("../../prompts/linkedinJobPostPrompts");

const together = new Together({ apiKey: process.env.TOGETHER_API_KEY });

async function generateJobPost(description, type = "detailed", user) {
  try {
    if (!description) {
      const err = new Error("Missing job description");
      err.status = 400;
      throw err;
    }

    // Resolve company location
    const company = user?.profile ? await Company.findById(user.profile) : null;
    const companyLocation = company?.companyDetails?.location || "";

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

    // Clean and parse the response
    let result;
    try {
      let jsonStr = raw
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .replace(/\n/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      try {
        result = JSON.parse(jsonStr);
      } catch (parseError) {
        // Attempt common fixes
        jsonStr = jsonStr
          .replace(/'/g, '"')
          .replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3')
          .replace(/(:\s*)(\w+)(\s*[,}])/g, '$1"$2"$3')
          .replace(/(:\s*)\[([^\]]*)\]/g, (match, p1, p2) => {
            const fixedArray = p2
              .split(',')
              .map((item) => {
                const trimmed = item.trim();
                return trimmed.startsWith('"') ? trimmed : `"${trimmed}"`;
              })
              .join(',');
            return `${p1}[${fixedArray}]`;
          });

        result = JSON.parse(jsonStr);
      }

      // Build finalPost if needed
      if (type === "detailed" && !result?.linkedinPost?.finalPost) {
        try {
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
        } catch (inner) {
          // If building finalPost fails, ignore and return whatever parsed result we have
          console.warn('Could not build finalPost:', inner.message || inner);
        }
      }
    } catch (e) {
      const err = new Error(`Failed to parse response from LLM: ${e.message || e}`);
      err.rawResponse = raw;
      throw err;
    }

    return result;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  generateJobPost,
};
