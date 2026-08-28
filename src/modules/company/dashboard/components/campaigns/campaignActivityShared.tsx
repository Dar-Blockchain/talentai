import React from "react";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import axiosInstance from "@/utils/axiosInstance";
import { FileText as FileTextOutlined } from "lucide-react";
import type { CampaignRecentActivityItem } from "../../hooks/useCampaignsAnalytics";
import { MODULE_TYPE_META } from "./moduleTypeMeta";

const sel = (r: any) => r.data?.data ?? r.data;
export const fetchRecentCompletions = (page: number, limit: number) =>
  axiosInstance.get("internal-campaigns/recent-completions", { params: { page, limit } }).then(sel);

export const timeAgo = (iso: string): string => {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${Math.max(mins, 0)}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
};

export const initialsOf = (name: string) => {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
};

export const CampaignActivityRow: React.FC<{ item: CampaignRecentActivityItem }> = ({ item }) => {
  const { t } = useTranslation("dashboard");
  const router = useRouter();
  const meta = item.moduleType ? MODULE_TYPE_META[item.moduleType] : null;
  const Icon = meta?.icon ?? FileTextOutlined;

  return (
    <div className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-[12px] shrink-0"
        style={{ background: meta?.bg ?? "#F1F5F9", color: meta?.color ?? "#64748B" }}
      >
        {initialsOf(item.participantName)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          {item.participantUserId ? (
            <button
              type="button"
              onClick={() => router.push(`/company/employees/${item.participantUserId}`)}
              className="cursor-pointer font-semibold text-[13px] text-slate-900 hover:text-indigo-600 hover:underline underline-offset-2 truncate text-left"
            >
              {item.participantName}
            </button>
          ) : (
            <span className="font-semibold text-[13px] text-slate-900 truncate">{item.participantName}</span>
          )}
          <span className="text-[10px] text-slate-400 shrink-0">{timeAgo(item.completedAt)}</span>
        </div>
        <div className="text-[11.5px] text-slate-400 truncate mt-0.5">
          {t("campaigns_dashboard.recent_activity.completed_campaign", "Completed")}{" "}
          {item.campaignId ? (
            <button
              type="button"
              onClick={() => router.push(`/company/campaigns/${item.campaignId}`)}
              className="cursor-pointer text-slate-500 font-medium hover:text-indigo-600 hover:underline underline-offset-2"
            >
              {item.campaignTitle}
            </button>
          ) : (
            <span className="text-slate-500 font-medium">{item.campaignTitle}</span>
          )}
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
};

// Card variant for the full /company/campaigns/activity page — one per row,
// full width, so content runs horizontally (avatar, name/campaign, badges,
// timestamp all on one line) instead of the compact widget's stacked layout.
export const CampaignActivityCard: React.FC<{ item: CampaignRecentActivityItem }> = ({ item }) => {
  const { t } = useTranslation("dashboard");
  const router = useRouter();
  const meta = item.moduleType ? MODULE_TYPE_META[item.moduleType] : null;
  const Icon = meta?.icon ?? FileTextOutlined;

  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-white p-3.5 transition-all duration-150 hover:border-slate-200 hover:shadow-[0_2px_10px_-4px_rgba(15,23,42,0.10)]">
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-[13px] shrink-0"
        style={{ background: meta?.bg ?? "#F1F5F9", color: meta?.color ?? "#64748B" }}
      >
        {initialsOf(item.participantName)}
      </div>

      <div className="flex-1 min-w-0">
        {item.participantUserId ? (
          <button
            type="button"
            onClick={() => router.push(`/company/employees/${item.participantUserId}`)}
            className="cursor-pointer font-semibold text-[13.5px] text-slate-900 hover:text-indigo-600 hover:underline underline-offset-2 truncate block max-w-full text-left"
          >
            {item.participantName}
          </button>
        ) : (
          <span className="font-semibold text-[13.5px] text-slate-900 truncate block">{item.participantName}</span>
        )}
        <div className="text-[12px] text-slate-400 truncate mt-0.5">
          {t("campaigns_dashboard.recent_activity.completed_campaign", "Completed")}{" "}
          {item.campaignId ? (
            <button
              type="button"
              onClick={() => router.push(`/company/campaigns/${item.campaignId}`)}
              className="cursor-pointer text-slate-600 font-medium hover:text-indigo-600 hover:underline underline-offset-2"
            >
              {item.campaignTitle}
            </button>
          ) : (
            <span className="text-slate-600 font-medium">{item.campaignTitle}</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {item.moduleType && (
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[10.5px] whitespace-nowrap"
            style={{ background: meta?.bg, color: meta?.color }}
          >
            <Icon size={11} />
            {t(`campaigns_dashboard.module_types.types.${item.moduleType}`)}
          </span>
        )}
        {item.score != null && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-[10.5px] font-bold text-emerald-600 whitespace-nowrap">
            {t("campaigns_dashboard.recent_activity.score", "Score")} {item.score}%
          </span>
        )}
      </div>

      <span className="text-[10.5px] text-slate-400 shrink-0 w-10 text-right">{timeAgo(item.completedAt)}</span>
    </div>
  );
};
