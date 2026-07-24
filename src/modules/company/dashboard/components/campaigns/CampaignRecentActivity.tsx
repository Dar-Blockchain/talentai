"use client";
import React, { memo } from "react";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/modules/shared/ui/shadcn/skeleton";
import { FileText as FileTextOutlined, History as HistoryOutlined } from "lucide-react";
import { KpiCard } from "../KpiAtoms";
import { useCampaignsAnalytics, type CampaignRecentActivityItem } from "../../hooks/useCampaignsAnalytics";
import { MODULE_TYPE_META } from "./moduleTypeMeta";

const timeAgo = (iso: string): string => {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${Math.max(mins, 0)}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
};

const initialsOf = (name: string) => {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
};

const RowSkeleton = () => (
  <div className="flex items-start gap-3 py-3">
    <Skeleton className="w-9 h-9 rounded-full shrink-0" />
    <div className="flex-1 space-y-1.5 pt-0.5">
      <Skeleton className="h-3.5 w-2/5" />
      <Skeleton className="h-3 w-3/5" />
    </div>
  </div>
);

const CampaignRecentActivity = memo(() => {
  const { t } = useTranslation("dashboard");
  const { data, isLoading } = useCampaignsAnalytics();
  const items: CampaignRecentActivityItem[] = data?.recentActivity ?? [];

  return (
    <KpiCard title={t("campaigns_dashboard.recent_activity.title", "Recent Activity")} subtitle={t("campaigns_dashboard.recent_activity.subtitle", "Latest campaign completions")}>
      {isLoading ? (
        <div className="divide-y divide-slate-100">
          {[0, 1, 2, 3].map((i) => <RowSkeleton key={i} />)}
        </div>
      ) : items.length === 0 ? (
        <div className="h-[180px] flex flex-col items-center justify-center gap-2 text-slate-400">
          <HistoryOutlined size={22} />
          <span className="text-[0.82rem]">{t("campaigns_dashboard.recent_activity.empty", "No completions yet")}</span>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {items.map((item) => {
            const meta = item.moduleType ? MODULE_TYPE_META[item.moduleType] : null;
            const Icon = meta?.icon ?? FileTextOutlined;
            return (
              <div key={item.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-[12px] shrink-0"
                  style={{ background: meta?.bg ?? "#F1F5F9", color: meta?.color ?? "#64748B" }}
                >
                  {initialsOf(item.participantName)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-semibold text-[13px] text-slate-900 truncate">{item.participantName}</span>
                    <span className="text-[10px] text-slate-400 shrink-0">{timeAgo(item.completedAt)}</span>
                  </div>
                  <div className="text-[11.5px] text-slate-400 truncate mt-0.5">
                    {t("campaigns_dashboard.recent_activity.completed_campaign", "Completed")}{" "}
                    <span className="text-slate-500 font-medium">{item.campaignTitle}</span>
                  </div>
                  <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mt-1.5">
                    {item.moduleType && (
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[10px] whitespace-nowrap"
                        style={{ background: meta?.bg, color: meta?.color }}
                      >
                        <Icon size={11} />
                        {t(`campaigns_dashboard.module_types.types.${item.moduleType}`)}
                      </span>
                    )}
                    {item.score != null && (
                      <span className="text-[10px] font-semibold text-emerald-600">
                        {t("campaigns_dashboard.recent_activity.score", "Score")} {item.score}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </KpiCard>
  );
});
CampaignRecentActivity.displayName = "CampaignRecentActivity";
export default CampaignRecentActivity;
