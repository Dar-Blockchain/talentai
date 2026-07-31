import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import {
  fetchCandidateApplications,
  fetchCandidateApplicationStats,
  fetchApplicationById,
  withdrawCandidateApplication,
  reactivateCandidateApplication,
} from "../api/applications.api";
import type { ApplicationsParams, CandidateStats } from "../types/application.types";

export const APPLICATION_KEYS = {
  all:    ()                     => ["candidateApplications"]                  as const,
  list:   (p: ApplicationsParams) => ["candidateApplications", "list",  p]    as const,
  detail: (id: string)           => ["candidateApplications", "detail", id]   as const,
  stats:  ()                     => ["candidateApplications", "stats"]         as const,
};

export const useApplicationDetailQuery = (id: string) =>
  useQuery({
    queryKey: APPLICATION_KEYS.detail(id),
    queryFn:  () => fetchApplicationById(id),
    enabled:  !!id,
    staleTime: 30_000,
  });

export const useApplicationsQuery = (params: ApplicationsParams = {}) =>
  useQuery({
    queryKey:        APPLICATION_KEYS.list(params),
    queryFn:         () => fetchCandidateApplications(params),
    staleTime:       30_000,
    placeholderData: keepPreviousData,
  });

export const useApplicationStatsQuery = () =>
  useQuery<CandidateStats & { success?: boolean; monthly?: Record<string, unknown>[] }>({
    queryKey:  APPLICATION_KEYS.stats(),
    queryFn:   fetchCandidateApplicationStats,
    staleTime: 60_000,
  });

export const useWithdrawMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (applicationId: string) => withdrawCandidateApplication(applicationId),
    onSuccess:  () => qc.invalidateQueries({ queryKey: APPLICATION_KEYS.all() }),
  });
};

export const useReactivateMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (applicationId: string) => reactivateCandidateApplication(applicationId),
    onSuccess:  () => qc.invalidateQueries({ queryKey: APPLICATION_KEYS.all() }),
  });
};
