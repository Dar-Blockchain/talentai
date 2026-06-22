import { useQuery, keepPreviousData } from "@tanstack/react-query";
import type { KpiFilterParams, PostsStatusParams } from "../types";
import {
  fetchKpiActions, fetchKpiFunnel, fetchKpiVelocity,
  fetchKpiSourcing, fetchKpiRoi, fetchKpiPostsForFilter,
  fetchKpiPostsStatus,
} from "../api";

// ─── Query key factory ────────────────────────────────────────────────────────

export const KPI_KEYS = {
  all:         ["kpi"] as const,
  actions:     (p: KpiFilterParams)     => ["kpi", "actions",     p] as const,
  funnel:      (p: KpiFilterParams)     => ["kpi", "funnel",      p] as const,
  velocity:    (p: KpiFilterParams)     => ["kpi", "velocity",    p] as const,
  sourcing:    (p: KpiFilterParams)     => ["kpi", "sourcing",    p] as const,
  roi:         ()                       => ["kpi", "roi"]            as const,
  posts:       ()                       => ["kpi", "posts"]          as const,
  postsStatus: (p: PostsStatusParams)   => ["kpi", "postsStatus", p] as const,
};

// ─── React Query hooks ────────────────────────────────────────────────────────

export const useKpiActionsQuery = (params: KpiFilterParams) =>
  useQuery({
    queryKey:  KPI_KEYS.actions(params),
    queryFn:   () => fetchKpiActions(params),
    staleTime: 60_000,
  });

export const useKpiFunnelQuery = (params: KpiFilterParams) =>
  useQuery({
    queryKey:  KPI_KEYS.funnel(params),
    queryFn:   () => fetchKpiFunnel(params),
    staleTime: 60_000,
  });

export const useKpiVelocityQuery = (params: KpiFilterParams) =>
  useQuery({
    queryKey:  KPI_KEYS.velocity(params),
    queryFn:   () => fetchKpiVelocity(params),
    staleTime: 60_000,
  });

export const useKpiSourcingQuery = (params: KpiFilterParams) =>
  useQuery({
    queryKey:  KPI_KEYS.sourcing(params),
    queryFn:   () => fetchKpiSourcing(params),
    staleTime: 60_000,
  });

export const useKpiRoiQuery = () =>
  useQuery({
    queryKey:  KPI_KEYS.roi(),
    queryFn:   fetchKpiRoi,
    staleTime: 5 * 60_000,
  });

export const useKpiPostsQuery = () =>
  useQuery({
    queryKey:  KPI_KEYS.posts(),
    queryFn:   fetchKpiPostsForFilter,
    staleTime: 5 * 60_000,
  });

export const useKpiPostsStatusQuery = (params: PostsStatusParams) =>
  useQuery({
    queryKey:      KPI_KEYS.postsStatus(params),
    queryFn:       () => fetchKpiPostsStatus(params),
    staleTime:     60_000,
    placeholderData: keepPreviousData,
  });
