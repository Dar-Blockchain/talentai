"use client";
import React, { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import { Skeleton } from "@/modules/shared/ui/shadcn/skeleton";
import { KpiCard } from "../KpiAtoms";

const STALE = 60_000;

const STATUS_KEYS = ["active", "draft", "paused", "closed", "expired"] as const;

interface CampaignMetrics extends Record<(typeof STATUS_KEYS)[number], number> {
  total: number;
}

// The API sometimes wraps the payload as `{ data: T }` and sometimes returns
// `T` directly, so we accept `unknown` here and cast to the declared shape.
const sel = (r: { data: unknown }): CampaignMetrics => {
  const body = r.data as { data?: CampaignMetrics } | undefined;
  return (body?.data ?? body) as CampaignMetrics;
};
const fetchCampaignMetrics = () => axiosInstance.get("internal-campaigns/metrics").then(sel);

const STATUS_COLORS: Record<string, string> = {
  active: "#10B981",
  draft: "#94A3B8",
  paused: "#F59E0B",
  closed: "#64748B",
  expired: "#EF4444",
};

const CampaignsStatusOverview = memo(() => {
  const { t } = useTranslation("dashboard");
  const { data, isLoading } = useQuery({ queryKey: ["teamDashboard", "campaignMetrics"], queryFn: fetchCampaignMetrics, staleTime: STALE });

  const total = data?.total ?? 0;

  const rows = useMemo(
    () => STATUS_KEYS.map((key) => ({
      key,
      count: data?.[key] ?? 0,
      pct: total > 0 ? Math.round(((data?.[key] ?? 0) / total) * 100) : 0,
      color: STATUS_COLORS[key],
    })),
    [data, total],
  );

  const isEmpty = total === 0;

  return (
    <KpiCard title={t("team.campaign_status.title", "Campaign Status Breakdown")} subtitle={t("team.campaign_status.subtitle", "Internal campaigns by status")}>
      {isLoading ? (
        <div className="space-y-3">
          {STATUS_KEYS.map((k) => <Skeleton key={k} className="h-8 w-full rounded-lg" />)}
        </div>
      ) : isEmpty ? (
        <div className="h-[180px] flex items-center justify-center">
          <span className="text-[0.82rem] text-slate-400">{t("overview.campaign_activity.empty", "No campaigns yet")}</span>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((row) => (
            <div key={row.key}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[12.5px] font-medium text-slate-600">
                  {t(`overview.campaign_activity.status.${row.key}`)}
                </span>
                <span className="text-[12.5px] font-bold" style={{ color: row.color }}>{row.count}</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-300" style={{ width: `${row.pct}%`, background: row.color }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </KpiCard>
  );
});
CampaignsStatusOverview.displayName = "CampaignsStatusOverview";
export default CampaignsStatusOverview;
