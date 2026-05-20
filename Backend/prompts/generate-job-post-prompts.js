const getDetailedPrompt = (description, companyLocation, language = "en") => {
  const languageInstructions = language === "fr" 
    ? `Vous devez générer TOUT le contenu en FRANÇAIS (y compris les titres, descriptions, exigences, responsabilités, compétences et le post LinkedIn). Assurez-vous que chaque champ de texte est en français correctement formé.`
    : `Generate ALL content in ENGLISH (including titles, descriptions, requirements, responsibilities, skills, and LinkedIn post). Ensure all text fields are in proper English.`;

  return `
As an expert technical recruiter and AI assistant, analyze this job description and generate a JSON object with only the following structure:

${languageInstructions}

1. Create a professional job post
2. Extract and suggest relevant skills
3. Format it for LinkedIn
4. Provide comprehensive skill analysis

IMPORTANT:
${languageInstructions}
- Extract the exact salary range (min, max, currency) as specified in the job description. Do not estimate or change these values.
- For the "location" field, extract the location from the job description if specified.
- If no location is specified in the job description, use the company location: "${companyLocation}".
- Always include "location" in the output.
- **CRITICAL: The sum of all percentages in requiredSkills + softSkills must equal EXACTLY 100%**
- If the job description explicitly mentions language (for example: English, French, Spanish), INCLUDE THAT LANGUAGE as the single soft skill. Assign the language a suitable "percentage" and "level".
- If no language is mentioned, generate one relevant soft skill as usual (e.g., Problem solving, Communication, Teamwork, Leadership, Adaptability, Time management).

- Set skill level based on years of experience mentioned in the job post:
  - 1 year = level 1
  - 2 years = level 2
  - 5 years = level 3
  - 10 years = level 4
  - 15+ years = level 5

- Each skill in "requiredSkills" must include a "percentage" field representing its importance weight in the job.
- Only one soft skill must be generated.
- If no clear priorities are specified, distribute the percentages evenly and logically among all required skills.
- Core and frequently mentioned skills should receive higher percentages.

Job Description:
${description}

Return the response in the following JSON format:

{
  "jobDetails": {
    "title": "Job title",
    "description": "A concise, professional summary of the role (2-4 sentences). Must clearly state what the role is about, the team/product context, and the impact the hire will have. Do NOT repeat requirements or responsibilities here.",
    "requirements": ["Each requirement must be specific, measurable, and directly relevant to the role. Use concrete technologies, years of experience, degrees, or certifications. Avoid vague terms like 'good knowledge of' or 'familiarity with'. Example: '3+ years of production experience with React.js and TypeScript' instead of 'Experience with frontend frameworks'."],
    "responsibilities": ["Each responsibility must describe a concrete, actionable task the candidate will perform daily or regularly. Use strong action verbs (design, implement, optimize, lead, build, deploy, review, mentor). Avoid generic filler like 'Work with the team' or 'Participate in meetings'. Example: 'Design and implement RESTful APIs serving 10K+ requests/min using Node.js and Express' instead of 'Develop backend services'."],
    "location": "Job location",
    "workMode": "Remote/On-site/Hybrid",
    "employmentType": "Full-time/Part-time/Contract",
    "experienceLevel": "Junior/Mid-level/Senior/Expert",
    "salary": {
      "min": 0,
      "max": 0,
      "currency": "USD"
    }
  },
  "skillAnalysis": {
    "requiredSkills": [
      {
        "name": "Skill 1",
        "level": "Required level (1-5) based on years of experience",
        "category": "Frontend/Backend/DevOps/etc.",
        "percentage": 0
      }
    ],
    "softSkills": [
      {
        "name": "Soft Skill 1",
        "level": "Required level (1-5) based on needs",
        "percentage": 0
      }
    ]
  }
}

STRICT SKILL RULES:
- REQUIRED: Generate 1 to 3 skills in "requiredSkills" based on the actual requirements of the job description. Include only relevant and technical skills.
    - NEVER generate general or non-technical skills such as "Web Development", "Software Engineering", "Programming", or "Full Stack".
    - Skills MUST ALWAYS be specific and technical (e.g., React.js, Next.js, Node.js, Express.js, NestJS, MongoDB, PostgreSQL, REST APIs, HTML/CSS, TypeScript, Docker, AWS, Redis, CI/CD, PHPUnit, Laravel, Symfony).
    - The total percentage of requiredSkills and softSkills combined must equal 100%.
    - LIA must dynamically distribute the 90% among 1–3 requiredSkills and 1 soft skill based on importance, frequency, and context in the job description.
    - Salary, workMode, and contract together account for the remaining 10%.
    - If the job description is vague, infer the most relevant precise technologies instead of using generic terms.
    - Categorize each skill only as: "Frontend", "Backend", "Fullstack", "DevOps", or "Other".
    - Never invent unrealistic skills; remain consistent with standard industry technical stacks.
    - The "name" field must always be a precise tool, language, framework, library, cloud service, or dev practice (NOT a job role).

    STRICT DESCRIPTION RULES:
    - The "description" field must be a concise professional summary (2-4 sentences max).
    - It must explain what the role is, what team or product the candidate will work on, and why this role matters.
    - NEVER repeat the requirements or responsibilities in the description.
    - NEVER use generic filler phrases like "We are looking for a talented developer" or "Join our growing team".
    - The description should feel unique to this specific role and company, not a copy-paste template.

    STRICT REQUIREMENTS RULES:
    - Generate 4-8 requirements. Every single one must be specific, verifiable, and directly extractable from the job description.
    - MANDATORY FORMAT for each requirement — choose the most fitting pattern:
        • Experience pattern   : "<N>+ years of hands-on experience with <specific technology/tool> in a production environment"
        • Degree pattern       : "<Degree level> in <Field> or equivalent practical experience"
        • Certification pattern: "Holding or actively pursuing <Certification name> (e.g., AWS Solutions Architect, PMP)"
        • Skill pattern        : "Demonstrated proficiency in <specific tool/language/framework> through <shipped projects / open-source contributions / certifications>"
        • Domain pattern       : "Proven experience building <specific system type> (e.g., payment systems, real-time APIs, CI/CD pipelines)"
    - NEVER use vague openers such as: "good understanding of", "familiarity with", "knowledge of", "experience with modern", "awareness of best practices".
    - NEVER write generic requirements like "Strong communication skills", "Team player", "Passion for technology", "Ability to work in a fast-paced environment" — those belong in soft skills or responsibilities, not here.
    - If the job description mentions a technology without specifying years, default to "2+ years" for junior roles, "3+ years" for mid-level, "5+ years" for senior roles.
    - If the job description is vague, infer the most relevant and realistic requirements based on the job title, responsibilities, and industry standards — but flag inferred requirements with the prefix "[Inferred]".
    - Order requirements from most critical (must-have) to least critical (nice-to-have).
    - Each requirement must be a standalone, self-contained sentence. No bullet sub-points, no conjunctions joining two separate skills into one requirement.
    - Avoid repeating the same technology across multiple requirements. If a technology appears more than once in the source description, consolidate it into a single precise requirement.

    STRICT RESPONSIBILITIES RULES:
    - Generate 4-8 specific, actionable responsibilities.
    - Each responsibility MUST start with a strong action verb (Design, Implement, Build, Optimize, Lead, Deploy, Review, Architect, Mentor, Develop, Maintain, Automate).
    - Each responsibility must describe a concrete task with enough context to understand what the candidate will actually do.
    - NEVER use vague responsibilities like "Work with the team", "Participate in meetings", "Support development efforts", "Collaborate with stakeholders".
    - Instead use: "Architect and implement microservices handling payment processing for 50K+ daily transactions", "Conduct thorough code reviews and mentor 2-3 junior developers on best practices".
    - Responsibilities should cover the full scope of the role: technical work, collaboration, and growth areas.

    STRICT SOFT SKILL RULES:
    - REQUIRED: Generate exactly 1 soft skill — no more, no less.
    - The soft skill must be relevant to the job role (e.g., Problem solving, Communication, Teamwork, Leadership, Adaptability, Time management).
    - The soft skill must include a "percentage" field.
    - Never use vague or irrelevant soft skills.

    - If employmentType is "Internship" or experienceLevel is "Stage/Entry-level":
    • NEVER require years of production experience in requirements.
    • Use instead: "Basic knowledge of", "Academic or personal project experience with", "Exposure to X through coursework or self-learning".
    • Requirements must reflect what a student or recent graduate can realistically have.
    • Salary min and max must be set to 0 if not explicitly mentioned in the job description.

    - If the job description mentions "stage", "internship", or "intern" anywhere:
    • experienceLevel MUST be "Entry-level" — NEVER "Junior", "Mid-level", or "Senior".
    • employmentType MUST be "Internship" — NEVER "Part-time" or "Full-time".
    • If workMode is not explicitly stated, default to "Hybrid".
    • salary min and max MUST be 0 if no salary is explicitly mentioned.
    
    CRITICAL: Return ONLY the raw JSON object. Do NOT include any explanation, reasoning, or text before or after the JSON.
`.trim();
};

module.exports = {
  getDetailedPrompt,
  generatePrompt: getDetailedPrompt,
};