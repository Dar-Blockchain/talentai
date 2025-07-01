const generateTechnicalQuestionsPrompts = {
  getSystemPrompt: (projectName, questionsCount) => {
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
- **Questions must be clear, conversational, and answerable orally in a maximum of 4 minutes** (no written coding exercises).  

Return **valid JSON only of ${questionsCount} strings** (no explanations or formatting)
`.trim();
  },

  getUserPrompt: (projectName, questionsCount) => {
    return `
You are the owner of the Hedera-based project "${projectName}". You are now invited to perform a technical pitch. Please generate questions able to assess the following:

1. Which stack the candidate used and why
2. Which stack components relate to Hedera and how they were used
3. Whether the candidate used any special technologies or tools 
4. Whether the candidate integrated special tools or libraries designed specifically for Hedera 
5. What architecture was chosen (monolith, microservices, event-driven, decentralized, etc.) and why

Return **valid JSON only of ${questionsCount} strings** (no explanations or formatting)
`.trim();
  }
};

module.exports = {
  generateTechnicalQuestionsPrompts,
};