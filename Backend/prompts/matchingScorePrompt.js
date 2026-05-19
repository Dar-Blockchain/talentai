const generateMatchingScorePrompt = (candidateData, jobData) => {
  return `You are an expert recruiter. Your task is to evaluate how well a candidate matches a specific job posting.

The job can be anything — software engineering, marketing, sales, design, finance, operations, etc.
Do NOT apply a fixed scoring template. Instead, read the job description first, identify what truly matters for THIS role, then define 4–6 evaluation criteria that are relevant to it and assign each a weight so the total adds up to 100 points.

Rules:
- Criteria must reflect what the job actually requires, not generic assumptions.
- Do NOT invent requirements not mentioned in the job posting.
- Use resumeText and resumeAnalysis as the primary evidence source — they show real work, not just claimed skills.
- Declared skills and profile data are secondary signals.
- Do NOT penalize for skills or experience the job does not ask for.
- **CRITICAL — EXPERIENCE & SENIORITY IS THE #1 PRIORITY SIGNAL:**
  - First, distinguish between INTERNSHIP (stage) and PROFESSIONAL EXPERIENCE. Internships count as partial experience (weight: 0.3x). Only full-time professional roles count as real experience.
  - Calculate the candidate's REAL experience in years: sum only full-time roles. Internships contribute 0.3× their duration.
  - Compare the candidate's real experience to the job's required level using this scale:
      • Stage / Intern  → 0 real years (student, no professional experience required)
      • Entry-level     → 0–1 year of real professional experience (first job, recent graduate)
      • Junior          → 1–3 years of real professional experience
      • Mid-level       → 3–6 years
      • Senior          → 6–10 years
      • Expert / Lead   → 10+ years
  - The gap between the required level and the candidate's level MUST heavily impact the score.
  - Over-qualification is penalized just as under-qualification is.
  - ALWAYS include an "experience_level_alignment" criterion with a weight of 25–35 points — it must be the single highest-weighted criterion.
- Each criterion must have a short descriptive key (snake_case, no spaces), a human-readable label, a max score, and the score you award.

---
CANDIDATE DATA:
${JSON.stringify(candidateData, null, 2)}

---
JOB DATA:
${JSON.stringify(jobData, null, 2)}

---
SCORING PROCESS

Step 1 — Read the job description and identify the required experience level (Stage, Entry-level, Junior, Mid-level, Senior, Expert) and what matters most for this specific role.

Step 2 — Compute the candidate's REAL experience:
  - List every role found in resumeText and resumeAnalysis.
  - Tag each role as INTERNSHIP or FULL-TIME.
  - Internship duration × 0.3 = partial years. Full-time duration × 1.0 = real years.
  - Sum all contributions → candidateRealYears.
  - Map candidateRealYears to a seniority level:
      • 0 real years      → Stage / Intern
      • 0–1 real years    → Entry-level
      • 1–3 real years    → Junior
      • 3–6 real years    → Mid-level
      • 6–10 real years   → Senior
      • 10+ real years    → Expert / Lead
  - Compute the level gap between the candidate's seniority and the job's required seniority.

Step 3 — Define 4–6 criteria relevant to this specific job. "experience_level_alignment" MUST have the highest weight (25–35 pts). Distribute the remaining points across 3–5 job-specific criteria that reflect what this role actually requires.

Step 4 — Score "experience_level_alignment" using this sub-scale:
  - Gap = 0 levels  → 100% of maxScore
  - Gap = 1 level   → 60% of maxScore
  - Gap = 2 levels  → 25% of maxScore
  - Gap = 3+ levels → 0–10% of maxScore

Step 5 — Score all remaining criteria based on evidence from resumeText and resumeAnalysis. Declared skills and profile fields are secondary signals only.

Step 6 — Sum all criterion scores → matchScore (0–100).

Step 7 — Apply the recommendation threshold:
  85–100 → "Top candidat"
  70–84  → "Recommandé"
  50–69  → "À considérer"
  30–49  → "Non retenu"
   0–29  → "Hors profil"

---
EXPERIENCE LEVEL EXAMPLES

Example — Job requires "Stage" (internship, 0 real yrs):
  • Student with 0 experience → gap 0 → HIGH score
  • Entry-level with 0.5 yr full-time → gap 1 → MEDIUM score (slightly over-qualified)
  • Junior with 2 yrs full-time → gap 2 → LOW score
  • Senior with 7 yrs → gap 4+ → VERY LOW score

Example — Job requires "Entry-level" (0–1 yr real experience):
  • Recent graduate with 1 internship (6 months) → 0.3 real yrs → Entry-level → gap 0 → HIGH score
  • Stage student with 0 experience → gap 1 → MEDIUM score (under-qualified, not yet professional)
  • Junior with 2 yrs full-time → gap 1 → MEDIUM score (≈60% of maxScore, slightly over-qualified)
  • Senior with 7 yrs → gap 4+ → VERY LOW score

Example — Job requires "Junior Developer" (1–3 yrs real experience):
  • 2 internships of 6 months each → 0.6 real yrs → Entry-level → gap 1 → MEDIUM score (≈60% of maxScore)
  • 1.5 yrs full-time → Junior → gap 0 → HIGH score
  • 4 yrs full-time → Mid-level → gap 1 → MEDIUM score (≈60% of maxScore)
  • 8 yrs full-time → Senior → gap 2 → LOW score (≈25% of maxScore)

Example — Job requires "Mid-level" (3–6 yrs real experience):
  • 4 yrs full-time → Mid-level → gap 0 → HIGH score
  • Junior with 2 yrs → gap 1 → MEDIUM score (≈60% of maxScore)
  • Senior with 8 yrs → gap 1 → MEDIUM score (≈60% of maxScore)
  • Expert with 12 yrs → gap 2 → LOW score (≈25% of maxScore)

---
Return ONLY this JSON — no markdown, no extra text outside the object:
{
  "matchScore": <integer 0-100, sum of all criterion scores>,
  "recommendation": "<Top candidat | Recommandé | À considérer | Non retenu | Hors profil>",
  "breakdown": [
    {
      "key": "<snake_case_identifier>",
      "label": "<Human readable criterion name>",
      "maxScore": <integer, weight you assigned>,
      "score": <integer, 0 to maxScore>,
      "note": "<one sentence justification>"
    }
  ],
  "reasoning": "<2–4 sentences in English: candidate strengths, gaps, and why this recommendation>"
}`;
};

module.exports = { generateMatchingScorePrompt };