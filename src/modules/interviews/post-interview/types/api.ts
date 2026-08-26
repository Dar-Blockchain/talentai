import { InterviewConfig } from '../../shared/types/interview';

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
  requirements?: string | string[];
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
  createdBy?: { id: string; name: string };
  user?: { _id: string; username?: string };
  company?: { _id?: string; companyName?: string };
  profile?: { _id: string };
  jobDetails?: JobDetails;
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
      coverage?: { overall?: number; areas?: Record<string, any> };
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
  candidatePostStepProgress?: any;
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

export interface MatchBreakdownItem {
  key: string;
  label: string;
  maxScore: number;
  score: number;
  note: string;
}

export interface EligibilityMeta {
  required?: number;
  score?: number;
  reasoning?: string | null;
  breakdown?: MatchBreakdownItem[];
  jobTitle?: string;
  companyName?: string;
}

export interface EligibilityResponse {
  status: EligibilityStatus | 'not_found';
  meta?: EligibilityMeta;
  message?: string;
}
