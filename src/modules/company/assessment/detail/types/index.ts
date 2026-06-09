export interface CoverageIndicator {
  name: string;
  covered?: boolean;
  evidence?: string[];
  quality?: number;
}

export interface CoverageArea {
  percentage?: number;
  weight?: number;
  depth?: string;
  completed?: boolean;
  indicators?: CoverageIndicator[];
}

export interface CoverageReport {
  overall?: number;
  areas?: Record<string, CoverageArea>;
  completedAreas?: string[];
  nextRecommendedArea?: string | null;
  lastUpdated?: string;
}

export interface AssessmentAnalytics {
  duration?: number;
  messageCount?: number;
  silenceEvents?: number;
  coveragePercentage?: number;
  completedAreas?: number;
  totalAreas?: number;
  averageResponseLength?: number;
  interactionStyle?: string;
}

export interface AiAnalysis {
  strongestAreas?: string[];
  weakestAreas?: string[];
  recommendedFocus?: string[];
}

export interface FinalReport {
  summary?: string;
  coverage?: CoverageReport;
  scores?: Record<string, number>;
  recommendations?: string[];
  recommendation?: "hire" | "maybe" | "no_hire" | "strong_hire";
  strengths?: string[];
  weaknesses?: string[];
  reasoning?: string;
  aiAnalysis?: AiAnalysis;
  timestamp?: string;
}

export interface InterviewData {
  finalReport?: FinalReport;
  analytics?: AssessmentAnalytics;
  interviewType?: string;
  sessionId?: string;
  timestamp?: string;
}

export interface Skill {
  _id?: string;
  name?: string;
  percentage?: number;
  level?: string | number;
  category?: string;
}

export interface JobDetails {
  title?: string;
  description?: string;
  requirements?: string[];
  responsibilities?: string[];
  location?: string;
  employmentType?: string;
  experienceLevel?: string;
}

export interface SkillAnalysis {
  requiredSkills?: Skill[];
  softSkills?: Skill[];
}

export interface AssessmentPost {
  _id?: string;
  jobDetails?: JobDetails;
  skillAnalysis?: SkillAnalysis;
}

export interface PipelineStep {
  _id?: string;
  status?: string;
  score?: number;
  completedAt?: string;
  stepId?: {
    order?: number;
    data?: {
      label?: string;
      type?: string;
      config?: { title?: string };
    };
  };
  interviewDetails?: { interviewData?: InterviewData };
}

export interface StepsData {
  steps?: PipelineStep[];
}

export interface AssessmentCandidate {
  _id: string;
  username?: string;
  email?: string;
}

export interface AssessmentDetail {
  _id: string;
  status?: string;
  stage?: string;
  createdAt?: string;
  candidate?: AssessmentCandidate;
  company?: { _id?: string; username?: string; email?: string };
  post?: AssessmentPost;
  interviewData?: InterviewData;
  overallScore?: number;
}

export interface AssessmentDerived {
  candidateName: string;
  jobTitle: string;
  interviewType: string;
  coverageScore: number;
  coverageAreas: Record<string, CoverageArea>;
  aiAnalysis: AiAnalysis;
  summary: string;
  recommendations: string[];
  requiredSkills: Skill[];
  softSkills: Skill[];
  jobDescription: string;
  jobRequirements?: string[];
  jobResponsibilities?: string[];
  analytics: AssessmentAnalytics;
  timestamp: string;
}
