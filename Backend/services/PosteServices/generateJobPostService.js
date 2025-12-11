const { Together } = require("together-ai");
require("dotenv").config();
const Company = require("../../models/ProfileModel");
const { getQuickPrompt, getDetailedPrompt } = require("../../prompts/generateJobPostPrompts");

// Helper: extract first balanced JSON object from a string (simple brace counting)
function extractFirstJson(str) {
  const start = str.indexOf("{");
  if (start === -1) return null;
  let depth = 0;
  for (let i = start; i < str.length; i++) {
    const ch = str[i];
    if (ch === "{") depth++;
    else if (ch === "}") depth--;
    if (depth === 0) return str.slice(start, i + 1);
  }
  return null;
}

function safeParseJsonCandidate(raw) {
  // try direct parse
  try {
    return JSON.parse(raw);
  } catch (e) {
    // try extract first JSON object
    const candidate = extractFirstJson(raw);
    if (candidate) {
      try {
        return JSON.parse(candidate);
      } catch (e2) {
        // fallthrough to fallback cleaning
      }
    }

    // fallback: basic cleaning heuristics
    let jsonStr = raw
      .replace(/```json\n?/gi, "")
      .replace(/```\n?/g, "")
      .replace(/\n/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    jsonStr = jsonStr.replace(/'/g, '"');
    jsonStr = jsonStr.replace(/([{,]\s*)([A-Za-z0-9_\-]+)(\s*:)/g, '$1"$2"$3');
    try {
      return JSON.parse(jsonStr);
    } catch (e3) {
      // as last resort return null
      return null;
    }
  }
}

const together = new Together({ apiKey: process.env.TOGETHER_API_KEY });

async function generateJobPost(description, type = "detailed", user) {
  if (!description) {
    const err = new Error("Missing job description");
    err.status = 400;
    throw err;
  }

  if (!process.env.TOGETHER_API_KEY) {
    const err = new Error("Missing Together API key (TOGETHER_API_KEY)");
    err.status = 500;
    throw err;
  }

  // Resolve company location
  const company = user?.profile ? await Company.findById(user.profile) : null;
  const companyLocation = company?.companyDetails?.location || "";

  const prompt = type === "quick" ? getQuickPrompt(description, companyLocation) : getDetailedPrompt(description, companyLocation);
  const config = type === "quick" ? { max_tokens: 1000, temperature: 0.4, top_p: 0.9 } : { max_tokens: 2500, temperature: 0.7 };

  // read stream safely and limit maximum raw size to avoid runaway responses
  const MAX_RAW_LENGTH = 1_000_000; // 1MB
  const stream = await together.chat.completions.create({
    model: process.env.POST_GEN_MODEL || "meta-llama/Llama-3.3-70B-Instruct-Turbo",
    messages: [
      { role: "system", content: type === "quick" ? "You are a precise technical recruiter. Always return clean, accurate JSON with proper formatting." : "You are an expert technical recruiter and AI assistant specializing in job analysis, skill assessment, and creating engaging job posts. Provide comprehensive analysis while maintaining professional formatting." },
      { role: "user", content: prompt },
    ],
    ...config,
    stream: true,
  });

  let raw = "";
  try {
    for await (const chunk of stream) {
      const content = chunk.choices?.[0]?.delta?.content;
      if (content) {
        raw += content;
        if (raw.length > MAX_RAW_LENGTH) {
          // Stop early if too large
          break;
        }
      }
    }
  } catch (streamErr) {
    const err = new Error(`Stream error from Together API: ${streamErr.message || streamErr}`);
    err.rawResponse = raw;
    throw err;
  }

  // Attempt to parse robustly
  const parsed = safeParseJsonCandidate(raw);
  if (!parsed) {
    const err = new Error("Failed to parse response from LLM");
    err.rawResponse = raw;
    throw err;
  }

  let result = parsed;

  // Build finalPost if needed (safer checks)
  if (type === "detailed") {
    try {
      const lp = result.linkedinPost || {};
      const fmt = lp.formatting?.emojis || {};
      const fc = lp.formattedContent || {};
      const jd = result.jobDetails || {};

      if (!lp.finalPost) {
        const headline = fc.headline || "";
        const introduction = fc.introduction || "";
        const companyPitch = fc.companyPitch || "";
        const roleOverview = fc.roleOverview || "";
        const keyPoints = Array.isArray(fc.keyPoints) ? fc.keyPoints : [];
        const skillsRequired = fc.skillsRequired || "";
        const benefitsSection = fc.benefitsSection || "";
        const callToAction = fc.callToAction || "";
        const hashtags = Array.isArray(lp.hashtags) ? lp.hashtags : [];
        const location = jd.location || "";
        const salary = jd.salary || {};

        const salaryStr = salary.currency && (salary.min || salary.max) ? `${salary.currency}${salary.min || ""}-${salary.max || ""}` : "";

        const joinPoints = (pts) => pts.map((p) => `• ${p}`).join("\n");

        lp.finalPost = [`${headline}`,
          "",
          `${fmt.company || ""} ${introduction}`,
          "",
          `${companyPitch}`,
          "",
          `${fmt.requirements || ""} Role Overview:\n${roleOverview}`,
          "",
          `${fmt.requirements || ""} Key Points:\n${joinPoints(keyPoints)}`,
          "",
          `${fmt.skills || ""} Required Skills:\n${skillsRequired}`,
          "",
          `${fmt.benefits || ""} What We Offer:\n${benefitsSection}`,
          "",
          `${fmt.location || ""} Location: ${location}`,
          `${fmt.salary || ""} Salary: ${salaryStr}`,
          "",
          `${fmt.apply || ""} ${callToAction}`,
          "",
          `${hashtags.map((t) => `#${t}`).join(" ")}`].filter(Boolean).join("\n\n");

        result.linkedinPost = lp;
      }
    } catch (inner) {
      // ignore and return parsed result
      console.warn("Could not build finalPost:", inner && inner.message ? inner.message : inner);
    }
  }

  return result;
}

module.exports = { generateJobPost };
