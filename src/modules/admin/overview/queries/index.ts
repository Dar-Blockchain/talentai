import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminOverviewApi } from "../api";

const STALE_TIME = 60_000;

export const useAdminStatsQuery = () =>
  useQuery({
    queryKey: ["admin", "overview", "stats"],
    queryFn:  adminOverviewApi.fetchStats,
    staleTime: STALE_TIME,
  });

export const useAdminUsersForMapQuery = () =>
  useQuery({
    queryKey: ["admin", "overview", "users-for-map"],
    queryFn:  adminOverviewApi.fetchAllUsersForMap,
    staleTime: STALE_TIME,
  });

export const useAdminUserGrowthQuery = () =>
  useQuery({
    queryKey: ["admin", "overview", "user-growth"],
    queryFn:  adminOverviewApi.fetchUserGrowthData,
    staleTime: STALE_TIME,
  });

export const useAdminRevenueSummaryQuery = () =>
  useQuery({
    queryKey: ["admin", "overview", "revenue-summary"],
    queryFn:  adminOverviewApi.fetchRevenueSummary,
    staleTime: STALE_TIME,
  });

export const useAdminRecentSignupsQuery = (limit = 8) =>
  useQuery({
    queryKey: ["admin", "overview", "recent-signups", limit],
    queryFn:  () => adminOverviewApi.fetchRecentSignups(limit),
    staleTime: STALE_TIME,
  });

/** Derives the hard/soft skill pie-chart slices from stats — memoized so it
 * doesn't allocate a new array (and re-render consumers) on every render. */
export const useSkillDistribution = (hardSkillsPercentage = 0, softSkillsPercentage = 0) =>
  useMemo(
    () => [
      { name: "Hard Skills", value: hardSkillsPercentage, color: "#8884d8" },
      { name: "Soft Skills", value: softSkillsPercentage, color: "#82ca9d" },
    ],
    [hardSkillsPercentage, softSkillsPercentage],
  );
