import { InterviewConfig } from '../../shared/types/interview';
import type { JobSalaryInfo } from '@/modules/company/posts/details/types';

// ─── Job Post ──────────────────────────────────────────────────────────────────

/** @deprecated use `JobSalaryInfo` from `@/modules/company/posts/details/types` — kept as an alias so existing imports keep working. */
export type JobSalary = JobSalaryInfo;

export interface JobPostSkill {
  name: string;
  level?: string;
  type?: 'technical' | 'soft';
}

export interface JobSkillAnalysisEntry {
  name: string;
  level?: number;
  percentage?: number;
}

export interface JobDetails {
  title?: string;
  description?: string;
  requirements?: string | string[];
  responsibilities?: string;
  workMode?: string;
  employmentType?: string;
  salary?: JobSalaryInfo;
  skills?: JobPostSkill[];
  technicalSkills?: JobPostSkill[];
  softSkills?: JobPostSkill[];
}

export interface JobPost {
  _id: string;
  title?: string;
  companyName?: string;
  createdBy?: { id: string; name: string };
  user?: { _id: string; username?: string };
  company?: { _id?: string; companyName?: string };
  profile?: { _id: string };
  jobDetails?: JobDetails;
  /** Present on posts that went through AI skill extraction; read by `getPostSkills`. */
  skillAnalysis?: {
    requiredSkills?: JobSkillAnalysisEntry[];
    softSkills?: JobSkillAnalysisEntry[];
  };
  creationType?: 'regular' | 'standard';
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
  interviewData?: {
    interviewType?: string;
    finalReport?: {
      scores?: { overall?: number };
      coverage?: { overall?: number; areas?: Record<string, unknown> };
      summary?: string;
      recommendations?: string[];
      aiAnalysis?: { strongestAreas?: string[]; weakestAreas?: string[]; recommendedFocus?: string[] };
      recommendation?: 'hire' | 'maybe' | 'no_hire';
      strengths?: string[];
      weaknesses?: string[];
      reasoning?: string;
      candidateProfile?: {
        communicationStyle?: { verbosity?: string; confidenceLevel?: string };
        revealedExpertise?: string[];
        revealedGaps?: string[];
        difficultyLevel?: string;
      };
    };
    analytics?: { duration?: number; messageCount?: number; completedAreas?: number; totalAreas?: number; coveragePercentage?: number };
  };
  candidatePostStepProgress?: unknown;
  createdAt: string;
  updatedAt?: string;
  assessmentsCount?: number;
}

// ─── Interview Config ──────────────────────────────────────────────────────────

export type { InterviewConfig };

// ─── Eligibility ───────────────────────────────────────────────────────────────

export type EligibilityStatus =
  | 'checking'
  | 'eligible'
  | 'error'
  | 'no_link'
  | 'company_blocked'
  | 'employee_blocked'
  | 'archived'
  | 'expired'
  | 'completed'
  | 'under_threshold'
  | 'limit_reached'
  | 'no_cv'
  | 'withdrawn';

export interface EligibilityMeta {
  required?: number;
  score?: number;
  jobTitle?: string;
  companyName?: string;
}

export interface EligibilityResponse {
  status: EligibilityStatus | 'not_found';
  meta?: EligibilityMeta;
  message?: string;
}
