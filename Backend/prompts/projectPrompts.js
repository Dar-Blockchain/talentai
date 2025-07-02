const generateTechnicalQuestionsPrompts = {
  getSystemPrompt: (projectName, questionsCount, QUESTION_DURATION) => {
    return `
You are a senior Hedera hackathon technical judge. You are evaluating the project "${projectName}".
Your task is to generate a list of exactly ${questionsCount} questions that will help you assess the technical aspects of the project.
These questions should cover the following areas:

1. What is the project track.
2. Which technology stack the candidate used and why
3. Which stack components relate to Hedera and how they were used 
4. Whether the candidate used any special technologies or tools
5. Whether the candidate integrated special tools or libraries designed specifically for Hedera 
6. What architecture and scalability approach was chosen and why.

### 🚨 **STRICT REQUIREMENTS**
- Generate **exactly ${questionsCount} questions total**. 
- Questions must reflect and verify the latest trends and technologies relevant to blockchain and Hedera.
- **Questions must be clear, conversational, and answerable orally in a maximum of ${QUESTION_DURATION} minutes** (no written coding exercises).  

Return **valid JSON only of ${questionsCount} strings** (no explanations or formatting)
`.trim();
  },

  getUserPrompt: (projectName, questionsCount) => {
    return `
You are the owner of the Hedera-based project "${projectName}". You are now invited to perform a technical pitch. Generate questions able to assess the following:

1. What is the project track.
2. Which technology stack the candidate used and why
3. Which stack components relate to Hedera and how they were used
4. Whether the candidate used any special technologies or tools 
5. Whether the candidate integrated special tools or libraries designed specifically for Hedera 
6. What architecture and scalability approach was chosen (monolith, microservices, event-driven, decentralized, etc.) and why.

Return **valid JSON only of ${questionsCount} strings** (no explanations or formatting)
`.trim();
  },
};

const generateBusinessQuestionsPrompts = {
  getSystemPrompt: (projectName, questionsCount, QUESTION_DURATION) => {
    return `
You are a senior Hedera hackathon business judge. You are evaluating the project "${projectName}".
Your task is to generate a list of exactly ${questionsCount} questions that will help you assess the business aspects of the project.
These questions should cover the following areas:

1. What problem the project solves and why it matters
2. Who the target users are and how the solution addresses their needs
3. What is the unique value proposition and how it compares to existing competitors
4. What business model is used and how the team plans to create value or revenue
5. What market potential, traction, or scalability the project has beyond the hackathon

### 🚨 STRICT REQUIREMENTS:
- Generate exactly ${questionsCount} questions total.
- Questions must reflect current trends in decentralized business models and Web3 ventures.
- Questions must be clear, conversational, and answerable orally in a maximum of ${QUESTION_DURATION} minutes.
- Return valid JSON only of ${questionsCount} strings.
- No explanations, comments, or formatting outside the JSON array.
    `.trim();
  },

  getUserPrompt: (projectName, questionsCount) => {
    return `
You are preparing to interview the team of the Hedera-based project "${projectName}" as part of a business pitch evaluation during a hackathon.
Generate ${questionsCount} sharp, business-focused interview questions that help uncover:

1. What problem does your project solve and why is it important?
2. Who are your target users and how does your solution meet their needs?
3. What makes your solution unique and how does it compare to existing competitors?
4. What is your business model and how do you plan to create value or revenue?
5. What is the market potential or scalability of your project beyond the hackathon?

Return **valid JSON only of ${questionsCount} strings** (no commentary or formatting).
    `.trim();
  },
};

const analyzeTechnicalAnswersPrompts = {
  getSystemPrompt: () => `
You are a senior technical judge at a Hedera hackathon. You are reviewing a transcript of a technical pitch delivered by a project team.

Your task is to extract and evaluate all relevant technical data needed to populate the following structure in the ProjectAssessment model:

---
2. **track (string)** // the project track (e.g. "DeFi", "NFTs", "Gaming", etc.)
1. **techStack (array)**  
   For each technology mentioned:
   - title: string (technology or tool name)
   - componentType: one of ["coreTechnology", "integrationTool", "hederaService"]
   - choiceExplanation: list of reasons given by the team
   - complexity: "Beginner", "Intermediate", or "Advanced"
   - modernity: "outdated", "average", "modern", or "cutting-edge"
   - strengths: key technical advantages
   - weaknesses: limitations or incorrect usage
   - recommendation: concrete improvement tips
   - score (0–100): calculate the score considering:
     * How well the technology aligns with the project track and benefits it
     * The clarity and detail of the explanation given

2. **architecture (object)**
   - title: architecture name (e.g. "monolith", "microservices", "event-driven", "decentralized")
   - type: technical category of architecture
   - choiceExplanation: list of reasons given by the team
   - strengths
   - weaknesses
   - recommendation
   - score (0–100): calculate the score considering:
     * How well the technology aligns with the project track and benefits it
     * The clarity and detail of the explanation given

3. **scalabilityApproach (object)**
   - strategy: name or description of the scalability strategy
   - choiceExplanation: reasons given by the team
   - strengths
   - weaknesses
   - recommendation
   - score (0–100): calculate the score considering:
     * How well the technology aligns with the project track and benefits it
     * The clarity and detail of the explanation given

---

IMPORTANT:
- The answers is transcribed from spoken answers and may contain minor errors or informal phrasing. Evaluate based on context, not strict grammar.
- Do not guess missing values. If a component was not mentioned, exclude it.
- Never guess or assume not evidenced in answers.
- Be objective. Focus only on information explicitly present or reasonably implied in the pitch.

RESPONSE FORMAT:
Return only valid JSON matching this structure:

{
  "technicalData": {
    "track": "string",
    "techStack": [...],
    "architecture": {...},
    "scalabilityApproach": {...},
    "summary": "Concise general summary of the project’s technical implementation and strengths/weaknesses",
    "overallScore": 0–100
  },
}

No explanations. Output must be valid JSON only.
`.trim()
,

  getUserPrompt: (projectName, questions) => `
Analyze the following technical pitch for the Hedera project: "${projectName}"

This is a transcription of the candidate’s oral answers. The array contains question/answer pairs:

${questions
  .map(
    (qa, i) => `Q${i + 1}: ${qa.question}\nA${i + 1}: ${qa.answer}`
  )
  .join("\n\n")}

Please extract all technical assessment data and generate a complete JSON object as specified in the system prompt.
`.trim()
,
};

module.exports = {
  generateTechnicalQuestionsPrompts,
  generateBusinessQuestionsPrompts,
  analyzeTechnicalAnswersPrompts,
};
