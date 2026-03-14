const bedrock = require("../../helpers/bedrock.helpers");
require("dotenv").config();
const Company = require("../../models/Profile.model");
const {
  getDetailedPrompt,
} = require("../../prompts/generate-job-post-prompts");

async function generateJobPost(description, user, overrides = {}) {
  // Configurable retry parameters via env
  const MAX_RETRIES = parseInt(process.env.GENERATE_JOBPOST_MAX_RETRIES || "3", 10);
  const BASE_DELAY_MS = parseInt(process.env.GENERATE_JOBPOST_BASE_DELAY_MS || "1000", 10);
  const { workMode, contractType } = overrides;

  // Helper sleep with jitter
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // Single attempt: call LLM and parse response
  const attemptOnce = async () => {
    if (!description) {
      const err = new Error("Missing job description");
      err.status = 400;
      throw err;
    }

    // Resolve company location
    const company = user?.profile ? await Company.findById(user.profile) : null;
    const companyLocation = company?.companyDetails?.location || "";

    const prompt = getDetailedPrompt(description, companyLocation);

    const response = await bedrock.callLLM({
      systemPrompt: "You are an expert technical recruiter and AI assistant specializing in job analysis, skill assessment, and creating engaging job posts. Provide comprehensive analysis while maintaining professional formatting.",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      maxTokens: 2500,
      timeout: 30000,
    });

    const raw = response.content;

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
              .split(",")
              .map((item) => {
                const trimmed = item.trim();
                return trimmed.startsWith('"') ? trimmed : `"${trimmed}"`;
              })
              .join(",");
            return `${p1}[${fixedArray}]`;
          });

        result = JSON.parse(jsonStr);
      }

      // Override workMode and contractType if provided
      if (workMode && result?.jobDetails) {
        result.jobDetails.workMode = workMode;
        console.log("✅ workMode overridden to:", workMode);
      }
      if (contractType && result?.jobDetails) {
        result.jobDetails.employmentType = contractType;
        console.log("✅ contractType (employmentType) overridden to:", contractType);
      }

      // Build finalPost if needed
      if (!result?.linkedinPost?.finalPost) {
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
          console.warn("Could not build finalPost:", inner.message || inner);
        }
      }
    } catch (e) {
      const err = new Error(
        `Failed to parse response from LLM: ${e.message || e}`
      );
      err.rawResponse = raw;
      throw err;
    }

    return result;
  };

  // Retry loop
  let lastError;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await attemptOnce();
      return res;
    } catch (err) {
      lastError = err;
      const isParseError = (err.message || "").includes("Failed to parse response from LLM") || err.rawResponse;
      const isLast = attempt === MAX_RETRIES;

      if (isLast || !isParseError) {
        // If it's not a parse/transient error or we've exhausted retries, rethrow
        throw err;
      }

      // Otherwise wait with exponential backoff + jitter and retry
      const backoff = Math.pow(2, attempt - 1) * BASE_DELAY_MS;
      const jitter = Math.floor(Math.random() * Math.min(500, backoff));
      const waitMs = backoff + jitter;
      console.warn(`generateJobPost: parse error on attempt ${attempt}, retrying after ${waitMs}ms`);
      await sleep(waitMs);
      // continue loop
    }
  }

  // If somehow loop exits, throw last error
  throw lastError || new Error("Unknown error in generateJobPost");
}

module.exports = {
  generateJobPost,
};
