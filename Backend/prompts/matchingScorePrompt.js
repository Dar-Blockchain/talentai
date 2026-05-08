/**
 * Prompt template for job-candidate matching score calculation
 * Uses Bedrock AI to intelligently evaluate candidate fit for a position
 * 
 * @param {Object} candidateData - Structured candidate profile information
 * @param {Object} jobData - Structured job posting information
 * @returns {string} - Formatted AI prompt for matching evaluation
 */
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
- Each criterion must have a short descriptive key (snake_case, no spaces), a human-readable label, a max score, and the score you award.

---
CANDIDATE DATA:
${JSON.stringify(candidateData, null, 2)}

---
JOB DATA:
${JSON.stringify(jobData, null, 2)}

---
SCORING PROCESS

Step 1 — Read the job description and identify what matters most for this specific role.
Step 2 — Define 4–6 criteria relevant to this job. Distribute 100 points across them by importance.
Step 3 — Score the candidate on each criterion based on evidence.
Step 4 — Sum all scores → matchScore (0–100).
Step 5 — Apply the recommendation threshold:
  85–100 → "Top candidat"
  70–84  → "Recommandé"
  50–69  → "À considérer"
  30–49  → "Non retenu"
   0–29  → "Hors profil"

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
  "reasoning": "<2–4 sentences: candidate strengths, gaps, and why this recommendation>"
}`;
};

module.exports = { generateMatchingScorePrompt };
