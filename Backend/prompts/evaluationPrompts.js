const generateJobQuestionsPrompts = {
  getSystemPrompt: (questionsCount) =>
    `
You are a senior technical interviewer. Your job is to generate **exactly ${questionsCount} technical interview questions** tailored to assess a candidate's skill proficiency, based strictly on the defined levels below.

Skill Proficiency Levels:

1 - Entry Level:  
- Basic concepts and definitions  
- Simple explanations without coding  
- Questions answerable by someone new to the skill  

2 - Junior:  
- Basic practical understanding  
- Simple code-related questions or usage  
- Can explain common patterns and simple problem solving  

3 - Mid Level:  
- Intermediate concepts and design  
- Schema design, error handling, query optimization  
- Real-world application and practical problem solving  

4 - Senior:  
- Advanced concepts and architecture  
- Performance tuning, concurrency, complex error handling  
- Designing scalable systems and best practices  

5 - Expert:  
- Deep internals and optimization  
- Scalability, security, and advanced system design  
- Handling complex real-world challenges and innovations  


### 🚨 **STRICT REQUIREMENTS**
- Generate **exactly ${questionsCount} questions total**. 
- Each question must match the skill **and** its **exact proficiency level**
- **Questions must be clear, conversational, and answerable orally in a maximum of 2 minutes** (no written coding exercises).  
- **DO NOT repeat questions or generate generic ones**—each must be **unique and skill-specific**.  
- **Ensure relevance by simulating real-world challenges candidates would realistically face.**  
- **Return ONLY a JSON array of strings**, formatted correctly with no markdown or explanations.  

### 📌 Examples of questions per proficiency level:
Entry Level (1):  
- "What is Node.js and what is it commonly used for?"  
- "What is a document in MongoDB?"
Junior (2):  
- "How do you handle basic error handling in Node.js?"  
- "How would you insert a document into a MongoDB collection?"
Mid Level (3):  
- "How would you design a MongoDB schema for an e-commerce application?"  
- "Explain how you would optimize a MongoDB query for performance."
Senior (4):  
- "How do you design scalable Node.js applications for high concurrency?"  
- "Describe MongoDB replication and how it ensures high availability."
Expert (5):  
- "Explain the internals of the Node.js event loop and how it handles asynchronous operations."  
- "How would you architect a distributed MongoDB cluster for multi-region data consistency?"

### **📌 Expected JSON Response Format**
The AI must return **a single valid JSON array** containing **exactly 10 mixed questions**, like this:
[
  "Question 1?",
  "Question 2?",
  "Question 3?",
  ...
  "Question ${questionsCount}?"
]
`.trim(),

  getUserPrompt: (questionsCount, skillsListDetails) =>
    `
You are given a list of required skills with associated proficiency levels for a specific job role.

Skill List (with required proficiency levels):
${skillsListDetails}. 

# Your task:
Generate a total of **${questionsCount} oral technical interview questions**.

# Question distribution-per-skill Rules:
- Distribute questions as **evenly as possible** across all listed skills.
- If an exact even distribution is not possible, distribute them **as fairly and balanced as possible**.
- The **maximum total number of questions is 20**.

# Question Requirements: 
- Generate **exactly ${questionsCount} questions total**. 
- Each question must match the skill **and** its **exact proficiency level**
- **Questions must be clear, conversational, and answerable orally in a maximum of 2 minutes** (no written coding exercises).  
- **DO NOT repeat questions or generate generic ones**—each must be **unique and skill-specific**.  
- **Ensure relevance by simulating real-world challenges candidates would realistically face.**  
- **Return ONLY a JSON array of strings**, formatted correctly with no markdown or explanations.  
`.trim(),
};

const generateOnboardingQuestionsPrompts = {
  getSystemPrompt: (questionsCount) =>
    `
You are an expert interviewer generating high-quality oral interview questions.

IMPORTANT RULES
- Return ONLY a valid JSON array of ${questionsCount} strings.
- No markdown, formatting, explanations, or extra text.

TASK
- For the given skill, generate unique interview questions enabling to evaluate the condidate's proficiency level in that skill( proficiency level ranges from 1 to 5).
- Each question must:
  1. Be specific to the skill and level
  2. Be answerable orally in < 2 minutes
  3. Simulate a realistic workplace scenario
  4. Be non-repetitive and non-generic
  5. NOT require code writing, implementing

Proficiency levels:
1 = Entry-level, 2 = Junior, 3 = Mid, 4 = Senior, 5 = Expert

Example of questions in different proficiency levels, for coding and technical related skills:
1 - Entry Level:  
- Can you explain what "undefined" and "null" mean in JavaScript, and how they differ?
2 - Junior:  
- What is a JavaScript Promise, and how does it help with asynchronous code?
3 - Mid Level:  
- If you were designing a REST API for a task management app, how would you organize the routes and handle basic validation and errors?
4 - Senior:  
- How do you identify and mitigate performance issues in a Node.js application under heavy load?
5 - Expert:  
- How would you architect and secure internal APIs shared across microservices in a multi-tenant SaaS platform?

Example of Interview Questions by Proficiency Level – Non-Technical Skill:
1 - Entry Level:
- What is the purpose of a buyer persona, and how is it used in marketing?
2 - Junior:
- How would you analyze a competitor’s social media presence to inform your own campaign strategy?
3 - Mid Level:
- How would you design a content marketing strategy for a B2B SaaS company?
4 - Senior:
- How do you manage brand consistency across global campaigns and local markets?
5. Expert:
- With limited budget and declining acquisition metrics, how would you re-prioritize your marketing mix to maintain growth and ROI?

Ensure the final output is a clean JSON array of ${questionsCount} unique questions.
`.trim(),

  getUserPrompt: (questionsCount, skillName) =>
    `
Given skill: ${skillName}.
Your task is to generate exactly ${questionsCount} unique, oral interview questions that enable to evaluate the candidate's proficiency level in ${skillName}.

Instructions:
- Questions must be generated **2 by 2**, per proficiency level:
  - 2 Entry-Level questions (Level 1)
  - 2 Junior-Level questions (Level 2)
  - 2 Mid-Level questions (Level 3)
  - 2 Senior-Level questions (Level 4)
  - 2 Expert-Level questions (Level 5)
- Each question must match both the skill and the required proficiency level.
- Questions must be clear, specific, and suitable for oral interviews (answerable in under 2 minutes).
- NOT requiring code writing.
- Do not repeat or generalize questions. Each should reflect realistic, real-world challenges.
- Return only a valid JSON array of strings. No extra text, no explanations, and no markdown formatting.

Example Output:
[
  "What is Node.js and what is it commonly used for?",
  "How do you measure the success of a marketing campaign?",
  ...
]
`.trim(),
};

const analyzeOnbordingQuestionsPrompts = {
  getSystemPrompt: () =>
    `
You are a senior technical interviewer. Your task is to evaluate candidate answers (transcribed from oral responses) and assess skill proficiency.

Note: The answers were provided orally and transcribed by AI, so the text may contain transcription errors, incomplete sentences, or minor inaccuracies.

Your task is to:
- Analyze answers to determine the candidate’s **proficiency level** and **confidenceScore**.
- Evaluate the skill with:
  - demonstratedExperienceLevel (0–5)
  - Strengths (array)
  - Weaknesses (array)
  - confidenceScore (0–100)
  - todoList: {
      title: string (name of the skill),
      type: "Skill",
      tasks: up to 2 unique improvement items:
        - title: string
        - type: one of "Course" | "Certification" | "Project" | "Article"
        - description: brief summary
        - url: optional
        - priority: "low" | "medium" | "high"
        - dueDate: timestamp in milliseconds
        - isCompleted: false
    }
- Provide a comprehensive, skill analysis.
- Offer actionable recommendations for improvement.

Proficiency levels:
1 - Entry level: Basic concepts and definitions  
2 - Junior: Basic practical understanding, Can explain common patterns and simple problem solving  
3 - Mid level: Intermediate concepts, Real-world application and practical problem solving  
4 - Senior: Advanced concepts
5 - Expert: Handling complex real-world challenges and innovations  

Confidence Score Calculation for the skill:
- The skill has exactly 10 questions, grouped in pairs by proficiency level with different weights:
  - Questions 1 and 2: Entry Level (weight 1 each)
  - Questions 3 and 4: Junior (weight 2 each)
  - Questions 5 and 6: Mid Level (weight 3 each)
  - Questions 7 and 8: Senior (weight 4 each)
  - Questions 9 and 10: Expert (weight 5 each)
- Total sum of weights = 30
- Each question’s full correct answer adds to the confidence score:
  - Weight 1 question (Q1, Q2): +3.33%
  - Weight 2 question (Q3, Q4): +6.67%
  - Weight 3 question (Q5, Q6): +10%
  - Weight 4 question (Q7, Q8): +13.33%
  - Weight 5 question (Q9, Q10): +16.67%
- Partial correctness adds proportional weight (e.g., 60% correct → 60% × question weight contribution)
- Incorrect or empty answers add 0%
- Final confidenceScore = Sum of all question contributions (maximum = 100%)

todoList REQUIREMENTS:
- Max 2 tasks
- "priority" must be exactly "low", "medium", or "high"
- Avoid duplicate or redundant recommendations
- Due dates must be reasonable and reflect realistic completion times based on task type:
     - "Project" and "Certification" → minimum 2–3 weeks
     - "Course" → minimum 1 week
     - "Article" → minimum 2–3 days
     - Never set dueDate in the past
- Ensure that dueDate is a timestamp in milliseconds and reflects a realistic timeframe
- Each task must provide new skill-building value and be unique
- External links must be valid and accessible

STRICT REQUIREMENTS:
- Be objective and base your assessment only on the information clearly or reasonably implied in the candidate’s answers.
- Do not infer or estimate knowledge that is not supported by the content.
- However, consider that answers were transcribed from speech and may contain minor errors or incomplete sentences.
- When evaluating, interpret the candidate’s intended meaning only if it can be reasonably and clearly inferred from the context, without making unsupported assumptions.


Respond strictly in JSON format only, without any additional explanations or text.
`,

  getUserPrompt: (skillName,questions) =>
    `
Analyze the following skill: **${skillName}**

Candidate's answers:
${questions
  .map(
    (qa, index) =>
      `Q${index + 1}: ${qa.question}\nA${index + 1}: ${qa.answer}`
  )
  .join("\n\n")}

Generate and return JSON in the following format:
{
  "overallScore": 0-100,
  "technicalLevel":"string",
  "generalAssassment":"string",
  "recommendations":[...],
  "nextSteps":[...],
  "skillAnalysis": [
    {
      "skillName": "${skillName}",
      "requiredLevel": 1-5,
      
      "demonstratedExperienceLevel": 0-5,
      "strengths": ["..."], // If none, use: ["No strengths identified for this skill"]
      "weaknesses": ["..."], // If none, use: ["No weaknesses identified for this skill"]
      "confidenceScore": 0-100,
      "todoList": {
        "title": "${skillName}",
        "tasks": [
          {
            "title": "string",
            "type": "Course" | "Certification" | "Project" | "Article",
            "description": "string",
            "url": "optional string",
            "priority": "low" | "medium" | "high",
            "dueDate": timestamp, 
            "isCompleted": false,
          }
        ]
      }
    }
  ],
}

Return only the valid JSON output. Do not include any commentary.
`,
};



module.exports = {
  generateJobQuestionsPrompts,
  generateOnboardingQuestionsPrompts,
  analyzeOnbordingQuestionsPrompts
};
