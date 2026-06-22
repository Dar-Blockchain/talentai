const { callLLM } = require("../../utils/bedrock-client");
const fs   = require("fs");
const path = require("path");
const { PDFParse } = require("pdf-parse");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractJson(text) {
  if (!text || typeof text !== "string") return "{}";
  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  const first = cleaned.indexOf("{");
  const last  = cleaned.lastIndexOf("}");
  return first !== -1 && last > first ? cleaned.slice(first, last + 1) : cleaned;
}

function cleanAnalyzedData(data) {
  const nonEmpty = (v) => v && v.trim() !== "";
  if (Array.isArray(data.education))       data.education       = data.education.filter((e) => nonEmpty(e.institution));
  if (Array.isArray(data.projects))        data.projects        = data.projects.filter((p) => nonEmpty(p.name));
  if (Array.isArray(data.softSkills))      data.softSkills      = data.softSkills.filter((s) => nonEmpty(s.name));
  if (Array.isArray(data.spokenLanguages)) data.spokenLanguages = data.spokenLanguages.filter((l) => nonEmpty(l.language));
  if (Array.isArray(data.certifications))  data.certifications  = data.certifications.filter((c) => typeof c === "string" && nonEmpty(c));
  if (Array.isArray(data.skills))          data.skills          = data.skills.filter((s) => typeof s === "string" && nonEmpty(s));
  return data;
}

async function extractTextFromPdf(pdfPath) {
  const fileBuffer = fs.readFileSync(pdfPath);
  const parser = new PDFParse({ data: fileBuffer });
  const result = await parser.getText();
  return (result?.text || "").replace(/\s+/g, " ").trim();
}

const PROMPT_TEMPLATE = `
You are an expert CV/resume parser with deep knowledge of software engineering, recruitment, ATS systems, and HR.
If the resume text is truncated, analyze the available information only and return the best possible result.

Read the attached CV carefully and extract all relevant information.

CRITICAL RULES FOR SKILLS EXTRACTION:
- "skills" must be an array of INDIVIDUAL, ATOMIC skill names only â€” one technology or tool per entry
- NEVER group multiple skills into one string
- Each skill must be a clean, standard technology name (e.g. "React.js", "Node.js")
- "skills" should contain ONLY technical skills: programming languages, frameworks, libraries, tools, platforms, databases, DevOps, cloud services
- NEVER put soft skills in the "skills" array â€” those go in "softSkills"
- Remove any duplicates
- Aim to extract 10â€“40 individual skills from a typical CV

GENERAL RULES:
- Return ONLY one valid raw JSON object. No markdown. No explanation. No extra text.
- ALL VALUES MUST BE IN ENGLISH (translate if necessary)
- If a value is missing: "" for strings, [] for arrays, 0 for numbers

Return this exact structure:
{
  "name": "", "email": "", "phone": "", "location": "", "title": "", "summary": "",
  "yearsOfExperience": 0, "seniority": "",
  "skills": [],
  "softSkills": [{ "name": "", "category": "", "proficiencyLevel": 0 }],
  "spokenLanguages": [{ "language": "", "proficiency": "" }],
  "experience": [{ "company": "", "role": "", "startDate": "", "endDate": "", "duration": "", "description": "" }],
  "education": [{ "institution": "", "degree": "", "field": "", "year": "" }],
  "certifications": [],
  "projects": [{ "name": "", "description": "", "technologies": [] }],
  "links": { "linkedin": "", "github": "", "portfolio": "" }
}
`;

async function analyzeCV(pdfPath, maxRetries = 3) {
  if (!pdfPath)                  throw new Error("pdfPath is required");
  if (!fs.existsSync(pdfPath))   throw new Error(`File not found: ${pdfPath}`);
  if (path.extname(pdfPath).toLowerCase() !== ".pdf") throw new Error("Only PDF files are supported");

  const cvText      = await extractTextFromPdf(pdfPath);
  const MAX_CHARS   = 100000;
  const documentText = cvText.length > MAX_CHARS
    ? `${cvText.slice(0, MAX_CHARS)}\n\n[TRUNCATED]`
    : cvText;

  let lastError = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await callLLM({
        messages:    [{ role: "user", content: `${PROMPT_TEMPLATE}\n\nCV_TEXT:\n${documentText}` }],
        temperature: 0,
        maxTokens:   4096,
        timeout:     120000,
      });

      const parsed  = JSON.parse(extractJson(response.content || "{}"));
      return JSON.stringify(cleanAnalyzedData(parsed));
    } catch (error) {
      lastError = error;
      const status = error?.$metadata?.httpStatusCode || 0;
      const code   = error?.code || error?.name || "";
      const retryable = status >= 500 || code === "ThrottlingException" || code === "ServiceUnavailableException";
      if (!retryable || attempt === maxRetries) throw error;
      await sleep(attempt * 1500);
    }
  }

  throw lastError || new Error("Unknown error while analyzing CV");
}

module.exports = { analyzeCV };
