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
- level for ALL skills (requiredSkills AND softSkills): always return null — code resolves it automatically
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

If the description is valid but too vague to generate a meaningful job post (e.g., only a job title with no context, fewer than 10 meaningful words, no indication of role scope or required skills) → return exactly this and nothing else:
{ "error": "insufficient_detail" }

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
      { "name": string, "level": 1|2|3|4|5|null, "importance": 1-10, "category": "Frontend"|"Backend"|"Fullstack"|"Mobile"|"DevOps"|"Cloud"|"Data"|"AI/ML"|"Security"|"QA"|"Blockchain"|"GameDev"|"Embedded"|"Product"|"Design"|"Marketing"|"Sales"|"Finance"|"Operations"|"Legal"|"HR"|"Other" }
    ],
    "softSkills": [
      { "name": string, "level": 1|2|3|4|5|null, "importance": 1-10 }
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
      { "name": "Node.js", "level": 4, "importance": 9, "category": "Backend" },
      { "name": "Apache Kafka", "level": 3, "importance": 6, "category": "Backend" },
      { "name": "PostgreSQL", "level": 3, "importance": 6, "category": "Backend" }
    ],
    "softSkills": [
      { "name": "Technical Leadership", "level": null, "importance": 8 },
      { "name": "Mentoring", "level": null, "importance": 5 }
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
- 1 to 3 required skills — extract only skills explicitly mentioned or directly implied by the role (e.g. "React developer" implies React.js). Do NOT pad to reach 3 — if the description names 2 skills, return 2. If it names 1, return 1. Prefer specific named tools over generic terms.
- softSkills MUST always contain at least 1 item — never return an empty array.
- Prefer specific named tools over generic labels
  Frontend: React.js, Vue, Angular… | Backend: Node.js, Django, Spring… | Mobile: Swift, Kotlin, Flutter…
  DevOps/Cloud: Docker, Kubernetes, AWS, GCP… | Data: Spark, dbt, Airflow… | AI/ML: PyTorch, TensorFlow, LangChain…
  Security: Burp Suite, Splunk, IAM… | QA: Cypress, Selenium, Jest… | Blockchain: Solidity, Hardhat, Web3.js…
  GameDev: Unity, Unreal Engine, Godot, C# (Unity)… | Embedded: C, C++, RTOS, Arduino, STM32, ROS…
  Product: Jira, Figma, Amplitude… | Marketing: Google Ads, HubSpot… | Finance: Excel, SAP, QuickBooks…
  NEVER use: "Programming", "Communication Tools", "Software", "Technology"

- level: required proficiency for this specific skill (1–5 or null)
  Map directly from the years or signal in the description:
  "knowledge", "familiarity", "basic", "exposure"  → 1
  "1–2 years", "some experience", "understanding"  → 2
  "3–4 years", "proficient", "solid", "good grasp" → 3
  "5–7 years", "strong", "advanced", "deep"        → 4
  "8+ years", "expert", "mastery"                  → 5
  null → signal genuinely absent from description  → code defaults to Junior (2)

  SENIORITY FLOOR — mandatory:
  If experienceLevel is "Senior" or "Expert", required technical skills MUST have a minimum level of 3 — unless the description explicitly marks them as secondary, optional, or "nice to have".
  The primary skill (highest importance score) must match the role seniority: Senior → level 4, Expert → level 5. All other required skills minimum level 3.
  The level mapping always takes priority when the description explicitly qualifies a skill (e.g., "basic", "familiarity with", "exposure to"). The Seniority Floor applies only when no qualifier is present.

- importance: how critical this skill is to this specific role (1–10)
  This score is the ONLY input used to compute each skill's evaluation weight — set it with intent.
  10 = the role cannot function without it (e.g., React for a React Developer)
  7–9 = strongly required, major differentiator between candidates
  4–6 = secondary but expected for this level
  1–3 = nice to have, rarely decisive

  DIFFERENTIATION RULES — these are mandatory:
  - Skills at different levels MUST have clearly different scores — never cluster them (8/7/7 is wrong, 9/6/4 is right)
  - The primary skill must score at least 3 points above the lowest-scored skill
  - Ask yourself: "If a candidate is completely missing this skill, how much does it hurt?" → score accordingly
  - A score of 10 means the candidate cannot do the job without it. Use it only when truly the case.


experienceLevel
- Default to "Junior" if the description gives no seniority or years signal
- Junior: 1–3 yrs | Mid-level: 3–5 yrs | Senior: 5–8 yrs | Expert: 8+ yrs

━━━ JOB DESCRIPTION ━━━

${description}
`.trim();
};

const VALID_WORK_MODES       = ["Remote", "On-site", "Hybrid"];
const VALID_EXPERIENCE_LEVELS = ["Junior", "Mid-level", "Senior", "Expert"];

// Fallback importance weights when AI returns no importance values
const FALLBACK_IMPORTANCE = { required: [10, 6, 4], soft: [7, 4] };

const REQUIRED_TOTAL = 80;
const SOFT_TOTAL     = 20;

function normalizeSkillAnalysis(result) {
  if (!result || result.error || !result.skillAnalysis) return result;

  // ── Sanitize jobDetails fields with safe defaults ─────────────────────────
  if (result.jobDetails) {
    const jd = result.jobDetails;
    if (!jd.title        || typeof jd.title !== "string")          jd.title          = "Untitled Position";
    if (!jd.description  || typeof jd.description !== "string")    jd.description    = "";
    if (!Array.isArray(jd.requirements))                           jd.requirements   = [];
    if (!Array.isArray(jd.responsibilities))                       jd.responsibilities = [];
    if (!jd.location     || typeof jd.location !== "string")       jd.location       = "Not specified";
    if (!VALID_WORK_MODES.includes(jd.workMode))                   jd.workMode       = "On-site";
    if (!VALID_EXPERIENCE_LEVELS.includes(jd.experienceLevel))     jd.experienceLevel = "Mid-level";
    const sal = jd.salary || {};
    jd.salary = {
      min:      typeof sal.min === "number" ? sal.min : 0,
      max:      typeof sal.max === "number" ? sal.max : 0,
      currency: typeof sal.currency === "string" && sal.currency ? sal.currency : "USD",
    };
  }

  const isInternship = result?.jobDetails?.employmentType === "Internship";

  function resolveLevel(modelLevel) {
    if (isInternship) return 2;
    if (typeof modelLevel === "number" && modelLevel >= 1 && modelLevel <= 5) {
      return Math.max(2, Math.round(modelLevel));
    }
    return 2;
  }

  function getImportance(skill, fallbacks, index) {
    const v = skill.importance;
    return typeof v === "number" && v >= 1 && v <= 10 ? v : (fallbacks[index] ?? 3);
  }

  function distributePercentages(skills, total, fallbacks) {
    if (skills.length === 0) return [];
    // Square weights to amplify differences between importance scores
    const weights   = skills.map((s, i) => {
      const imp = getImportance(s, fallbacks, i);
      return imp * imp;
    });
    const weightSum = weights.reduce((a, b) => a + b, 0);
    const pcts      = weights.map((w) => Math.round((w / weightSum) * total));
    // Correct rounding drift on the highest-weight skill
    pcts[0] += total - pcts.reduce((a, b) => a + b, 0);
    return pcts;
  }

  // ── Collect skills ────────────────────────────────────────────────────────
  const rawRequired = Array.isArray(result.skillAnalysis.requiredSkills)
    ? result.skillAnalysis.requiredSkills.slice(0, 3)
    : [];

  const rawSoft = Array.isArray(result.skillAnalysis.softSkills) && result.skillAnalysis.softSkills.length > 0
    ? result.skillAnalysis.softSkills.slice(0, 2)
    : [{ name: "Communication", level: null, importance: 5 }];

  // ── Distribute within each group (80 hard / 20 soft — fixed) ────────────
  const requiredPcts = distributePercentages(rawRequired, REQUIRED_TOTAL, FALLBACK_IMPORTANCE.required);
  const softPcts     = distributePercentages(rawSoft,     SOFT_TOTAL,     FALLBACK_IMPORTANCE.soft);

  const requiredSkills = rawRequired.map((skill, i) => ({
    name:       skill.name,
    category:   skill.category,
    level:      resolveLevel(skill.level),
    percentage: requiredPcts[i],
  }));

  const softSkills = rawSoft.map((skill, i) => ({
    name:       skill.name,
    level:      resolveLevel(skill.level),
    percentage: softPcts[i],
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
