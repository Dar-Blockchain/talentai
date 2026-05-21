const bedrock = require("../../helpers/bedrock.helpers");
require("dotenv").config();
const Profile = require("../../models/Profile.model");
const { generatePrompt } = require("../../prompts/generate-job-post-prompts");

// Parse and repair a raw LLM string into a JSON object.
function parseLLMJson(raw) {
  const firstBrace = raw.indexOf("{");
  const lastBrace = raw.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error("No JSON object found in LLM response");
  }

  let jsonStr = raw.substring(firstBrace, lastBrace + 1)
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  try {
    return JSON.parse(jsonStr);
  } catch {
    // Attempt common repairs: unquoted keys/values, single quotes
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
    return JSON.parse(jsonStr);
  }
}

// Normalize skill percentages so all skills sum to exactly 100%.
function normalizeSkillPercentages(skillAnalysis) {
  const required = skillAnalysis?.requiredSkills || [];
  const soft = skillAnalysis?.softSkills || [];
  const all = [...required, ...soft];
  if (all.length === 0) return;

  const total = all.reduce((sum, s) => sum + (s.percentage || 0), 0);
  if (total === 100 || total === 0) return;

  const factor = 100 / total;
  all.forEach((s) => {
    s.percentage = Math.round(s.percentage * factor);
  });

  // Fix rounding drift on the last skill
  const newTotal = all.reduce((sum, s) => sum + s.percentage, 0);
  all[all.length - 1].percentage += 100 - newTotal;

  console.log(`✅ Skill percentages normalized to 100% (was ${total}%)`);
}

async function generateJobPost(description, user, overrides = {}) {
  const MAX_RETRIES = parseInt(process.env.GENERATE_JOBPOST_MAX_RETRIES || "3", 10);
  const BASE_DELAY_MS = parseInt(process.env.GENERATE_JOBPOST_BASE_DELAY_MS || "1000", 10);
  const { workMode, contractType, language = "en" } = overrides;

  // Fetch company location once — outside the retry loop
  const company = user?.profile ? await Profile.findById(user.profile).lean() : null;
  const companyLocation = company?.companyDetails?.location || "";

  const prompt = generatePrompt(description, companyLocation, language);

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const attemptOnce = async () => {
    const response = await bedrock.callLLM({
      systemPrompt:
        "You are an expert technical recruiter and AI assistant specializing in job analysis, skill assessment, and creating engaging job posts. Provide comprehensive analysis while maintaining professional formatting.",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      maxTokens: 4096,
      timeout: 30000,
    });

    let result;
    try {
      result = parseLLMJson(response.content);
    } catch (e) {
      const err = new Error(`Failed to parse response from LLM: ${e.message}`);
      err.rawResponse = response.content;
      throw err;
    }

    // Apply caller overrides
    if (workMode && result?.jobDetails) {
      result.jobDetails.workMode = workMode;
    }
    if (contractType && result?.jobDetails) {
      result.jobDetails.employmentType = contractType;
    }

    normalizeSkillPercentages(result?.skillAnalysis);

    return result;
  };

  // Retry loop — only retries on JSON parse failures
  let lastError;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await attemptOnce();
    } catch (err) {
      lastError = err;
      const isParseError =
        (err.message || "").includes("Failed to parse response from LLM") ||
        !!err.rawResponse;
      const isLast = attempt === MAX_RETRIES;

      if (isLast || !isParseError) throw err;

      const backoff = Math.pow(2, attempt - 1) * BASE_DELAY_MS;
      const jitter = Math.floor(Math.random() * Math.min(500, backoff));
      console.warn(
        `generateJobPost: parse error on attempt ${attempt}, retrying after ${backoff + jitter}ms`
      );
      await sleep(backoff + jitter);
    }
  }

  throw lastError || new Error("Unknown error in generateJobPost");
}

module.exports = { generateJobPost };
