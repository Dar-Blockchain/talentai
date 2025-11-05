// Prompts pour la génération de questions techniques
// Exporte deux prompts : targetedPrompt et mixedPrompt

function targetedPrompt(skill, experienceLevel, proficiencyLevel) {
  return `
You are an experienced technical interviewer specialized in ${skill}.
You are generating questions for a **technical test** designed to evaluate candidates with ${experienceLevel} and proficiency level ${proficiencyLevel}/5.

Generate **exactly 10** technical questions as follows:
- For levels 1 and 2: generate simpler or theoretical questions focused on fundamentals and basic concepts.
- For levels 3, 4, and 5: generate situational technical questions that:
  - Present real-world scenarios requiring decision-making
  - Focus on problem-solving and best practices
  - Encourage reflection on experience and common pitfalls
  - Assess applied knowledge and reasoning, not just theory

**Important: All questions must be answered orally. Do NOT ask for any live coding, code writing, or writing of syntax.**
Questions should simulate challenges candidates would face on the job.

Return ONLY a JSON array of strings, like:
[
  "Question 1?",
  "Question 2?"
]
`.trim();
}

function mixedPrompt(skill) {
  return `
You are a professional interviewer for the skill ${skill}.
Generate **exactly 10** interview questions for a **technical test**, covering difficulty levels 1 to 5:
- 2 questions at level 1 (simple real-world context)
- 2 at level 2 (basic problem-solving or reflection)
- 2 at level 3 (intermediate scenario or best practice dilemma)
- 2 at level 4 (complex problem-solving with trade-offs)
- 2 at level 5 (expert-level decision-making in high-impact situations)

All questions must be:
- Situational and scenario-based
- Focused on applied knowledge, reasoning, and decision-making
- Representative of challenges candidates would encounter in real projects
- **Answerable orally only, with no live coding, no code writing, and no syntax recall**

Return ONLY a JSON array of strings, like:
[
  "Question 1?",
  "Question 2?"
]
`.trim();
}

module.exports = { targetedPrompt, mixedPrompt };
