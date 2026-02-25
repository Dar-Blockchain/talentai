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

export interface CampaignModule {
  type: ModuleType;
  config: Record<string, any>;
  order: number;
}

export interface Campaign {
  _id: string;
  company: string;
  title: string;
  type: CampaignType;
  description?: string;
  status: CampaignStatus;
  anonymityMode: AnonymityMode;
  modules: CampaignModule[];
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

export interface CreateCampaignPayload {
  title: string;
  type: CampaignType;
  description?: string;
  anonymityMode: AnonymityMode;
  modules: CampaignModule[];
  accessMethod: AccessMethod;
  targetDepartment?: string;
  targetEmployeeCount?: number;
  deadline?: string;
  skill?: string;
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