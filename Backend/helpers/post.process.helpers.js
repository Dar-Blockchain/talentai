/**
 * Post-process model response to enforce absolute rules
 * that the model consistently ignores despite prompt instructions.
 *
 * Rules enforced here:
 * 1. Salary → 0/0 if not explicitly mentioned in raw description
 * 2. employmentType → "Internship" if internship keywords detected
 * 3. employmentType → "Full-time" if nothing explicit mentioned
 * 4. Skill percentages → proportional to years, capped at 55%
 * 5. Internship → all skill levels forced to 1
 */
const postProcessJobDetails = (modelResponse, rawDescription) => {
  const desc = rawDescription.toLowerCase();
  const details = modelResponse.jobDetails || modelResponse;
  const title = (details.title || "").toLowerCase();

  // ─── RULE 1 — INTERNSHIP DETECTION ────────────────────────────────────────
  const internshipKeywords = ["stage", "intern", "internship", "stagiaire"];
  const isInternship = internshipKeywords.some(
    (k) => desc.includes(k) || title.includes(k)
  );

  if (isInternship) {
    details.employmentType = "Internship";
    details.experienceLevel = "Entry-level";
  } else {
    // ─── RULE 2 — EMPLOYMENT TYPE DEFAULT ───────────────────────────────────
    const hasExplicitType =
      /full[\s-]?time|part[\s-]?time|contract|freelance/i.test(rawDescription);
    if (!hasExplicitType) {
      details.employmentType = "Full-time";
    }
  }

  // ─── RULE 3 — SALARY OVERRIDE ─────────────────────────────────────────────
  const hasSalary =
    /\d+[\s,.]?\d*\s*(USD|EUR|TND|DT|dollar|euro)/i.test(rawDescription);
  if (!hasSalary) {
    details.salary = { min: 0, max: 0, currency: "USD" };
  }

  // ─── RULE 4 — SKILL PERCENTAGE PROPORTIONAL TO YEARS + CAP 55% ───────────
  const skills =
    modelResponse.skillAnalysis?.requiredSkills ||
    modelResponse.requiredSkills ||
    [];
  const softSkills =
    modelResponse.skillAnalysis?.softSkills ||
    modelResponse.softSkills ||
    [];

  const softBudget = softSkills.reduce((a, s) => a + (s.percentage || 20), 0);
  const skillBudget = 100 - softBudget;
  const CAP = 55;

  const extractYears = (skillName) => {
    const patterns = [
      new RegExp(`(\\d+)\\s*\\+?\\s*years?[^.]*?${skillName}`, "i"),
      new RegExp(`${skillName}[^.]*?(\\d+)\\s*\\+?\\s*years?`, "i"),
    ];
    for (const p of patterns) {
      const m = rawDescription.match(p);
      if (m) return parseFloat(m[1]);
    }
    return 0.5;
  };

  if (skills.length > 0) {
    const yearsMap = {};
    skills.forEach((s) => {
      yearsMap[s.name] = extractYears(s.name);
    });

    const totalYears = Object.values(yearsMap).reduce((a, b) => a + b, 0);

    // Compute raw percentages
    skills.forEach((s) => {
      s.percentage = Math.round((yearsMap[s.name] / totalYears) * skillBudget);
    });

    // Apply cap
    skills.forEach((s) => {
      if (s.percentage > CAP) s.percentage = CAP;
    });

    // Fix rounding drift → total must equal 100
    const currentTotal =
      skills.reduce((a, s) => a + s.percentage, 0) + softBudget;
    const drift = 100 - currentTotal;
    if (drift !== 0) {
      // Apply drift to the smallest non-capped skill
      const sorted = [...skills].sort((a, b) => a.percentage - b.percentage);
      sorted[0].percentage += drift;
    }
  }

  // ─── RULE 5 — INTERNSHIP: ALL SKILL LEVELS = 1 ───────────────────────────
  if (isInternship) {
    skills.forEach((s) => {
      s.level = 1;
    });
    softSkills.forEach((s) => {
      s.level = 1;
    });
  }

  return modelResponse;
};

module.exports = { postProcessJobDetails };