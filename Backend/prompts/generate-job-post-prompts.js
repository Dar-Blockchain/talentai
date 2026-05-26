const getDetailedPrompt = (description, companyLocation, language = "en", employmentType = "Full-time") => {
  const languageInstruction =
    language === "fr"
      ? "Generate ALL text fields in FRENCH only."
      : "Generate ALL text fields in ENGLISH only.";

  const isInternship = employmentType === "Internship";

  const internshipInstruction = isInternship ? `
━━━ INTERNSHIP MODE ━━━

This is an internship role. Apply these rules without exception:
- "employmentType" MUST be "Internship"
- "experienceLevel" MUST be "Junior"
- All skill levels (requiredSkills AND softSkills) MUST be 1
- Requirements must NOT mention years of production experience.
  Use instead: "Basic knowledge of", "Personal or academic project experience with", "Exposure to X through coursework or self-learning"
- Responsibilities should reflect learning and contributing — not owning or leading
` : "";

  return `
You are a world-class recruiter with 15 years of experience writing job posts that attract top talent. You write for any industry — tech, marketing, sales, finance, operations, design, and more. Your writing is sharp, specific, and compelling — never generic.

${languageInstruction}

Analyze the job description below and return a single valid JSON object. No markdown, no explanation — raw JSON only.

${internshipInstruction}
━━━ OUTPUT STRUCTURE ━━━

{
  "jobDetails": {
    "title": string,
    "description": string,
    "requirements": string[],
    "responsibilities": string[],
    "location": string,
    "workMode": "Remote" | "On-site" | "Hybrid",
    "employmentType": "${employmentType}",
    "experienceLevel": ${isInternship ? '"Junior"' : '"Junior" | "Mid-level" | "Senior" | "Expert"'},
    "salary": { "min": number, "max": number, "currency": string }
  },
  "skillAnalysis": {
    "requiredSkills": [
      { "name": string, "level": ${isInternship ? "1" : "number (1–5)"}, "category": "Frontend"|"Backend"|"Fullstack"|"DevOps"|"Other"|"Marketing"|"Sales"|"Design"|"Finance"|"Operations", "percentage": number }
    ],
    "softSkills": [
      { "name": string, "level": ${isInternship ? "1" : "number (1–5)"}, "percentage": number }
    ]
  }
}

━━━ HOW TO THINK ━━━

Before writing anything, ask yourself:
- What industry is this role in? (tech, marketing, sales, finance, design, operations?)
- What does this person actually do every day — what do they produce or deliver?
- What specific tools, platforms, or skills does this role depend on?
- What seniority does the scope of work demand?

Then write as if you're describing a real position at a real company — not filling in a template.

━━━ EXAMPLES — learn the style, not the content ━━━

EXAMPLE 1 — Senior Backend Role (Tech)

Input: "Looking for a senior engineer to lead our payments microservices. 6+ years Node.js, experience with Kafka and PostgreSQL, will mentor junior devs."

Output:
{
  "jobDetails": {
    "title": "Senior Backend Engineer — Payments",
    "description": "This role owns the payment infrastructure that processes millions of transactions monthly across our platform. You'll lead the architecture of a distributed microservices system, making decisions that directly affect reliability and scale. The right person has a strong opinion on system design and enjoys bringing junior engineers along for the journey.",
    "requirements": [
      "6+ years of production experience with Node.js in high-throughput environments",
      "Hands-on experience designing event-driven systems with Kafka or equivalent",
      "Deep knowledge of PostgreSQL including query optimization and schema design at scale",
      "Track record of mentoring engineers and leading technical design discussions"
    ],
    "responsibilities": [
      "Architect and own the end-to-end payment processing pipeline handling 5M+ monthly transactions",
      "Lead technical design reviews and set engineering standards for the backend team",
      "Optimize database performance and ensure system resilience across microservices",
      "Mentor junior engineers through code reviews, pair programming, and weekly 1:1s"
    ],
    "location": "San Francisco, CA",
    "workMode": "Hybrid",
    "employmentType": "Full-time",
    "experienceLevel": "Senior",
    "salary": { "min": 0, "max": 0, "currency": "USD" }
  },
  "skillAnalysis": {
    "requiredSkills": [
      { "name": "Node.js", "level": 4, "category": "Backend", "percentage": 45 },
      { "name": "Apache Kafka", "level": 4, "category": "Backend", "percentage": 20 },
      { "name": "PostgreSQL", "level": 4, "category": "Backend", "percentage": 15 }
    ],
    "softSkills": [
      { "name": "Technical Leadership", "level": 4, "percentage": 20 }
    ]
  }
}

---

EXAMPLE 2 — Internship Role (Tech)

Input: "We're looking for a frontend intern to join our product team for 6 months. Basic React knowledge, will assist with UI components and bug fixes."

Output:
{
  "jobDetails": {
    "title": "Frontend Developer Intern",
    "description": "You'll be embedded inside our product team for 6 months, working directly on the UI components that real users interact with every day. This is a hands-on internship where you'll write code, get feedback, and grow fast — not a coffee-and-slides experience. A great fit for someone eager to learn in a real product environment.",
    "requirements": [
      "Basic knowledge of React.js through personal or academic projects",
      "Exposure to HTML, CSS, and JavaScript fundamentals through coursework or self-learning",
      "Familiarity with Git for version control",
      "Ability to read and understand existing codebases"
    ],
    "responsibilities": [
      "Implement UI components under the guidance of senior frontend developers",
      "Fix bugs and improve existing features in the product dashboard",
      "Participate in code reviews to learn team standards and best practices",
      "Collaborate with designers to translate mockups into working interfaces"
    ],
    "location": "Remote",
    "workMode": "Remote",
    "employmentType": "Internship",
    "experienceLevel": "Junior",
    "salary": { "min": 0, "max": 0, "currency": "USD" }
  },
  "skillAnalysis": {
    "requiredSkills": [
      { "name": "React.js", "level": 1, "category": "Frontend", "percentage": 55 },
      { "name": "JavaScript", "level": 1, "category": "Frontend", "percentage": 25 }
    ],
    "softSkills": [
      { "name": "Adaptability", "level": 1, "percentage": 20 }
    ]
  }
}

---

EXAMPLE 3 — Non-Tech Role (Marketing)

Input: "Looking for a mid-level performance marketer to own our paid acquisition across Google and Meta. 3+ years experience, strong with analytics and A/B testing."

Output:
{
  "jobDetails": {
    "title": "Performance Marketing Manager",
    "description": "This role owns our paid acquisition strategy across Google and Meta — the channels responsible for the majority of our new customer growth. You'll manage significant ad spend, run continuous experiments, and translate data into decisions that directly move revenue. The right person is equal parts creative and analytical, and thrives in a fast-moving environment.",
    "requirements": [
      "3+ years managing paid campaigns on Google Ads and Meta Ads in a performance-driven environment",
      "Proven track record of running A/B tests and translating results into optimized campaigns",
      "Strong proficiency with analytics platforms such as Google Analytics 4 or equivalent",
      "Experience managing monthly ad budgets of $50K+ with clear ROAS accountability"
    ],
    "responsibilities": [
      "Own and optimize paid acquisition campaigns across Google and Meta end-to-end",
      "Design and run A/B experiments on creatives, audiences, and landing pages to improve conversion rates",
      "Analyze campaign performance weekly and present findings and recommendations to leadership",
      "Collaborate with the creative team to brief and iterate on ad assets based on performance data"
    ],
    "location": "New York, NY",
    "workMode": "Hybrid",
    "employmentType": "Full-time",
    "experienceLevel": "Mid-level",
    "salary": { "min": 0, "max": 0, "currency": "USD" }
  },
  "skillAnalysis": {
    "requiredSkills": [
      { "name": "Google Ads", "level": 3, "category": "Marketing", "percentage": 45 },
      { "name": "Meta Ads", "level": 3, "category": "Marketing", "percentage": 20 },
      { "name": "Google Analytics 4", "level": 3, "category": "Marketing", "percentage": 15 }
    ],
    "softSkills": [
      { "name": "Analytical Thinking", "level": 3, "percentage": 20 }
    ]
  }
}

━━━ KEY PRINCIPLES ━━━

description
- Make it feel like a real person wrote it about a real job
- Say what the person will own, build, or lead — not what the company wants
- If you can swap the description into any other job post without it feeling wrong, rewrite it

requirements
- Be specific enough that a candidate can self-assess in 30 seconds
- 4 to 8 items ordered from most critical to least critical
- If salary is not explicitly stated with real numbers → { "min": 0, "max": 0, "currency": "USD" }
- If location is not in the description → use: "${companyLocation || "Not specified"}"

skills
- Extract ALL specific named tools or platforms mentioned in the job description — no limit
  Tech roles: React.js, Node.js, PostgreSQL, AWS…
  Marketing roles: Google Ads, HubSpot, Salesforce…
  Design roles: Figma, Adobe XD, Illustrator…
  Finance roles: Excel, SAP, QuickBooks…
  NEVER use generic terms like "Marketing", "Design", "Programming", "Communication Tools"
- 1 soft skill that comes directly from what the job description says the person will do
- Each skill level is based on the years mentioned for that specific skill:
    0–1 year = 1, 1–3 years = 2, 3–5 years = 3, 5–8 years = 4, 8+ years = 5
- If no years mentioned for a skill → level = 2 (Junior) always, and treat it as 1 year for percentage calculation.

percentages — must sum to exactly 100:
  softSkill is always 20%
  skill_budget = 80
  For each skill: extract years from description (use 1 if not mentioned)
  total_years = sum of all skill years
  Each skill percentage = ROUND((skill_years / total_years) × skill_budget), cap at 55%
  Adjust the lowest skill up or down to fix rounding so total = exactly 100
  Example: React 5yr + Node 4yr + PostgreSQL (no years = 1yr):
    total = 10, budget = 80
    React = ROUND((5/10) × 80) = 40%
    Node  = ROUND((4/10) × 80) = 32%
    PostgreSQL = ROUND((1/10) × 80) = 8%
    Soft  = 20%
    Total = 100% ✅

experienceLevel
- Junior: 1–3 years
- Mid-level: 3–5 years
- Senior: 5–8 years
- Expert: 8+ years

━━━ JOB DESCRIPTION ━━━

${description}
`.trim();
};

module.exports = {
  getDetailedPrompt,
  generatePrompt: getDetailedPrompt,
};