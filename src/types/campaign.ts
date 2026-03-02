export type CampaignType =
  | "PRODUCTIVITY_DIAGNOSTIC"
  | "SKILLS_MAPPING"
  | "ENABLEMENT"
  | "CUSTOM";

export type CampaignStatus =
  | "DRAFT"
  | "ACTIVE"
  | "PAUSED"
  | "CLOSED"
  | "EXPIRED";

export type AnonymityMode = "ANONYMOUS" | "NOMINATIVE";
export type AccessMethod = "LINK" | "ACCOUNTS" | "BOTH";
export type ModuleType =
  | "QUESTIONNAIRE"
  | "AI_INTERVIEW"
  | "SKILL_TEST"
  | "TRAINING_PATH";

export interface Campaign {
  _id: string;
  company: string;
  title: string;
  type: CampaignType;
  description?: string;
  status: CampaignStatus;
  anonymityMode: AnonymityMode;
  module: CampaignModule; // single module object
  accessMethod: AccessMethod;
  linkToken?: string | null;
  targetDepartment?: string;
  targetEmployeeCount?: number;
  deadline?: string;
  skill?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCampaignForm {
  title: string;
  type: CampaignType;
  description?: string;
  anonymityMode: AnonymityMode;
  module: ModuleType; // select a single module type
  accessMethod: AccessMethod;
  targetDepartment?: string;
  deadline?: string;
}

export interface CreateCampaignPayload {
  title: string;
  type: CampaignType;
  description?: string;
  anonymityMode: AnonymityMode;
  module: CampaignModule; // single module record
  accessMethod: AccessMethod;
  targetDepartment?: string;
  deadline?: string;
}

export interface CampaignsResponse {
  data: Campaign[];
  pagination: Pagination;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface CampaignMetrics {
  total: number;
  active: number;
  draft: number;
  closed: number;
  paused: number;
  expired: number;
}

export type QuestionType = "TEXT" | "MULTIPLE_CHOICE" | "RATING";

export interface Question {
  question: string;
  type: QuestionType;
  options?: string[];
}

export interface QuestionnaireModule {
  type: "QUESTIONNAIRE";
  config: {
    questions: {
      question: string;
      type: QuestionType;
      options?: string[];
    }[];
  } | null;
}

export interface AIInterviewModule {
  type: "AI_INTERVIEW";
  config: {
    agentPrompt: string;
    durationMinutes?: number;
    scoringCriteria?: string[];
  } | null;
}

export interface SkillTestModule {
  type: "SKILL_TEST";
  config: {
    skill: string;
    passingScore?: number;
    maxAttempts?: number;
  } | null;
}

export interface TrainingPathModule {
  type: "TRAINING_PATH";
  config: {
    resources: LearningResource[];
  } | null;
}

export interface LearningResource {
  type: "LINK" | "DOCUMENT" | "COURSE" | "VIDEO";
  title: string;
  url: string;
  estimatedTime?: number;
}

export type CampaignModule =
  | QuestionnaireModule
  | AIInterviewModule
  | SkillTestModule
  | TrainingPathModule;