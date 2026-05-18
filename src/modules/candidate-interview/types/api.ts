import { InterviewConfig } from './interview';

// ─── Job Post ──────────────────────────────────────────────────────────────────

export interface JobSalary {
  min?: number;
  max?: number;
  currency?: string;
  period?: string;
}

export interface JobPostSkill {
  name: string;
  level?: string;
  type?: 'technical' | 'soft';
}

export interface JobDetails {
  title?: string;
  description?: string;
  requirements?: string;
  responsibilities?: string;
  workMode?: string;
  employmentType?: string;
  salary?: JobSalary;
  skills?: JobPostSkill[];
  technicalSkills?: JobPostSkill[];
  softSkills?: JobPostSkill[];
}

export interface JobPost {
  _id: string;
  title?: string;
  companyName?: string;
  user?: { _id: string; companyName?: string };
  profile?: { _id: string };
  jobDetails?: JobDetails;
  creationType?: 'pipeline' | 'regular' | 'standard';
  archived?: boolean;
  expirationDate?: string;
  thresholdScore?: number;
  interviewLanguages?: string[];
  createdAt?: string;
  updatedAt?: string;
}

// ─── Interview Config ──────────────────────────────────────────────────────────

export type { InterviewConfig };

// ─── Eligibility ───────────────────────────────────────────────────────────────

// Frontend states handled by useEligibilityCheck and EligibilityGate
export type EligibilityStatus =
  | 'checking'
  | 'eligible'
  | 'no_link'
  | 'company_blocked'
  | 'employee_blocked'
  | 'archived'
  | 'expired'
  | 'completed'
  | 'under_threshold'
  | 'limit_reached';

export interface EligibilityMeta {
  required?: number;
  score?: number;
  jobTitle?: string;
  companyName?: string;
}

// Backend can also return not_found / error — hook falls back to 'eligible' on those
export interface EligibilityResponse {
  status: EligibilityStatus | 'not_found' | 'error';
  meta?: EligibilityMeta;
  message?: string;
}

