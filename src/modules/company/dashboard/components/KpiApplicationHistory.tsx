"use client";
import React, { memo } from "react";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/modules/shared/ui/shadcn/skeleton";
import { Card } from "@/modules/shared/ui/shadcn/card";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/modules/shared/ui/shadcn/tooltip";
import { History as HistoryOutlined, UserPlus as UserPlusOutlined, Mail as MailOutlined, CheckCircle2 as CheckCircleOutlined, Award as AwardOutlined, XCircle as XCircleOutlined, SearchX as SearchXOutlined } from "lucide-react";
import { ZoneHeading } from "./KpiAtoms";
import type { ApplicationHistoryData } from "../types";

const STATUS_META = {
  applied:     { icon: UserPlusOutlined,    color: "#64748B", bg: "#F1F5F9", labelKey: "pages.kpi.history_applied",     descKey: "pages.kpi.history_applied_desc" },
  invited:     { icon: MailOutlined,        color: "#0891B2", bg: "#ECFEFF", labelKey: "pages.kpi.history_invited",     descKey: "pages.kpi.history_invited_desc" },
  completed:   { icon: CheckCircleOutlined, color: "#7C3AED", bg: "#F5F3FF", labelKey: "pages.kpi.history_completed",   descKey: "pages.kpi.history_completed_desc" },
  shortlisted: { icon: AwardOutlined,       color: "#0D9488", bg: "#F0FDFA", labelKey: "pages.kpi.history_shortlisted", descKey: "pages.kpi.history_shortlisted_desc" },
  rejected:    { icon: XCircleOutlined,     color: "#EF4444", bg: "#FEF2F2", labelKey: "pages.kpi.history_rejected",    descKey: "pages.kpi.history_rejected_desc" },
  not_matched: { icon: SearchXOutlined,     color: "#64748B", bg: "#F8FAFC", labelKey: "pages.kpi.history_not_matched", descKey: "pages.kpi.history_not_matched_desc" },
} as const;

const timeAgo = (iso: string): string => {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${Math.max(mins, 0)}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
};

const RowSkeleton = () => (
  <div className="flex items-start gap-3 py-3.5 px-5">
    <Skeleton className="w-9 h-9 rounded-full shrink-0" />
    <div className="flex-1 space-y-1.5 pt-0.5">
      <Skeleton className="h-3.5 w-2/5" />
      <Skeleton className="h-3 w-3/5" />
    </div>
    <Skeleton className="h-6 w-20 rounded-full shrink-0" />
  </div>
);

interface Props { data: ApplicationHistoryData | undefined; loading: boolean }

const KpiApplicationHistory = memo<Props>(({ data, loading }) => {
  const { t } = useTranslation("dashboard");
  const items = data ?? [];

  return (
    <TooltipProvider>
      <ZoneHeading icon={HistoryOutlined} label={t("pages.kpi.zone1_title", "Recent Activity")} color="#7C3AED" />
      <Card className="flex-1 rounded-2xl overflow-hidden py-0 gap-0">
        {loading ? (
          <div className="divide-y divide-slate-100">
            {[0, 1, 2, 3].map((i) => <RowSkeleton key={i} />)}
          </div>
        ) : items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-[13px] text-slate-400">
            {t("pages.kpi.history_empty", "No recent activity yet")}
          </div>
        ) : (
          <div className="relative flex flex-col h-full">
            {items.map((item, idx) => {
              const meta   = STATUS_META[item.status];
              const Icon   = meta.icon;
              const initials = `${item.firstName[0] ?? ""}${item.lastName[0] ?? ""}`.toUpperCase();
              const isLast = idx === items.length - 1;
              return (
                <div key={item.id} className="group relative flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-slate-50/80">
                  {/* timeline rail */}
                  <div className="relative flex flex-col items-center shrink-0 self-stretch">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-[12px] ring-4 ring-white z-10"
                      style={{ background: meta.bg, color: meta.color }}
                    >
                      {initials || <Icon size={16} />}
                    </div>
                    {!isLast && <div className="w-px flex-1 bg-slate-100 mt-1" />}
                  </div>

                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-semibold text-[13px] text-slate-900 truncate">
                        {item.firstName} {item.lastName}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0">{timeAgo(item.date)}</span>
                    </div>
                    <div className="text-[11.5px] text-slate-400 truncate mt-0.5">
                      {t("pages.kpi.history_applied_to", "Applied to")} <span className="text-slate-500 font-medium">{item.postTitle}</span>
                    </div>
                    <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mt-1.5">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[10px] whitespace-nowrap cursor-help"
                            style={{ background: meta.bg, color: meta.color }}
                          >
                            <Icon size={11} />
                            {t(meta.labelKey)}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-55 text-center">
                          {t(meta.descKey)}
                        </TooltipContent>
                      </Tooltip>
                      {item.matchScore != null && (
                        <span className="text-[10px] font-semibold" style={{ color: item.status === "not_matched" ? "#EF4444" : "#0D9488" }}>
                          {t("pages.kpi.history_ai_match", "AI CV Match")} {item.matchScore}%
                          <span className="text-slate-400 font-medium">
                            {" "}({t("pages.kpi.history_threshold", "needs")} {item.matchThreshold}%+)
                          </span>
                        </span>
                      )}
                      {item.interviewScore != null && (
                        <span className="text-[10px] font-semibold text-violet-600">
                          {t("pages.kpi.history_interview_score", "Interview Score")} {item.interviewScore}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </TooltipProvider>
  );
});
KpiApplicationHistory.displayName = "KpiApplicationHistory";
export default KpiApplicationHistory;
