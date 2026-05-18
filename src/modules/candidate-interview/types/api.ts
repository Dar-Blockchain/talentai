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

// ─── Post Assessment (dashboard listing) ──────────────────────────────────────

export interface PostAssessment {
  _id: string;
  candidate?: string | { _id: string; username?: string; email?: string };
  company?: { _id: string; username?: string; email?: string; role?: string; companyName?: string; logo?: string };
  post?: {
    _id: string;
    jobDetails?: { title?: string; description?: string };
    skillAnalysis?: {
      requiredSkills?: { name: string; category?: string; level?: string; importance?: string }[];
      softSkills?: { name: string; level?: string }[];
    };
    user?: { companyName?: string };
    status?: string;
  };
  skillType?: string;
  interviewData?: {
    interviewType?: string;
    finalReport?: {
      scores?: { overall?: number };
      coverage?: { overall?: number; areas?: Record<string, any> };
      summary?: string;
      recommendations?: string[];
      aiAnalysis?: { strongestAreas?: string[]; weakestAreas?: string[]; recommendedFocus?: string[] };
    };
    analytics?: { duration?: number; messageCount?: number; completedAreas?: number; totalAreas?: number; coveragePercentage?: number };
  };
  candidatePostStepProgress?: any;
  createdAt: string;
  updatedAt?: string;
  assessmentsCount?: number;
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

