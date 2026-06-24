"use client";
import React, { memo } from "react";
import { Card, CardContent } from "@/modules/shared/ui/shadcn/card";
import { Skeleton } from "@/modules/shared/ui/shadcn/skeleton";
import { Badge } from "@/modules/shared/ui/shadcn/badge";
import { cn } from "@/lib/utils";
import { ADMIN_ACCENT } from "../theme";

/** Sticky table header cell — bold, neutral, sits above scrolling rows. */
export const ADMIN_TABLE_HEAD_CELL_SX = {
  fontWeight: 600,
  backgroundColor: "#F8FAFC",
  color: "#475569",
} as const;

/** Table row — zebra striping on even rows, indigo-tinted hover. */
export const ADMIN_TABLE_ROW_SX = {
  "&:nth-of-type(even)": { backgroundColor: "#FAFBFF" },
  "&:hover": { backgroundColor: "#EEF2FF !important" },
} as const;

/** Tab-level page heading — bold title with an accent underline, optional subtitle. */
export const AdminPageHeading = memo<{ title: string; subtitle?: string }>(
  ({ title, subtitle }) => (
    <div className="mb-6">
      <h1 className="relative inline-block pb-2.5 text-[1.5rem] font-bold text-slate-900 tracking-tight">
        {title}
        <span className="absolute bottom-0 left-0 h-[3px] w-10 rounded-full" style={{ background: ADMIN_ACCENT }} />
      </h1>
      {subtitle && <p className="mt-1.5 text-[13px] text-slate-500">{subtitle}</p>}
    </div>
  ),
);
AdminPageHeading.displayName = "AdminPageHeading";

/** Standard admin section header — icon chip + title + flex-1 divider line. */
export const ZoneHeading = memo<{ icon: React.ElementType; label: string; color?: string }>(
  ({ icon: Icon, label, color = ADMIN_ACCENT }) => (
    <div className="flex items-center gap-3 mb-5 mt-1">
      <div className="w-8 h-8 rounded-[9px] flex items-center justify-center shrink-0" style={{ background: `${color}14` }}>
        <Icon style={{ fontSize: 17, color }} />
      </div>
      <span className="font-semibold text-[15px] text-slate-900 tracking-tight">{label}</span>
      <div className="flex-1 h-px bg-slate-200" />
    </div>
  ),
);
ZoneHeading.displayName = "ZoneHeading";

/** Small stat card: icon in an accent-tinted rounded square, big number, uppercase label. */
export interface AdminStatCardProps {
  icon:    React.ElementType;
  value:   React.ReactNode;
  label:   string;
  color?:  string;
  loading?: boolean;
}

export const AdminStatCard = memo<AdminStatCardProps>(({ icon: Icon, value, label, color = ADMIN_ACCENT, loading }) => {
  if (loading) return (
    <Card className="shadow-none">
      <CardContent className="flex items-center gap-3 py-4">
        <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
        <div className="flex-1 min-w-0 space-y-2">
          <Skeleton className="h-6 w-10" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Card className="group shadow-none transition-all hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="flex items-center gap-3 py-4">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105" style={{ background: `${color}14` }}>
          <Icon style={{ fontSize: 19, color }} />
        </div>
        <div className="min-w-0">
          <div className="text-[1.35rem] font-bold text-slate-900 leading-none tabular-nums">{value}</div>
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-1 truncate">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
});
AdminStatCard.displayName = "AdminStatCard";

/** Chart/section card wrapper — flat Card with optional icon-chip title row. */
export const AdminChartCard = memo<{ icon?: React.ElementType; title?: string; color?: string; children: React.ReactNode; className?: string }>(
  ({ icon: Icon, title, color = ADMIN_ACCENT, children, className }) => (
    <Card className={cn("shadow-none", className)}>
      <CardContent className="pt-6">
        {title && (
          <div className="flex items-center gap-2 mb-5">
            {Icon && (
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}14` }}>
                <Icon style={{ fontSize: 17, color }} />
              </div>
            )}
            <span className="font-semibold text-[15px] text-slate-900">{title}</span>
          </div>
        )}
        {children}
      </CardContent>
    </Card>
  ),
);
AdminChartCard.displayName = "AdminChartCard";

/** Labelled icon row used inside detail dialogs (avatar/email/date rows, etc). */
export const InfoRow = memo<{ icon: React.ReactNode; label: string; value: string; mono?: boolean }>(
  ({ icon, label, value, mono }) => (
    <div className="flex items-center gap-3 py-[9.6px]">
      <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-[11px] text-slate-500 uppercase tracking-wide">{label}</div>
        <div className={cn("text-[13px] font-medium text-slate-900 truncate", mono && "font-mono text-[12px]")}>
          {value}
        </div>
      </div>
    </div>
  ),
);
InfoRow.displayName = "InfoRow";

/** Score-based status badge mapper: >=70 success, >=50 warning, else destructive tint. */
export const scoreTone = (score: number) => {
  if (score >= 70) return { color: "#10B981", bg: "#ECFDF5", label: "Excellent" };
  if (score >= 50) return { color: "#F59E0B", bg: "#FFFBEB", label: "Satisfactory" };
  return { color: "#EF4444", bg: "#FEF2F2", label: "Needs Work" };
};

export const ScoreBadge = memo<{ score: number; className?: string }>(({ score, className }) => {
  const tone = scoreTone(score);
  return (
    <Badge
      variant="outline"
      className={cn("border-transparent font-semibold", className)}
      style={{ background: tone.bg, color: tone.color }}
    >
      {score.toFixed(1)}%
    </Badge>
  );
});
ScoreBadge.displayName = "ScoreBadge";
