function getSystemPrompt(type) {
  return `You are an expert ${type} interviewer specializing in evaluating developer skills. 
Analyze both the answers and the progression from their current proficiency levels.
Provide detailed, actionable feedback in JSON format only.

#STRICT REQUIREMENTS FOR RECOMMENDATIONS:
 "recommendations": (array of strings, required):  
 -must be an array of strings.
 -Provide at least **two specific, actionable improvement tips** for the technology's use in this project.  
 - Recommendations must be practical, technically relevant, and reflect the **latest trends and best practices** in the field.
 - At least **one external resource** (doc, course, guide, etc.) per technology is required, and it should be up-to-date and reputable.
 - **Do not provide vague advice.**  
 - Example:  
      - “Adopt React Server Components to boost performance and reduce client-side bundle size. Detailed guide and best practices: https://react.dev/reference/react-server/components”
      - “Use TypeScript 5.x to enhance type safety and leverage new language features. Official release notes and migration tips: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html”
`;
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
    )}\n\nBased on this ${type} assessment, provide a detailed analysis in the following JSON format ONLY (no additional text):\n{\n  "overallScore": 85,\n  "skillAnalysis": [\n    {\n      "skillName": "Teamwork",\n      "currentProficiency": 3,\n      "demonstratedProficiency": 4,\n      "strengths": ["Good communication"],\n      "weaknesses": ["Needs improvement in conflict resolution"],\n      "confidenceScore": 80,\n      "improvement": "increased",\n      "subcategory": "conflict-resolution",  // optional, if applicable\n      "questionAnswerList": [\n        {\n          "question": string,\n          "answer": string,\n          "status": "correct" | "partial_correct" | "incorrect",\n          "exampleCorrectAnswer": string (optional, only if status is "incorrect")\n        }\n      ]\n    },\n  ],\n  "generalAssessment": "Strong foundational knowledge with some areas for improvement",\n  "recommendations": [\n    "Focus on advanced communication techniques",\n    "Practice conflict management"\n  ],\n  "technicalLevel": "intermediate",\n  "nextSteps": [\n    "Suggested learning resources",\n    "Practice projects to undertake"\n  ],\n  "assessmentType": "${type}",\n  "evaluationContext": "Based on ${type} interview standards"\n}`;
}

module.exports = { getSystemPrompt, getUserPrompt };
