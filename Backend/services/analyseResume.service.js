const { callLLM } = require("../helpers/bedrock.helpers");
const fs = require("fs");
const path = require("path");
const { PDFParse } = require("pdf-parse");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractJson(text) {
  if (!text || typeof text !== "string") {
    return "{}";
  }

  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return cleaned.slice(firstBrace, lastBrace + 1);
  }

  return cleaned;
}

function cleanAnalyzedData(data) {
  // Filter out education entries with empty institution or degree
  if (Array.isArray(data.education)) {
    data.education = data.education.filter(
      (edu) => edu.institution && edu.institution.trim() !== ""
    );
  }

  // Filter out project entries with empty name
  if (Array.isArray(data.projects)) {
    data.projects = data.projects.filter(
      (proj) => proj.name && proj.name.trim() !== ""
    );
  }

  // Filter out soft skills with empty name
  if (Array.isArray(data.softSkills)) {
    data.softSkills = data.softSkills.filter(
      (skill) => skill.name && skill.name.trim() !== ""
    );
  }

  // Filter out languages with empty language field
  if (Array.isArray(data.spokenLanguages)) {
    data.spokenLanguages = data.spokenLanguages.filter(
      (lang) => lang.language && lang.language.trim() !== ""
    );
  }

  // Filter out certifications that are empty strings
  if (Array.isArray(data.certifications)) {
    data.certifications = data.certifications.filter(
      (cert) => typeof cert === "string" && cert.trim() !== ""
    );
  }

  // Filter out skills that are empty strings
  if (Array.isArray(data.skills)) {
    data.skills = data.skills.filter(
      (skill) => typeof skill === "string" && skill.trim() !== ""
    );
  }

  return data;
}

async function extractTextFromPdf(pdfPath) {
  const fileBuffer = fs.readFileSync(pdfPath);
  const parser = new PDFParse({ data: fileBuffer });
  const result = await parser.getText();
  const text = (result?.text || "").replace(/\s+/g, " ").trim();
  return text;
}

async function analyzeCV(pdfPath, maxRetries = 3) {
    if (!pdfPath) {
      throw new Error("pdfPath is required");
    }

    if (!fs.existsSync(pdfPath)) {
      throw new Error(`File not found: ${pdfPath}`);
    }

    const ext = path.extname(pdfPath).toLowerCase();
    if (ext !== ".pdf") {
      throw new Error("Only PDF files are supported");
    }

    const cvText = await extractTextFromPdf(pdfPath);
    const maxTextLength = 100000;
    const documentText =
      cvText.length > maxTextLength
        ? `${cvText.slice(0, maxTextLength)}\n\n[TRUNCATED: resume text exceeded ${maxTextLength} chars]`
        : cvText;

    const prompt = `
You are an expert CV/resume parser with deep knowledge of software engineering, recruitment, ATS systems, and HR.
If the resume text is truncated, analyze the available information only and return the best possible result.

Read the attached CV carefully and extract all relevant information.

CRITICAL RULES FOR SKILLS EXTRACTION:
- "skills" must be an array of INDIVIDUAL, ATOMIC skill names only — one technology or tool per entry
- NEVER group multiple skills into one string. For example:
  BAD: "Framework (Angular, Spring Boot, Symphony)"
  BAD: "Languages (Python, JAVA, SQL, PHP, JS)"
  BAD: "CI/CD (Ansible, Jenkins)"
  GOOD: ["Angular", "Spring Boot", "Symfony", "Python", "Java", "SQL", "PHP", "JavaScript", "Ansible", "Jenkins"]
- If the CV lists skills in a grouped format like "Frameworks: Angular, Spring Boot", split them into separate individual entries
- Each skill must be a clean, standard technology name (e.g. "React.js" not "Reactjs", "Node.js" not "NodeJS")
- "skills" should contain ONLY technical skills: programming languages, frameworks, libraries, tools, platforms, databases, DevOps, cloud services
- NEVER put soft skills (communication, teamwork, leadership, etc.) in the "skills" array — those go in "softSkills"
- Remove any duplicates
- Aim to extract 10–40 individual skills from a typical CV

GENERAL RULES:
IMPORTANT: All output values MUST be in English. If the CV is in another language, translate all text content to English.

Rules:
- Return ONLY one valid raw JSON object
- No markdown
- No explanation
- No extra text
- ALL VALUES MUST BE IN ENGLISH (translate if necessary)
- If a value is missing, use:
  - "" for strings
  - [] for arrays
  - 0 for numbers
- Keep the output strictly valid JSON

Return this exact structure:
{
  "name": "",
  "email": "",
  "phone": "",
  "location": "",
  "title": "",
  "summary": "",
  "yearsOfExperience": 0,
  "seniority": "",
  "skills": [],
  "softSkills": [
    { "name": "", "category": "", "proficiencyLevel": 0 }
  ],
  "spokenLanguages": [
    { "language": "", "proficiency": "" }
  ],
  "experience": [
    {
      "company": "",
      "role": "",
      "startDate": "",
      "endDate": "",
      "duration": "",
      "description": ""
    }
  ],
  "education": [
    {
      "institution": "",
      "degree": "",
      "field": "",
      "year": ""
    }
  ],
  "certifications": [],
  "projects": [
    {
      "name": "",
      "description": "",
      "technologies": []
    }
  ],
  "links": {
    "linkedin": "",
    "github": "",
    "portfolio": ""
  }
}
`;

    let lastError = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await callLLM({
          messages: [
            {
              role: "user",
              content: `${prompt}\n\nCV_TEXT:\n${documentText}`,
            },
          ],
          temperature: 0,
          maxTokens: 4096,
          timeout: 120000,
          modelId: "deepseek-ai.deepseek-v3-2",
        });

        const rawText = response.content || "{}";
        const jsonText = extractJson(rawText);

        const parsedData = JSON.parse(jsonText);
        const cleanedData = cleanAnalyzedData(parsedData);

        return JSON.stringify(cleanedData);
      } catch (error) {
        lastError = error;

        const status = error?.$metadata?.httpStatusCode || 0;
        const code = error?.code || "";
        const name = error?.name || "";

        const retryable =
          status >= 500 ||
          name === "ThrottlingException" ||
          code === "ThrottlingException" ||
          code === "ServiceUnavailableException";

        if (!retryable || attempt === maxRetries) {
          throw error;
        }

        await sleep(attempt * 1500);
      }
    }

    throw lastError || new Error("Unknown error while analyzing CV");
}

module.exports = { analyzeCV };