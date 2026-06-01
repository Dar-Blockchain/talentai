const getDetailedPrompt = (description, companyLocation, language = "en", employmentType = "Full-time") => {
  const languageInstruction =
    language === "fr"
      ? "Generate ALL text fields in FRENCH only."
      : "Generate ALL text fields in ENGLISH only.";

  const isInternship = employmentType === "Internship";

  const internshipInstruction = isInternship ? `
━━━ INTERNSHIP MODE ━━━

This is an internship role. Apply these rules without exception:
- "employmentType" MUST be "Internship"
- "experienceLevel" MUST be "Junior"
- level for ALL skills (requiredSkills AND softSkills) MUST be null
- Requirements must NOT mention years of production experience.
  Use instead: "Basic knowledge of", "Personal or academic project experience with", "Exposure to X through coursework or self-learning"
- Responsibilities should reflect learning and contributing — not owning or leading
` : "";

  return `
You are a structured job analysis AI.
Generate realistic job post data using only information supported by the input. Do not invent specific facts (numbers, tools, salaries, names) not present in the description. When a required field has no signal, use the safe default — never a specific guess.

If information is missing or uncertain, use null or safe defaults instead of guessing.

Infer only what is clearly supported by the job description. Do not rely on the example content when generating the final output.

${languageInstruction}

Analyze the job description below and return a single valid JSON object. No markdown, no explanation — raw JSON only.

If the input is not a valid job description (random words, gibberish, offensive content, or completely unrelated text) → return exactly this and nothing else:
{ "error": "invalid_input" }

${internshipInstruction}
━━━ OUTPUT STRUCTURE ━━━

{
  "jobDetails": {
    "title": string,
    "description": string,
    "requirements": string[],
    "responsibilities": string[],
    "location": string,
    "workMode": "Remote" | "On-site" | "Hybrid",
    "employmentType": "${employmentType}",
    "experienceLevel": ${isInternship ? '"Junior"' : '"Junior" | "Mid-level" | "Senior" | "Expert"'},
    "salary": { "min": number, "max": number, "currency": string }
  },
  "skillAnalysis": {
    "requiredSkills": [
      { "name": string, "level": 1|2|3|4|5|null, "category": "Frontend"|"Backend"|"Fullstack"|"Mobile"|"DevOps"|"Cloud"|"Data"|"AI/ML"|"Security"|"QA"|"Blockchain"|"Product"|"Design"|"Marketing"|"Sales"|"Finance"|"Operations"|"Legal"|"HR"|"Other" }
    ],
    "softSkills": [
      { "name": string, "level": 1|2|3|4|5|null }
    ]
  }
}

━━━ EXAMPLE — JSON structure only (do not copy this content) ━━━

Input: "Senior Node.js engineer, 6+ years, Kafka and PostgreSQL experience, will mentor junior devs."

Output:
{
  "jobDetails": {
    "title": "Senior Backend Engineer",
    "description": "One focused paragraph: what this person owns, builds, or leads — written for the candidate, not the company.",
    "requirements": ["Most critical requirement", "Second requirement", "Third requirement"],
    "responsibilities": ["Core responsibility 1", "Core responsibility 2"],
    "location": "Not specified",
    "workMode": "On-site",
    "employmentType": "Full-time",
    "experienceLevel": "Senior",
    "salary": { "min": 0, "max": 0, "currency": "USD" }
  },
  "skillAnalysis": {
    "requiredSkills": [
      { "name": "Node.js", "level": 4, "category": "Backend" },
      { "name": "Apache Kafka", "level": null, "category": "Backend" },
      { "name": "PostgreSQL", "level": null, "category": "Backend" }
    ],
    "softSkills": [
      { "name": "Technical Leadership", "level": null }
    ]
  }
}

━━━ KEY PRINCIPLES ━━━

description
- Make it feel like a real person wrote it about a real job
- Say what the person will own, build, or lead — not what the company wants
- If you can swap the description into any other job post without it feeling wrong, rewrite it

requirements
- Be specific enough that a candidate can self-assess in 30 seconds
- 4 to 8 items ordered from most critical to least critical
- If salary is not explicitly stated with real numbers → { "min": 0, "max": 0, "currency": "USD" }
- If location is not in the description → use: "${companyLocation || "Not specified"}"

skills
- 1 to 3 required skills — only specific named tools or technologies explicitly mentioned in the description. Never invent a skill not present. If fewer than 3 are named, return only what exists. + 1 soft skill
- Prefer specific named tools over generic labels
  Frontend: React.js, Vue, Angular… | Backend: Node.js, Django, Spring… | Mobile: Swift, Kotlin, Flutter…
  DevOps/Cloud: Docker, Kubernetes, AWS, GCP… | Data: Spark, dbt, Airflow… | AI/ML: PyTorch, TensorFlow, LangChain…
  Security: Burp Suite, Splunk, IAM… | QA: Cypress, Selenium, Jest… | Blockchain: Solidity, Hardhat, Web3.js…
  Product: Jira, Figma, Amplitude… | Marketing: Google Ads, HubSpot… | Finance: Excel, SAP, QuickBooks…
  NEVER use: "Programming", "Communication Tools", "Software", "Technology"

- level: required proficiency for this specific skill (1–5 or null)
  1 = Basic    → "familiarity with", "exposure to", "basic knowledge of"
  2 = Junior   → "some experience", "understanding of", no qualifier stated
  3 = Mid      → "experience with", "proficient in", "solid knowledge"
  4 = Senior   → "strong experience", "advanced", "deep knowledge", "5–8 years"
  5 = Expert   → "expert in", "mastery of", "8+ years"
  null         → genuinely unclear → code applies job's experienceLevel as default
  Percentages are computed in code — do not output them.


experienceLevel
- Default to "Mid-level" if the description gives no seniority or years signal
- Junior: 1–3 yrs | Mid-level: 3–5 yrs | Senior: 5–8 yrs | Expert: 8+ yrs

━━━ JOB DESCRIPTION ━━━

${description}
`.trim();
};

// ── Rank-based percentage table for up to 3 required skills (must sum to 80) ──
const RANK_PCTS = [45, 20, 15];

/**
 * Convert raw model JSON into the final shape the frontend expects.
 * The model never does arithmetic — level and percentage are computed here.
 *
 * Input per skill:  { name, category, yearsSignal, ...any extra model fields }
 * Output per skill: { name, category, level, percentage }            (no yearsSignal)
 * Output per soft:  { name, level, percentage }
 *
 * Guarantees: requiredSkills pcts sum to 80, softSkills pcts sum to 20, total = 100.
 *
 * Usage (in the service, after JSON.parse):
 *   const clean = normalizeSkillAnalysis(parseLLMJson(response.content));
 */
function normalizeSkillAnalysis(result) {
  if (!result || result.error || !result.skillAnalysis) return result;

  const isInternship = result?.jobDetails?.employmentType === "Internship";
  const expFallback = { "Junior": 1, "Mid-level": 2, "Senior": 3, "Expert": 4 };
  const nullFallback = expFallback[result?.jobDetails?.experienceLevel] || 2;

  function resolveLevel(modelLevel) {
    if (isInternship) return 1;
    if (typeof modelLevel === "number" && modelLevel >= 1 && modelLevel <= 5) {
      return Math.round(modelLevel);
    }
    return nullFallback;
  }

  // ── Required skills: keep first 3, assign rank-based percentages ──────────
  const rawRequired = Array.isArray(result.skillAnalysis.requiredSkills)
    ? result.skillAnalysis.requiredSkills.slice(0, 3)
    : [];

  let requiredPcts = [];
  const n = rawRequired.length;
  if (n > 0) {
    const ranks = RANK_PCTS.slice(0, n);
    const rankSum = ranks.reduce((a, b) => a + b, 0);
    const scaled = ranks.map((r) => Math.round((r / rankSum) * 80));
    // Absorb rounding drift into the largest item (always index 0)
    scaled[0] += 80 - scaled.reduce((a, b) => a + b, 0);
    requiredPcts = scaled;
  }

  const requiredSkills = rawRequired.map((skill, i) => ({
    name: skill.name,
    category: skill.category,
    level: resolveLevel(skill.level),
    percentage: requiredPcts[i],
  }));

  // ── Soft skills: keep first 1, fixed at 20 % ─────────────────────────────
  const rawSoft = Array.isArray(result.skillAnalysis.softSkills)
    ? result.skillAnalysis.softSkills.slice(0, 1)
    : [];

  const softSkills = rawSoft.map((skill) => ({
    name: skill.name,
    level: resolveLevel(skill.level),
    percentage: 20,
  }));

  return {
    ...result,
    skillAnalysis: { ...result.skillAnalysis, requiredSkills, softSkills },
  };
}

module.exports = {
  getDetailedPrompt,
  generatePrompt: getDetailedPrompt,
  normalizeSkillAnalysis,
};
