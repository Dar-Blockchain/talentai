import axiosInstance from "@/utils/axiosInstance";
import type {
  Campaign, CampaignMetrics, CampaignParticipant, CampaignSession,
  NonParticipant, CreateCampaignPayload, CampaignsResponse,
  CampaignsListParams, ParticipantsParams, SessionsParams, NonParticipantsParams,
} from "../types";
import type { ParticipantResultsData } from "@/store/slices/campaignSlice";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const clean = (p: Record<string, any>): Record<string, any> =>
  Object.fromEntries(Object.entries(p).filter(([, v]) => v !== undefined && v !== "" && v !== null));

// ─── List & metrics ───────────────────────────────────────────────────────────

export const apiFetchCampaigns = async (params: CampaignsListParams): Promise<CampaignsResponse> => {
  const res = await axiosInstance.get("internal-campaigns", { params: clean(params) });
  return res.data;
};

export const apiFetchMetrics = async (): Promise<CampaignMetrics> => {
  const res = await axiosInstance.get("internal-campaigns/metrics");
  return res.data.data;
};

// ─── Single campaign ──────────────────────────────────────────────────────────

export const apiFetchCampaignById = async (campaignId: string, userId?: string): Promise<Campaign> => {
  const url = userId
    ? `internal-campaigns/${campaignId}?userId=${userId}`
    : `internal-campaigns/${campaignId}`;
  const res = await axiosInstance.get(url);
  return res.data.data;
};

export const apiCreateCampaign = async (payload: CreateCampaignPayload): Promise<Campaign> => {
  const res = await axiosInstance.post("internal-campaigns", payload);
  return res.data.data;
};

export const apiUpdateCampaign = async (campaignId: string, payload: Partial<Campaign>): Promise<Campaign> => {
  const res = await axiosInstance.put(`internal-campaigns/${campaignId}`, payload);
  return res.data.data;
};

export const apiUpdateCampaignStatus = async (campaignId: string, status: string): Promise<Campaign> => {
  const res = await axiosInstance.patch(`internal-campaigns/${campaignId}/status`, { status });
  return res.data.data;
};

export const apiDeleteCampaign = async (campaignId: string): Promise<string> => {
  await axiosInstance.delete(`internal-campaigns/${campaignId}`);
  return campaignId;
};

// ─── Participants ─────────────────────────────────────────────────────────────

export const apiFetchParticipants = async (
  { campaignId, ...params }: ParticipantsParams,
): Promise<{ data: CampaignParticipant[]; total: number }> => {
  const res = await axiosInstance.get(`internal-campaigns/${campaignId}/participants`, { params: clean(params) });
  const payload = res.data.data;
  return { data: payload.data, total: payload.total ?? payload.data?.length ?? 0 };
};

export const apiFetchNonParticipants = async (
  { campaignId, ...params }: NonParticipantsParams,
): Promise<{ data: NonParticipant[]; total: number }> => {
  const res = await axiosInstance.get(`internal-campaigns/${campaignId}/non-participants`, { params: clean(params) });
  const payload = res.data.data;
  return { data: payload.data, total: payload.total ?? 0 };
};

export const apiAddParticipant = async (campaignId: string, employeeId: string): Promise<CampaignParticipant> => {
  const res = await axiosInstance.post(`internal-campaigns/${campaignId}/participate/${employeeId}`);
  const data = res.data.data;
  if (data.anonymousToken) localStorage.setItem(`anon_token_${campaignId}`, data.anonymousToken);
  return data;
};

export const apiRemoveParticipant = async (campaignId: string, participantId: string): Promise<string> => {
  await axiosInstance.delete(`internal-campaigns/${campaignId}/participate/${participantId}`);
  return participantId;
};

export const apiFetchParticipantResults = async (
  campaignId: string,
  participantId: string,
): Promise<ParticipantResultsData> => {
  const res = await axiosInstance.get(`internal-campaigns/${campaignId}/results/${participantId}`);
  return res.data.data;
};

// ─── Sessions ─────────────────────────────────────────────────────────────────

export const apiFetchSessions = async (
  { campaignId, ...params }: SessionsParams,
): Promise<{ data: CampaignSession[]; total: number }> => {
  const res = await axiosInstance.get(`internal-campaigns/${campaignId}/sessions`, { params: clean(params) });
  return { data: res.data.data, total: res.data.total ?? res.data.data?.length ?? 0 };
};

// ─── Link access ──────────────────────────────────────────────────────────────

export const apiFetchByLinkToken = async (token: string): Promise<Campaign> => {
  const res = await axiosInstance.get(`internal-campaigns/link/${token}`);
  return res.data.data;
};

export const apiJoinByLink = async (
  token: string, name?: string, email?: string,
): Promise<{ campaignId: string; anonymousToken?: string; linkAccessToken?: string; participantId?: string }> => {
  const body: Record<string, string> = {};
  if (name)  body.name  = name;
  if (email) body.email = email;
  const res = await axiosInstance.post(`internal-campaigns/link/${token}/join`, body);
  const data = res.data.data;
  if (data.anonymousToken)  localStorage.setItem(`anon_token_${data.campaignId}`, data.anonymousToken);
  if (data.linkAccessToken) localStorage.setItem(`link_token_${data.campaignId}`, data.linkAccessToken);
  return data;
};
