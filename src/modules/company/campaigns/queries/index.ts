import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import type {
  CampaignsListParams, ParticipantsParams, SessionsParams, NonParticipantsParams,
  Campaign, CreateCampaignPayload,
} from "../types";
import {
  apiFetchCampaigns, apiFetchMetrics, apiFetchCampaignById,
  apiCreateCampaign, apiUpdateCampaign, apiUpdateCampaignStatus, apiDeleteCampaign,
  apiFetchParticipants, apiFetchNonParticipants, apiAddParticipant, apiRemoveParticipant,
  apiFetchParticipantResults, apiFetchSessions,
} from "../api";

// ─── Query key factory ────────────────────────────────────────────────────────

export const CAMPAIGN_KEYS = {
  all:                ()                         => ["campaigns"]                              as const,
  list:               (p: CampaignsListParams)   => ["campaigns", "list",         p]          as const,
  metrics:            ()                         => ["campaigns", "metrics"]                   as const,
  detail:             (id: string)               => ["campaigns", "detail",        id]         as const,
  participants:       (p: ParticipantsParams)    => ["campaigns", "participants",  p]          as const,
  nonParticipants:    (p: NonParticipantsParams) => ["campaigns", "nonParticipants", p]        as const,
  sessions:           (p: SessionsParams)        => ["campaigns", "sessions",      p]          as const,
  participantResults: (cId: string, pId: string) => ["campaigns", "results",       cId, pId]  as const,
};

// ─── List & metrics ───────────────────────────────────────────────────────────

export const useCampaignsListQuery = (params: CampaignsListParams) =>
  useQuery({
    queryKey:        CAMPAIGN_KEYS.list(params),
    queryFn:         () => apiFetchCampaigns(params),
    staleTime:       30_000,
    placeholderData: keepPreviousData,
  });

export const useCampaignMetricsQuery = () =>
  useQuery({
    queryKey:  CAMPAIGN_KEYS.metrics(),
    queryFn:   apiFetchMetrics,
    staleTime: 60_000,
  });

// ─── Detail ───────────────────────────────────────────────────────────────────

export const useCampaignDetailQuery = (id: string | undefined) =>
  useQuery({
    queryKey: CAMPAIGN_KEYS.detail(id ?? ""),
    queryFn:  () => apiFetchCampaignById(id!),
    enabled:  !!id,
    staleTime: 30_000,
  });

// ─── Participants ─────────────────────────────────────────────────────────────

export const useCampaignParticipantsQuery = (params: ParticipantsParams) =>
  useQuery({
    queryKey:        CAMPAIGN_KEYS.participants(params),
    queryFn:         () => apiFetchParticipants(params),
    enabled:         !!params.campaignId,
    staleTime:       30_000,
    placeholderData: keepPreviousData,
  });

export const useNonParticipantsQuery = (params: NonParticipantsParams) =>
  useQuery({
    queryKey:        CAMPAIGN_KEYS.nonParticipants(params),
    queryFn:         () => apiFetchNonParticipants(params),
    enabled:         !!params.campaignId,
    staleTime:       30_000,
    placeholderData: keepPreviousData,
  });

export const useParticipantResultsQuery = (campaignId: string, participantId: string) =>
  useQuery({
    queryKey:  CAMPAIGN_KEYS.participantResults(campaignId, participantId),
    queryFn:   () => apiFetchParticipantResults(campaignId, participantId),
    enabled:   !!campaignId && !!participantId,
    staleTime: 5 * 60_000,
  });

// ─── Sessions ─────────────────────────────────────────────────────────────────

export const useCampaignSessionsQuery = (params: SessionsParams) =>
  useQuery({
    queryKey:        CAMPAIGN_KEYS.sessions(params),
    queryFn:         () => apiFetchSessions(params),
    enabled:         !!params.campaignId,
    staleTime:       30_000,
    placeholderData: keepPreviousData,
  });

// ─── Mutations ────────────────────────────────────────────────────────────────

export const useCreateCampaignMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCampaignPayload) => apiCreateCampaign(payload),
    onSuccess:  () => qc.invalidateQueries({ queryKey: CAMPAIGN_KEYS.all() }),
  });
};

export const useUpdateCampaignMutation = (campaignId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Campaign>) => apiUpdateCampaign(campaignId, payload),
    onSuccess:  (updated) => {
      qc.setQueryData(CAMPAIGN_KEYS.detail(campaignId), updated);
      qc.invalidateQueries({ queryKey: CAMPAIGN_KEYS.list({}) });
    },
  });
};

export const useUpdateCampaignStatusMutation = (campaignId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (status: string) => apiUpdateCampaignStatus(campaignId, status),
    onSuccess:  (updated) => {
      qc.setQueryData(CAMPAIGN_KEYS.detail(campaignId), updated);
      qc.invalidateQueries({ queryKey: CAMPAIGN_KEYS.list({}) });
      qc.invalidateQueries({ queryKey: CAMPAIGN_KEYS.metrics() });
    },
  });
};

export const useDeleteCampaignMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (campaignId: string) => apiDeleteCampaign(campaignId),
    onSuccess:  (_, campaignId) => {
      qc.removeQueries({ queryKey: CAMPAIGN_KEYS.detail(campaignId) });
      qc.invalidateQueries({ queryKey: CAMPAIGN_KEYS.list({}) });
      qc.invalidateQueries({ queryKey: CAMPAIGN_KEYS.metrics() });
    },
  });
};

export const useAddParticipantMutation = (campaignId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (employeeId: string) => apiAddParticipant(campaignId, employeeId),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ["campaigns", "participants"] });
      qc.invalidateQueries({ queryKey: ["campaigns", "nonParticipants"] });
    },
  });
};

export const useRemoveParticipantMutation = (campaignId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (participantId: string) => apiRemoveParticipant(campaignId, participantId),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ["campaigns", "participants"] });
    },
  });
};
