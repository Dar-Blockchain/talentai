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

title
- MUST always be returned — never null or empty.
- Derive it from the full job context: what the role actually does, the domain, and the seniority level. Never leave it empty.

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
- required skills — include EVERY skill explicitly named in the description (up to 3). When more than 3 skills are mentioned, use this priority order:
  1. Skills marked as "mandatory", "required", or "must have" — always include these first.
  2. Skills with explicit years signals — never drop these in favor of skills with no years.
  3. Skills with the strongest qualifier (mastery > solid > comfortable > basic).
  Do NOT pad — if the description names 2, return 2. If it names 1, return 1. Prefer specific named tools over generic terms.

- years parsing rule:
  - If a years signal PRECEDES a skill name (e.g. "2 years Node.js"), apply it to the skill that FOLLOWS it.
  - If a years signal FOLLOWS a skill (e.g. "React, 2 years" or "Python and NestJS for 7 years"), apply it to the skill IMMEDIATELY BEFORE it.
  - Never assign a years signal to a skill separated from it by another skill name.
  - Unless the description explicitly says "each" or "both" (e.g. "Python and NestJS, 7 years each"), do not apply the same years to multiple skills.
- softSkills MUST contain 1 to 2 items — never return an empty array.
  Always infer soft skills from the job context even if not explicitly stated. Use the role type, seniority, and skills to determine what matters most:
  - Senior/Expert roles → prefer "Technical Leadership", "Problem Solving", "Mentoring"
  - Collaborative/team roles → prefer "Teamwork", "Communication"
  - Creative/product roles → prefer "Creativity", "Attention to Detail"
  - Fast-paced/startup signals → prefer "Adaptability", "Ownership"
  - Client-facing signals → prefer "Communication", "Presentation Skills"
  Return 2 soft skills when the context clearly supports it, otherwise return 1. Never return "Communication" as the only soft skill unless the description explicitly signals a communication-heavy role.
- Prefer specific named tools over generic labels
  Frontend: React.js, Vue, Angular… | Backend: Node.js, Django, Spring… | Mobile: Swift, Kotlin, Flutter…
  DevOps/Cloud: Docker, Kubernetes, AWS, GCP… | Data: Spark, dbt, Airflow… | AI/ML: PyTorch, TensorFlow, LangChain…
  Security: Burp Suite, Splunk, IAM… | QA: Cypress, Selenium, Jest… | Blockchain: Solidity, Hardhat, Web3.js…
  GameDev: Unity, Unreal Engine, Godot, C# (Unity)… | Embedded: C, C++, RTOS, Arduino, STM32, ROS…
  Product: Jira, Figma, Amplitude… | Marketing: Google Ads, HubSpot… | Finance: Excel, SAP, QuickBooks…
  NEVER use generic category names as skills: "Programming", "Communication Tools", "Software", "Technology", "CI/CD tools", "Containerization tools", "Cloud platforms", "DevOps tools", "Frontend tools", "Backend technologies", "Database tools", "AI tools", "Analytics platforms", or any phrase ending in "tools", "technologies", "platforms", "frameworks", "solutions".
  Universal rule: if the description names a category without a specific tool, skip it as a standalone skill — only return named tools or technologies (e.g., Docker not "Containerization tools", GitHub Actions not "CI/CD tools", React.js not "Frontend framework").

- level: required proficiency for this specific skill (1–5 or null)
  Map directly from the years or signal in the description:
  "knowledge", "familiarity", "basic", "exposure"          → 1
  "1–2 years", "some experience", "understanding", "junior" → 2
  "3–4 years", "proficient", "solid", "good grasp", "mid", "mid-level", "intermediate" → 3
  "5–8 years", "strong", "advanced", "deep", "senior"      → 4
  "9+ years", "expert", "mastery"                          → 5
  null → signal genuinely absent from description  → code defaults to Junior (2)

  SENIORITY FLOOR — mandatory:
  If experienceLevel is "Senior" or "Expert", the PRIMARY skill only (highest importance score) must match the role seniority: Senior → level 4, Expert → level 5 — but ONLY if that skill has an explicit years signal OR a seniority qualifier (e.g., "senior React", "advanced Python").
  All other skills with NO explicit years or qualifier → always return null (code will default them to Junior/level 2).
  EXCEPTION — explicit years or qualifiers always win: If the description explicitly states years for a skill (e.g., "2 years React") or uses a qualifier (e.g., "senior", "mid", "basic", "familiarity with", "exposure to"), the level mapping for that skill ALWAYS takes priority.

- importance: assign based on the years signal OR seniority qualifier in the description (1–10).
  More years = higher importance — a skill with more years MUST always score higher than one with fewer years.
  Even a 1-year difference MUST result in a different importance score — no two skills with different year counts can share the same importance.
  Skills with no years signal always score lower than those with explicit years.
  Skills with only "knowledge", "basic", or "exposure" always score the lowest.
  When seniority qualifiers are used instead of years (e.g. "senior React", "mid Express"), treat them as equivalent years for importance scoring: senior → 5–8 years equivalent, mid → 3–4 years equivalent, junior → 1–2 years equivalent. A "senior" skill MUST always score higher importance than a "mid" or "junior" skill, regardless of mention order.
  ecosystem tie-breaking: When two or more skills have equal years, rank skills that belong to the same ecosystem or framework hierarchy as the highest-importance skill above unrelated skills. Give the ecosystem-related skill a 1-point higher importance score.
  Examples: React.js is the foundation of Next.js → React ranks above unrelated same-years skills when Next.js is primary. TypeScript underlies JS frameworks. Express.js belongs to the Node.js ecosystem.


experienceLevel
- Set based on the HIGHEST explicit years signal stated for the overall role (e.g., "1-2 years of experience", "5+ years required"). Do NOT use skill qualifiers (mastery, solid, basic, advanced) to determine experienceLevel — those set the individual skill level only.
- When an explicit overall years requirement exists, ALL required skill levels are capped at the corresponding maximum — no individual skill qualifier (even "mastery") can exceed it.
- Default to "Junior" if the description gives no seniority or years signal.
- Junior: 0–2 yrs → max skill level 2 | Mid-level: 3–4 yrs → max skill level 3 | Senior: 5–8 yrs → max skill level 4 | Expert: 9+ yrs → max skill level 5

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

  const EXP_TO_LEVEL  = { "Junior": 2, "Mid-level": 3, "Senior": 4, "Expert": 5 };
  const LEVEL_TO_EXP  = { 2: "Junior", 3: "Mid-level", 4: "Senior", 5: "Expert" };

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

  function distributePercentages(skills, total, fallbacks, roundTo, minPct) {
    if (skills.length === 0) return [];
    const units    = total / roundTo;
    const minUnits = minPct / roundTo;

    const weights = skills.map((s, i) => {
      const imp = getImportance(s, fallbacks, i);
      return imp * imp;
    });
    const weightSum = weights.reduce((a, b) => a + b, 0);

    let allocated = skills.map(() => minUnits);
    let remaining = units - allocated.reduce((a, b) => a + b, 0);

    if (remaining > 0) {
      const proportional = weights.map(w => (w / weightSum) * remaining);
      const floors       = proportional.map(p => Math.floor(p));
      let leftover       = remaining - floors.reduce((a, b) => a + b, 0);
      allocated          = allocated.map((a, i) => a + floors[i]);
      const sorted       = weights.map((_, i) => i).sort((a, b) => weights[b] - weights[a]);
      for (const i of sorted) {
        if (leftover <= 0) break;
        allocated[i]++;
        leftover--;
      }
    } else {
      const diff = units - allocated.reduce((a, b) => a + b, 0);
      if (diff !== 0) allocated[weights.indexOf(Math.max(...weights))] += diff;
    }

    return allocated.map(u => u * roundTo);
  }

  function ensureUniquePcts(pcts, skills, fallbacks, roundTo, minPct) {
    const imps  = skills.map((s, i) => getImportance(s, fallbacks, i));
    const order = imps.map((_, i) => i).sort((a, b) => imps[b] - imps[a]);
    for (let i = 0; i < order.length - 1; i++) {
      for (let j = i + 1; j < order.length; j++) {
        const hi = order[i], lo = order[j];
        if (imps[hi] !== imps[lo] && pcts[hi] === pcts[lo] && pcts[lo] - roundTo >= minPct) {
          pcts[hi] += roundTo;
          pcts[lo] -= roundTo;
        }
      }
    }
    return pcts;
  }

  // ── Collect skills ────────────────────────────────────────────────────────
  const rawRequired = Array.isArray(result.skillAnalysis.requiredSkills)
    ? [...result.skillAnalysis.requiredSkills]
        .sort((a, b) => (b.importance || 0) - (a.importance || 0))
        .slice(0, 3)
    : [];

  const validSoft = Array.isArray(result.skillAnalysis.softSkills)
    ? result.skillAnalysis.softSkills.filter(s => s && typeof s.name === "string" && s.name.trim())
    : [];

  const rawSoft = validSoft.length > 0
    ? validSoft.slice(0, 2)
    : [{ name: "Communication", level: null, importance: 5 }];

  // ── Distribute within each group (80 hard / 20 soft — fixed) ────────────
  const requiredPcts = ensureUniquePcts(
    distributePercentages(rawRequired, REQUIRED_TOTAL, FALLBACK_IMPORTANCE.required, 5, 15),
    rawRequired, FALLBACK_IMPORTANCE.required, 5, 15
  );
  const softPcts = distributePercentages(rawSoft, SOFT_TOTAL, FALLBACK_IMPORTANCE.soft, 10, 10);

  const requiredSkills = rawRequired.map((skill, i) => ({
    name:       skill.name,
    category:   skill.category,
    level:      resolveLevel(skill.level),
    percentage: requiredPcts[i],
  }));

  // ── Derive effective experienceLevel from max skill level ─────────────────
  // The LLM defaults experienceLevel to "Junior" when no overall role years are stated,
  // even if individual skills have explicit years (e.g. "8 years Next.js"). We correct
  // this by taking the max of the LLM's value and the highest resolved skill level.
  if (!isInternship && result.jobDetails) {
    const llmExpNumeric  = EXP_TO_LEVEL[result.jobDetails.experienceLevel] ?? 2;
    const maxSkillLevel  = requiredSkills.reduce((max, s) => Math.max(max, s.level), 2);
    // Skill levels are the more reliable signal — allow the LLM's overall role
    // assessment to exceed them by at most one tier (e.g. leadership scope not
    // tied to a specific skill), but never let it run away unbounded (e.g.
    // "Expert" role with only Junior-level skills).
    const effectiveLevel = Math.min(Math.max(llmExpNumeric, maxSkillLevel), maxSkillLevel + 1);
    result.jobDetails.experienceLevel = LEVEL_TO_EXP[effectiveLevel] ?? result.jobDetails.experienceLevel;
  }

  const roleLevel = isInternship ? 2 : (EXP_TO_LEVEL[result.jobDetails?.experienceLevel] ?? 2);

  const softSkills = rawSoft.map((skill, i) => ({
    name:       skill.name,
    level:      roleLevel,
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
