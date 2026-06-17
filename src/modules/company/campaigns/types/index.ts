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
} from "@/types/campaign";

export type { EmployeeCampaignEntry, EmployeeCampaignFilters } from "@/store/slices/campaignSlice";

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
  page?:      number;
  limit?:     number;
}

export interface SessionsParams {
  campaignId: string;
  search?:    string;
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
