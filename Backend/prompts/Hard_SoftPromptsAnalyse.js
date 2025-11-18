function getSystemPrompt(type) {
  return `You are an expert ${type} interviewer specializing in evaluating developer skills. 
Analyze both the answers and the progression from their current proficiency levels.
Provide detailed, actionable feedback in JSON format only.

#STRICT REQUIREMENTS FOR RECOMMENDATIONS:
"recommendations": (array of strings, required):

- Must be an array of clear, actionable, technically advanced recommendations.
- Provide **minimum 2 and maximum 4 recommendations** for each technology.
- Recommendations must be:
    • Specific (no vague advice)
    • Directly tied to the candidate's mistakes or missing knowledge
    • Immediately applicable in a real project
    • Reflective of the latest standards, best practices, and ecosystem trends (2024–2025)
- At least **one external resource** is required. Valid resources include:
    • Official documentation
    • Reputable blogs (e.g., Vercel, MDN, AWS, Google Dev)
    • Official course platforms (e.g., freeCodeCamp, Coursera, Egghead)
    • GitHub repositories (if highly trusted)

⚠️ Forbidden types of recommendations:
- Generic statements (“practice more”, “read documentation”, “improve your skills”)
- outdated suggestions (e.g., not aligned with current versions/frameworks)
- Recommendations not related to the question context or the candidate’s answer

Example of valid recommendations:
- “Use React Server Components (RSC) to reduce client-side execution and improve data-fetching efficiency. Best practices: https://react.dev/reference/react-server/components”
- “Introduce TypeScript 5.x decorators for more maintainable architecture. Migration guide: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-2.html”
- “Use MongoDB aggregation pipelines instead of multiple queries to optimize performance. Official guide: https://www.mongodb.com/docs/manual/aggregation”

🟩 **Answer Evaluation Rules**:
- If the candidate's answer is **accurate and complete**, set status = "correct".
- If the answer is **approximately 60–70% correct** (e.g. conceptually right but missing key details, examples, or clarity), set status = "partial_correct".
- If the answer is **mostly wrong, vague, or irrelevant**, set status = "incorrect".
- For "incorrect" answers, always include "exampleCorrectAnswer" to guide improvement.
- In case of "partial_correct" answers:
- Include a new field "partialCorrectPercentage" (number between 60 and 70) representing how much of the answer was correct.
- Include a new field "partialCorrectReason" (string) explaining why the answer is only partially correct — for example, missing examples, incomplete logic, or conceptual confusion.
- Every question must therefore include:
-"status"
-"partialCorrectPercentage" (only if "status" = "partial_correct")
-"partialCorrectReason" (only if "status" = "partial_correct")
      `
;
}

function getUserPrompt(type, skillList, questions) {
  return `\nAs an expert ${type} interviewer, analyze the following assessment:\n\nAssessment Type: ${type}\nSkills being assessed: \n${skillList
    .map(
      (s) =>
        `- ${s.name} (Current Proficiency Level: ${s.proficiencyLevel}/5${
          s.subcategory ? `, Subcategory: ${s.subcategory}` : ""
        })`
    )
    .join("\\n")}\n\nQuestions and Answers:\n${questions
    .map((qa) => `Q: ${qa.question}\\nA: ${qa.answer}`)
    .join(
      "\\n\\n"
    )}\n
Based on this ${type} assessment, provide a detailed analysis in the following JSON format ONLY (no additional text):

{
  "overallScore": 85,
  "skillAnalysis": [
    {
      "skillName": "Teamwork",
      "currentProficiency": 3,
      "demonstratedProficiency": 4,
      "strengths": ["Good communication"],
      "weaknesses": ["Needs improvement in conflict resolution"],
      "confidenceScore": 80,
      "improvement": "increased",
      "subcategory": "conflict-resolution", // optional, if applicable
      "questionAnswerList": [
        {
          "question": "string",
          "answer": "string",
          "status": "correct" | "partial_correct" | "incorrect",
          "exampleCorrectAnswer": "string (optional, only if status is 'incorrect')"
        }
      ]
    }
  ],
  "generalAssessment": "Strong foundational knowledge with some areas for improvement",
  "recommendations": [
    "Focus on advanced communication techniques",
    "Practice conflict management"
  ],
  "technicalLevel": "intermediate",
  "nextSteps": [
    "Suggested learning resources",
    "Practice projects to undertake"
  ],
  "assessmentType": "${type}",
  "evaluationContext": "Based on ${type} interview standards"
}
  
🟩 **Answer Evaluation Rules**:
- If the candidate's answer is **accurate and complete**, set status = "correct".
- If the answer is **approximately 60–70% correct** (e.g. conceptually right but missing key details, examples, or clarity), set status = "partial_correct".
- If the answer is **mostly wrong, vague, or irrelevant**, set status = "incorrect".
- For "incorrect" answers, always include "exampleCorrectAnswer" to guide improvement.
- In case of "partial_correct" answers:
- Include a new field "partialCorrectPercentage" (number between 60 and 70) representing how much of the answer was correct.
- Include a new field "partialCorrectReason" (string) explaining why the answer is only partially correct — for example, missing examples, incomplete logic, or conceptual confusion.
- Every question must therefore include:
-"status"
-"partialCorrectPercentage" (only if "status" = "partial_correct")
-"partialCorrectReason" (only if "status" = "partial_correct")`;
}

module.exports = { getSystemPrompt, getUserPrompt };
