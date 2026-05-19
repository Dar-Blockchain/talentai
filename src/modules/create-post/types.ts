// ── Salary ────────────────────────────────────────────────────────────────────

export interface SalaryRange {
  min: number | string;
  max: number | string;
  currency: string;
}

// ── Skills ────────────────────────────────────────────────────────────────────

export interface HardSkill {
  name: string;
  level: number;
  category: string;
  percentage: number;
}

export interface SoftSkill {
  name: string;
  level: number;
  percentage: number;
}

// ── Job content ───────────────────────────────────────────────────────────────

export interface JobDetails {
  title: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  workMode: string;
  employmentType: string;
  experienceLevel: string;
  salary: SalaryRange;
}

export interface SkillAnalysis {
  requiredSkills: HardSkill[];
  softSkills: SoftSkill[];
}

// ── API: generate post ────────────────────────────────────────────────────────

export interface GeneratePostPayload {
  jobDescription: string;
  salary: { min: number | null; max: number | null; currency: string };
  contractType?: string;
  workMode?: string;
  language?: string;
}

export interface GeneratePostResponse {
  creationType: "ai";
  jobDetails: JobDetails;
  skillAnalysis: SkillAnalysis;
  expirationDate: string | null;
}

// ── API: save / update post ───────────────────────────────────────────────────

export interface SavePostPayload {
  creationType: "ai";
  jobDetails: JobDetails;
  skillAnalysis: SkillAnalysis;
  expirationDate?: string | null;
  interviewLanguages?: string[];
}

export interface SavePostResponse {
  success: boolean;
  jobData: any;
  planUsage: any | null;
}
