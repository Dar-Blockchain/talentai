// Type definitions for Post Interview components

export interface PostInterviewData {
  _id: string;
  post?: {
    jobDetails?: {
      title: string;
    };
    company?: string;
  };
  overallScore?: number;
  recommendations?: string[];
  createdAt?: string;
  updatedAt?: string;
  type: string;
  skillDetails?: Array<{
    name: string;
    proficiencyLevel: string;
    confidenceScore: number;
  }>;
}

export interface StepConfig {
  nodeNumber: number;
  title?: string;
  configured?: boolean;
}

export interface StepData {
  label: string;
  type: string;
  subtitle?: string;
  config?: StepConfig;
}

export interface StepId {
  _id: string;
  order?: number;
  status?: string;
  data: StepData;
  id?: string;
}

export interface InterviewDetails {
  _id: string;
  type: string;
  overallScore: number;
  createdAt: number;
  id: string;
}

export interface Step {
  stepId: StepId;
  status: string;
  completedAt?: string;
  _id: string;
  score?: number;
  results?: string;
  feedback?: string;
  interviewDetails?: InterviewDetails | null;
}

export interface CurrentStep {
  _id: string;
  order?: number;
  status?: string;
  data: StepData;
}

export interface Candidate {
  _id: string;
  username: string;
  email: string;
  FirstName?: string;
  LastName?: string;
  role?: string;
  Localisation?: string;
  lastLogin?: string;
}

export interface JobDetails {
  title: string;
  description?: string;
  location?: string;
  employmentType?: string;
  experienceLevel?: string;
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  status?: string;
}

export interface SkillAnalysis {
  skillSummary?: {
    mainTechnologies?: string[];
    stackComplexity?: string;
  };
}

export interface Post {
  _id: string;
  jobDetails: JobDetails;
  status?: string;
  skillAnalysis?: SkillAnalysis;
}

export interface CandidateProgress {
  _id: string;
  idCandidate: Candidate;
  idPost: Post;
  currentStep: CurrentStep;
  steps: Step[];
  createdAt: string;
  updatedAt: string;
}

export interface SendTaskPayload {
  postId: string;
  stepId: string;
  candidateId: string;
  candidateEmail: string;
  candidateName: string;
  jobTitle: string;
  stepLabel: string;
}

export interface FeedbackFormData {
  overallExperience: string;
  easeOfUse: string;
  questionQuality: string;
  interfaceRating: string;
  evaluationRating: string;
  recommendation: string;
}

export interface NotificationState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
}
