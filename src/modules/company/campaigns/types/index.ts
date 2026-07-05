import type {
  CampaignType,
  CampaignStatus,
  AnonymityMode,
  CampaignModule,
  ParticipantStatus,
} from "./campaign";

export type {

  Campaign,
  CampaignType,
  CampaignStatus,
  AnonymityMode,
  AccessMethod,
  ModuleType,
  CampaignModule,
  CampaignMetrics,
  CampaignParticipant,
  CampaignSession,
  ParticipantStatus,
  NonParticipant,
  CreateCampaignPayload,
  CampaignsResponse,
  CampaignResponseAnswer,
  CampaignResponse,
  ParticipantResults,
} from "./campaign";

export interface EmployeeCampaignEntry {
  campaignId: string;
  title: string;
  description?: string;
  type: CampaignType;
  status: CampaignStatus;
  anonymityMode: AnonymityMode;
  accessMethod?: string;
  module: CampaignModule;
  deadline?: string;
  company: string | { _id: string; name: string };
  participantStatus: ParticipantStatus;
  accessedAt?: string;
  completedAt?: string;
  joinedAt?: string;
  score?: number;
  progress?: number;
  totalParticipants?: number;
}

export interface EmployeeCampaignFilters {
  userId: string;
  search?: string;
  participantStatus?: string;
  period?: string;
  page?: number;
  limit?: number;
}

// ─── Query param shapes ───────────────────────────────────────────────────────

export interface CampaignsListParams {
  status?:  string;
  page?:    number;
  limit?:   number;
  search?:  string;
  period?:  string;
}

export interface ParticipantsParams {
  campaignId: string;
  search?:    string;
  status?:    string;
  page?:      number;
  limit?:     number;
}

export interface SessionsParams {
  campaignId: string;
  search?:    string;
  period?:    string;
  sortBy?:    "date" | "score";
  order?:     "asc" | "desc";
  page?:      number;
  limit?:     number;
}

export interface NonParticipantsParams {
  campaignId:  string;
  search?:     string;
  department?: string;
  role?:       string;
  sortBy?:     string;
  order?:      string;
  page?:       number;
  limit?:      number;
}
