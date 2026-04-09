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
export type AccessMethod = "LINK" | "ACCOUNTS";
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
  module: CampaignModule;
  accessMethod: AccessMethod;
  linkToken?: string | null;
  targetEmployeeCount?: number;
  deadline?: string;
  participantCount?: number;
  sessionCount?: number;
  participantStatus?: ParticipantStatus;
  targetDepartment?: string | null;
  progress?: number;
  score?: number;
  completedAt?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCampaignForm {
  title: string;
  type: CampaignType;
  description?: string;
  anonymityMode: AnonymityMode;
  module: ModuleType;
  accessMethod: AccessMethod;
  deadline?: string;
}

export interface CreateCampaignPayload {
  title: string;
  type: CampaignType;
  description?: string;
  anonymityMode: AnonymityMode;
  module: CampaignModule;
  accessMethod: AccessMethod;
  deadline?: string;
  participants?: string[];
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

export type QuestionType = "TEXT" | "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "RATING";

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
    durationMinutes?: number;
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

// ─── Participants ─────────────────────────────────────────────────────────────

export type ParticipantStatus = "INVITED" | "IN_PROGRESS" | "COMPLETED" | "DROPPED";

export interface CampaignParticipant {
  _id: string;
  employeeId?: string;
  anonymousToken?: string;
  linkAccessToken?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  department?: { id: string; name: string };
  status: ParticipantStatus;
  accessedAt?: string;
  completedAt?: string;
  score?: number;
  createdAt?: string;
  updatedAt?: string;
}

// ─── Non-participants (employees not yet in a campaign) ───────────────────────

export interface NonParticipant {
  _id: string;
  membershipId: string;
  firstName: string;
  lastName: string;
  email: string | null;
  username: string | null;
  role: string | null;
  department: { id: string; name: string } | null;
}

// ─── Sessions ─────────────────────────────────────────────────────────────────

export type SessionStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "EXPIRED";

export interface CampaignSession {
  _id: string;
  isAnonymous?: boolean;
  participant?: {
    _id?: string;
    firstName?: string;
    lastName?: string;
    username?: string;
    email?: string;
  };
  status: SessionStatus;
  startedAt?: string;
  completedAt?: string;
  score?: number;
  durationMinutes?: number;
}