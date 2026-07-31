// Re-export shared types from the list module to avoid duplication
export type { PostStatus, JobPost } from "../../list/types";

export interface JobSalaryInfo {
  min: number;
  max: number;
  currency: string;
}

export interface JobSkillEntry {
  name: string;
  level?: number;
  percentage?: number;
}

export interface JobSkillAnalysis {
  requiredSkills?: JobSkillEntry[];
  softSkills?: JobSkillEntry[];
}

export interface JobDetailFields {
  title?: string;
  description?: string;
  location?: string;
  employmentType?: string;
  workMode?: string;
  department?: string;
  experienceLevel?: string;
  requirements?: string[];
  responsibilities?: string[];
  salary?: JobSalaryInfo;
}

/** Full job/post shape used across the post-details module (detail view, edit form, overview cards). */
export interface JobDetail {
  _id: string;
  status: string;
  creationType?: "ai" | "manual";
  createdAt: string;
  expirationDate?: string;
  thresholdScore?: number;
  applicationCount?: number;
  interviewLanguages?: string[];
  skillAnalysis?: JobSkillAnalysis;
  jobDetails: JobDetailFields;
  user?: { _id: string };
  applicationsCount?: number;
}
