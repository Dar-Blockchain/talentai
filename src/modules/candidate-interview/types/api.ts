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

// ─── Pipeline Progress ─────────────────────────────────────────────────────────

export type PipelineStepStatus = 'pending' | 'inProgress' | 'done';

export interface PipelineStepProgress {
  stepId: string;
  status: PipelineStepStatus;
  interviewDetails: string | null;
  completedAt: string | null;
  passed?: boolean;
  finalScore?: number;
  attempts?: number;
}

export interface PipelineProgress {
  _id: string;
  idCandidate: string;
  idPost: string;
  currentStep: string;
  steps: PipelineStepProgress[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PipelineCurrentStep {
  stepId: string;
  stepNumber: number;
  stepType: string;
  stepTitle: string;
  interviewParams: Record<string, unknown>;
  passThreshold: number;
}

export interface PipelineProgressStats {
  completedSteps: number;
  totalSteps: number;
  completionPercentage: number;
  currentStepNumber: number;
}

export interface PipelineProgressResponse {
  success: boolean;
  currentStep: PipelineCurrentStep;
  progress: PipelineProgress;
  stats: PipelineProgressStats;
}

export interface InitializePipelineResponse {
  success: boolean;
  data: PipelineProgress;
  isNew: boolean;
  currentStepNumber?: number;
}

export interface UpdatePipelineStepPayload {
  candidateId: string;
  jobId: string;
  stepId: string;
  passed: boolean;
  finalScore: number;
  status?: string;
}

export interface UpdatePipelineStepResponse {
  success: boolean;
  data: PipelineProgress;
  passed: boolean;
  finalScore: number;
}
