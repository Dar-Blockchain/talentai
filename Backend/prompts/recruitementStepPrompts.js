// ============================================================================
// Prompts pour les étapes du recrutement
// ----------------------------------------------------------------------------
// Ce module regroupe des prompts destinés à un LLM (ex: Together AI, OpenAI)
// pour générer des questions d'entretien (RH, soft skills, techniques) et
// guider l'évaluation en fonction du contexte de l'entreprise et du poste.
// 
// Principes clés imposés dans les prompts:
// - Sortie strictement au format JSON (listes de chaînes);
// - Nombre EXACT de questions requis;
// - Pas d'hypothèses non fondées; clarté et brièveté des questions;
// - Adaptation au contexte (entreprise, industrie, taille, localisation, poste);
// - Éviter la répétition et les formulations ambiguës.
// ============================================================================

// ----------------------------------------------------------------------------
// generateHRStepQuestionsPrompts
// ----------------------------------------------------------------------------
// But: générer des questions RH (comportementales/situationnelles) adaptées à
// l'entreprise et au poste pour une étape précise du processus (stepPrompt).
// 
// Structure:
// - getSystemPrompt: définit le rôle du LLM et les règles strictes de sortie.
// - getUserPrompt: fournit le contexte complet (profil de compétences, société,
//   poste) pour permettre une génération fidèle et contextualisée.
const generateHRStepQuestionsPrompts = {
  
  // getSystemPrompt
  // Paramètres:
  // - questionsCount: nombre de questions souhaitées (le prompt impose 10)
  // - stepPrompt: description des compétences/axes RH ciblés pour cette étape
  // - companyDetails: objet { name, industry, size, location } décrivant la société
  // - post: objet décrivant le poste (title, description, requirements, responsibilities)
  // Rôle: cadrer le LLM avec des exigences strictes (10 questions, JSON, pas
  // de technique) et contextualiser avec les infos de l'entreprise et du poste.
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

  // getUserPrompt
  // Paramètres:
  // - skillsListDetails: profil de compétences du candidat (utilisé comme contexte)
  // - questionsCount: nombre souhaité (le prompt impose une sortie de 10)
  // - stepPrompt: axes RH ciblés (ex: collaboration, leadership)
  // - companyDetails: details de l'entreprise (name, industry, size, location)
  // - post: détails du poste (title, description, requirements, responsibilities)
  // Rôle: fournir au LLM un contexte riche pour générer des questions
  // comportementales réalistes et adaptées à la culture d'entreprise.
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



// ----------------------------------------------------------------------------
// generateSoftSkillStepQuestionsPrompts
// ----------------------------------------------------------------------------
// But: générer des questions ciblant spécifiquement les soft skills (compétences
// comportementales) à partir d'axes fournis (stepPrompt) et du contexte
// entreprise/poste.
// 
// Différences vs generateHRStepQuestionsPrompts:
// - Accent explicite sur les soft skills et les « Primary Focus Areas ».
// - Consignes renforcées sur l'authenticité (mention de l'entreprise).
const generateSoftSkillStepQuestionsPrompts = {
  getSystemPrompt: (questionsCount, stepPrompt, companyDetails, post) => {
    const { name, industry, size, location } = companyDetails || {};

    return `
You are a senior recruiter and soft skills interviewer at ${name || "our company"}.
Your task is to generate **clear, concise, and relevant** behavioral and situational interview questions to evaluate **soft skills** of candidates applying for the position of **${post.title}**.

**Primary Focus Areas** (questions must focus on what mentionned here):  
${stepPrompt}

Company Context:
- Name: ${name}
- Industry: ${industry}
- Size: ${size}
- Location: ${location}

Job Overview:
- Title: ${post.title}
- Description: ${post.description}
- Requirements: ${JSON.stringify(post.requirements)}
- Responsibilities: ${JSON.stringify(post.responsibilities)}

🎯 Generate **exactly 10 distinct soft skill interview questions** that:
- Are grounded in realistic workplace scenarios
- Reflect challenges or values relevant to ${industry} companies of size ${size}
- Emphasize competencies mentionned in the **Primary Focus Areas**.
- Include the company name (“${name}”) in some of the questions to create authenticity
- Are suitable for candidates who are **not yet employed at the company**
- Can be answered orally in under 2 minutes

🚫 Do NOT:
- Ask technical or domain-specific questions
- Use vague, repetitive, or multi-part phrasing
- Assume the candidate has prior experience at ${name}

✅ Response Format:
Return ONLY a valid **JSON array of 10 strings**, each being one question. No commentary or formatting.
    `.trim();
  },

  // getUserPrompt
  // Paramètres: similaires à la version RH générale, mais le focus est mis
  // sur les soft skills listés dans `stepPrompt`. Le profil de compétences
  // `skillsListDetails` sert à adapter le niveau/angle des questions.
  getUserPrompt: (
    skillsListDetails,
    questionsCount,
    stepPrompt,
    companyDetails,
    post
  ) => {
    const { name, industry, size, location } = companyDetails || {};

    return `
Using the candidate's skill profile and the following job context, generate **10 soft skill interview questions** that assess behavioral and situational competencies.

🧠 Candidate’s Skill Profile:
${skillsListDetails}

🏢 Company Context:
- Name: ${name}
- Industry: ${industry}
- Size: ${size}
- Location: ${location}

📝 Job Role:
- Title: ${post.title}
- Focus Areas: ${stepPrompt}

📌 Guidelines:
- Tailor each question to reflect ${name}'s culture and realistic work challenges. 
- The generated questions must be **short**, **briefs**, **easy to understand** and **answerable orally in less than 2 minutes**
- Focus on one soft skill per question (e.g., resilience, empathy, collaboration, decision-making)
- Keep language conversational, clear, and simple
- Do NOT ask technical or knowledge-based questions
- Avoid compound questions or vague phrasing
- Include the company name in some of the questions to feel authentic

📦 Output:
Return ONLY a **valid JSON array of 10 strings**, each representing a unique interview question. No extra text.
    `.trim();
  },
};


// ----------------------------------------------------------------------------
// generateTechnicalSkillStepQuestionsPrompts
// ----------------------------------------------------------------------------
// But: générer des questions techniques (hard skills) pour évaluer le niveau
// de maîtrise par rapport à des compétences données. Ici, le LLM doit produire
// EXACTEMENT `questionsCount` questions, en respectant des niveaux de
// compétence et des contraintes de forme (réponse orale < 2 min, JSON only).
// 
// Note: contrairement aux prompts RH/soft, celui-ci filtre explicitement sur
// les hard skills (les soft skills doivent être ignorées dans la génération).
const generateTechnicalSkillStepQuestionsPrompts = {
  getSystemPrompt: (questionsCount) =>
    `
You are a senior technical interviewer. Your job is to generate **exactly ${questionsCount} technical interview questions** tailored to assess a candidate's skill proficiency, based strictly on the defined levels below.

Skill Proficiency Levels:

1 - Entry Level:  
- Basic concepts and definitions  

2 - Junior:  
- Basic practical understanding  
- Simple code-related questions or usage  

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

  // getUserPrompt
  // Paramètres:
  // - questionsCount: nombre EXACT de questions techniques à générer
  // - jobRequiredSkills: liste des compétences requises (incluant niveaux)
  //   À partir de laquelle on extrait uniquement les hard skills à évaluer.
  // Rôle: orienter la distribution des questions entre les compétences
  // techniques, tout en imposant le format JSON et l'absence de redondances.
  getUserPrompt: (questionsCount, jobRequiredSkills) =>
    `
You are given a list of required skills with associated proficiency levels for a specific job role.

Extract the hardSkills out of this list: 
${jobRequiredSkills}. 

Now the extracted hardSkills are to be assessed. 

# Your task:
Generate a total of **${questionsCount} oral technical interview questions**.

# Question distribution-per-skill Rules:
- Distribute questions as **evenly as possible** across all listed skills.
- If an exact even distribution is not possible, distribute them **as fairly and balanced as possible**.
- The **maximum total number of questions is 20**.

# STRICT REQUIREMENTS: 
- Generate **exactly ${questionsCount} questions total**. 
- Only generate questions to assess **technical skills** (softskills are to be ignored)
- Each question must match the skill **and** its **exact proficiency level**
- **Questions must be clear, conversational, and answerable orally in a maximum of 2 minutes** (no written coding exercises).  
- **DO NOT repeat questions or generate generic ones**—each must be **unique and skill-specific**.  
- **Ensure relevance by simulating real-world challenges candidates would realistically face.**  
- **Return ONLY a JSON array of strings**, formatted correctly with no markdown or explanations.  
`.trim(),
};


module.exports = {
  generateHRStepQuestionsPrompts,
  generateSoftSkillStepQuestionsPrompts,
  generateTechnicalSkillStepQuestionsPrompts
};
