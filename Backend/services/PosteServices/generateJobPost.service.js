const bedrock = require("../../helpers/bedrock.helpers");
require("dotenv").config();
const Profile = require("../../models/Profile.model");
const { generatePrompt, normalizeSkillAnalysis } = require("../../prompts/generate-job-post-prompts");

function parseLLMJson(raw) {
  const firstBrace = raw.indexOf("{");
  const lastBrace  = raw.lastIndexOf("}");
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

async function generateJobPost(description, user, overrides = {}) {
  const MAX_RETRIES  = parseInt(process.env.GENERATE_JOBPOST_MAX_RETRIES   || "3",    10);
  const BASE_DELAY   = parseInt(process.env.GENERATE_JOBPOST_BASE_DELAY_MS || "1000", 10);
  const { workMode, contractType, language = "en" } = overrides;

  const company         = user?.profile ? await Profile.findById(user.profile).lean() : null;
  const companyLocation = company?.companyDetails?.location || "";
  const prompt          = generatePrompt(description, companyLocation, language, contractType);
  const sleep           = (ms) => new Promise((r) => setTimeout(r, ms));

  const attemptOnce = async () => {
    const response = await bedrock.callLLM({
      systemPrompt:
        "You are an expert technical recruiter and AI assistant specializing in job analysis, skill extraction, and structured job post generation. Your output must always be a single valid JSON object — no extra text, no markdown, no explanations. Follow every rule in the user prompt exactly and consistently.",
      messages:    [{ role: "user", content: prompt }],
      temperature: 0.1,
      maxTokens:   4096,
      timeout:     30000,
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
    if (workMode     && result?.jobDetails) result.jobDetails.workMode       = workMode;
    if (contractType && result?.jobDetails) result.jobDetails.employmentType = contractType;

    return normalizeSkillAnalysis(result);
  };

  let lastError;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await attemptOnce();
    } catch (err) {
      lastError = err;
      const isParseError = (err.message || "").includes("Failed to parse") || !!err.rawResponse;
      if (attempt === MAX_RETRIES || !isParseError) throw err;

      const backoff = Math.pow(2, attempt - 1) * BASE_DELAY;
      const jitter  = Math.floor(Math.random() * Math.min(500, backoff));
      console.warn(`generateJobPost: parse error attempt ${attempt}, retry in ${backoff + jitter}ms`);
      await sleep(backoff + jitter);
    }
  }

  throw lastError || new Error("Unknown error in generateJobPost");
}

module.exports = { generateJobPost };