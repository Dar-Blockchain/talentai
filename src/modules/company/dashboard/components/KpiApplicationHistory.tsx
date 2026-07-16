"use client";
import React, { memo } from "react";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/modules/shared/ui/shadcn/skeleton";
import { Card } from "@/modules/shared/ui/shadcn/card";
import { History as HistoryOutlined, UserPlus as UserPlusOutlined, Mail as MailOutlined, CheckCircle2 as CheckCircleOutlined, Award as AwardOutlined, XCircle as XCircleOutlined } from "lucide-react";
import { ZoneHeading } from "./KpiAtoms";
import { cn } from "@/lib/utils";
import type { ApplicationHistoryData } from "../types";

const STATUS_META = {
  applied:     { icon: UserPlusOutlined,    color: "#64748B", bg: "#F1F5F9", labelKey: "pages.kpi.history_applied" },
  invited:     { icon: MailOutlined,        color: "#0891B2", bg: "#ECFEFF", labelKey: "pages.kpi.history_invited" },
  completed:   { icon: CheckCircleOutlined, color: "#7C3AED", bg: "#F5F3FF", labelKey: "pages.kpi.history_completed" },
  shortlisted: { icon: AwardOutlined,       color: "#0D9488", bg: "#F0FDFA", labelKey: "pages.kpi.history_shortlisted" },
  rejected:    { icon: XCircleOutlined,     color: "#EF4444", bg: "#FEF2F2", labelKey: "pages.kpi.history_rejected" },
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
  <div className="flex items-center gap-3 py-3 px-4">
    <Skeleton className="w-10 h-10 rounded-full shrink-0" />
    <div className="flex-1 space-y-1.5">
      <Skeleton className="h-4 w-2/5" />
      <Skeleton className="h-3 w-3/5" />
    </div>
    <Skeleton className="h-6 w-14 rounded-full shrink-0" />
  </div>
);

interface Props { data: ApplicationHistoryData | undefined; loading: boolean }

const KpiApplicationHistory = memo<Props>(({ data, loading }) => {
  const { t } = useTranslation("dashboard");
  const items = data ?? [];

  return (
    <>
      <ZoneHeading icon={HistoryOutlined} label={t("pages.kpi.zone1_title", "Recent Activity")} color="#7C3AED" />
      <Card className="mb-8 overflow-hidden py-0 gap-0">
        {loading ? (
          <div className="divide-y divide-slate-100">
            {[0, 1, 2, 3].map((i) => <RowSkeleton key={i} />)}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-10 text-[13px] text-slate-400">
            {t("pages.kpi.history_empty", "No recent activity yet")}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {items.map((item) => {
              const meta   = STATUS_META[item.status];
              const Icon   = meta.icon;
              const initials = `${item.firstName[0] ?? ""}${item.lastName[0] ?? ""}`.toUpperCase();
              return (
                <div key={item.id} className="flex items-center gap-3 py-3 px-4 transition-colors hover:bg-slate-50/70">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-[13px]"
                    style={{ background: meta.bg, color: meta.color }}
                  >
                    {initials || <Icon size={17} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[13px] text-slate-900 truncate">
                      {item.firstName} {item.lastName}
                    </div>
                    <div className="text-[11.5px] text-slate-400 truncate">
                      {item.postTitle}
                      {item.matchScore != null && (
                        <span className="ml-1.5 font-semibold text-teal-600">&bull; {item.matchScore}% match</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span
                      className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[11px] whitespace-nowrap")}
                      style={{ background: meta.bg, color: meta.color }}
                    >
                      <Icon size={12} />
                      {t(meta.labelKey)}
                    </span>
                    <span className="text-[10px] text-slate-400">{timeAgo(item.date)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </>
  );
});
KpiApplicationHistory.displayName = "KpiApplicationHistory";
export default KpiApplicationHistory;
