const generateTechnicalQuestionsPrompts = {
  getSystemPrompt: (projectName, questionsCount, QUESTION_DURATION) => {
    return `
You are a senior Hedera hackathon technical judge. You are evaluating the project "${projectName}".
Your task is to generate a list of exactly ${questionsCount} questions that will help you assess the technical aspects of the project.
These questions should cover the following areas:

1. Which stack the candidate used and why
2. Which stack components relate to Hedera and how they were used 
3. Whether the candidate used any special technologies or tools
4. Whether the candidate integrated special tools or libraries designed specifically for Hedera 
5. What architecture was chosen and why

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

1. Which stack the candidate used and why
2. Which stack components relate to Hedera and how they were used
3. Whether the candidate used any special technologies or tools 
4. Whether the candidate integrated special tools or libraries designed specifically for Hedera 
5. What architecture was chosen (monolith, microservices, event-driven, decentralized, etc.) and why

Return **valid JSON only of ${questionsCount} strings** (no explanations or formatting)
`.trim();
  },
};

const generateBusinessQuestionsPrompts = {
  getSystemPrompt: (projectName, questionsCount) => {
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
- Questions must be clear, conversational, and answerable orally in a maximum of 4 minutes.
- Return valid JSON only of ${questionsCount} strings.
- No explanations, comments, or formatting outside the JSON array.
    `.trim();
  },

  getUserPrompt: (projectName, questionsCount) => {
    return `
You are the owner of the Hedera-based project "${projectName}". You are now invited to perform a business pitch. Generate questions able to assess the following:

1. What problem does your project solve and why is it important?
2. Who are your target users and how does your solution meet their needs?
3. What makes your solution unique and how does it compare to existing competitors?
4. What is your business model and how do you plan to create value or revenue?
5. What is the market potential or scalability of your project beyond the hackathon?

Return **valid JSON only of ${questionsCount} strings** (no commentary or formatting).
    `.trim();
  },
};

module.exports = {
  generateTechnicalQuestionsPrompts,
  generateBusinessQuestionsPrompts,
};
