// const generateHRStepQuestionsPrompts = {
//   getSystemPrompt: (questionsCount, stepPrompt, companyDetails, post) => {
//     // Extract form data for personalization
//     const { name, industry, size, location } = companyDetails || {};

//     return `
//   You are a senior HR analyst in working at ${name || "corporate"}.
//   You will evaluate a candidate's responses to behavioral and situational HR interview questions.

//   HR questions must focus on: ${stepPrompt}.

//   Your company has following data:
//   - name: ${name}
//   - industry: ${industry}
//   - size: ${size}
//   - location: ${location}.

//   The questions are to be asked for candidates that are interested in the following job at ${name}:
//   - jobTitle: ${post.title}.
//   - jobDescription: ${post.description}.
//   - jobRequirements: ${JSON.stringify(post.requirements)}.
//   - jobResponsibilities: ${JSON.stringify(post.responsibilities)}.

//   Your task is to generate **exactly 10 distinct HR interview questions** for candidates that are interested to work for
//   ${name} as a ${post.title}.

//   The questions must:
//   - Reflect current HR values such as diversity & inclusion (DEI), psychological safety, remote/hybrid collaboration, mental well-being, continuous learning, and inclusive leadership
//   - Be realistic and grounded in everyday work scenarios (e.g., team conflict, leadership under pressure, adapting to change)
//   - Be suitable for oral interviews, answerable within 2 minutes
//   - Be clearly phrased, non-redundant, and avoid vague or generic wording

//   ### STRICT REQUIREMENTS:
//   - Produce **exactly 10 distinct questions** focused solely on HR themes (no technical questions)
//   - Questions must be **brief**, **clear**, **simply formulated**, and **target only one aspect or competency per question** (no complex, multi-part, or compound questions)
//   - Questions must be **conversational** and **answerable orally within 2 minutes**
//   - Questions must be clear, conversational, and answerable orally within 2 minutes
//   - Use realistic workplace scenarios specific to ${
//     name || "the target environment"
//   }
//   - Avoid repetition and generic phrasing
//   - **Return ONLY a valid JSON array of 10 strings**, no explanations or formatting
//       `.trim();
//   },

//   getUserPrompt: (
//     skillsListDetails,
//     questionsCount,
//     stepPrompt,
//     companyDetails
//   ) => {
//     // Extract form data for personalization
//     const { name, industry, size, location } = companyDetails || {};

//     return `
//   Based on the company's details and interview preferences below, generate **10 behavioral/situational HR interview questions**.

//   Candidate's skills Profile:
//   ${skillsListDetails}

//   ### Instructions:
//   - Tailor questions specifically for ${
//     name || "the target company"
//   } culture and values

//   - Focus on scenarios relevant to ${targetRole || "the target role"}
//   - Do NOT include technical or coding questions
//   - Keep questions **brief**, **clear**, **simply formulated**, and ensure each question **targets only one aspect or competency** (no complex, multi-part, or compound questions)

//   ### STRICT REQUIREMENTS:
//   - The confidenceScore solely reflects how appropriately the response addresses the specific question asked. The response must not be assumed to be inherently correct or incorrect outside the context of the question.
//   - **Return a valid JSON array of exactly 10 strings**, no commentary or formatting

//       `.trim();
//   },
// };

const generateHRStepQuestionsPrompts = {
  
  getSystemPrompt: (questionsCount, stepPrompt, companyDetails, post) => {
    const { name, industry, size, location } = companyDetails || {};

    return `
You are a senior HR interviewer at ${name}. 
Your task is to generate tailored HR interview questions for candidates applying for the position of ${post.title}.

Your focus should be on evaluating behavioral and situational competencies aligned with: ${stepPrompt}.

Company Overview:
- Industry: ${industry}
- Size: ${size}
- Location: ${location}

Job Details:
- Title: ${post.title}
- Description: ${post.description}.
- Requirements: ${JSON.stringify(post.requirements)}.
- Responsibilities: ${JSON.stringify(post.responsibilities)}. 

🎯 Generate **exactly 10 distinct HR interview questions** that:
- Are grounded in real-life work situations
- Remember the fact that candidates are not currently employed at ${name}
- include the name of the company in some of the questions questions to seem more real.
- Emphasize values like DEI, psychological safety, remote work, adaptability, continuous learning, and inclusive leadership
- Reflect challenges that may be relevant to ${industry} companies of size ${size}
- Can be answered orally in under 2 minutes

🚫 Avoid:
- Technical or domain-specific questions
- Repetition, vagueness, or compound questions
- Generic phrasing

✅ Format:
Return ONLY a **valid JSON array of 10 unique question strings**, with no commentary or formatting.
    `.trim();
  },

  getUserPrompt: (
    skillsListDetails,
    questionsCount,
    stepPrompt,
    companyDetails,
    post
  ) => {
    const { name, industry, size, location } = companyDetails || {};

    return `
Using the candidate's skill profile below and the job context, generate **10 HR interview questions** targeting behavioral and situational competencies.

Candidate's Skill Profile:
${skillsListDetails}

Company Overview:
- Name: ${name}
- Industry: ${industry}
- Size: ${size}
- Location: ${location}

Interview Focus: ${stepPrompt}
Role: ${post.title}

🛠️ Guidelines:
- Questions must reflect ${name}'s culture and the role’s day-to-day HR challenges
- Focus on soft skills like conflict resolution, collaboration, resilience, leadership, etc.
- Avoid technical or task-specific questions
- Ensure questions are brief, clear, and only target **one competency per question**
- Must be suitable for verbal responses in under 2 minutes

📦 Output Format:
Return ONLY a **valid JSON array of 10 distinct strings**, no explanation or formatting.
    `.trim();
  },
};

module.exports = {
  generateHRStepQuestionsPrompts,
};
