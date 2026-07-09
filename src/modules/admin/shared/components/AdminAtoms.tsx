"use client";
import React, { memo } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/modules/shared/ui/shadcn/card";
import { Skeleton } from "@/modules/shared/ui/shadcn/skeleton";
import { Badge } from "@/modules/shared/ui/shadcn/badge";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { cn } from "@/lib/utils";
import { ADMIN_NEUTRAL, ADMIN_NEUTRAL_BG } from "../theme";

/** Inline retry button shared by the card and table-row error states. */
const AdminRetryButton = memo<{ onRetry: () => void }>(({ onRetry }) => (
  <Button
    variant="ghost"
    onClick={onRetry}
    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-700 hover:bg-slate-50"
  >
    <RefreshCw size={14} />
    Retry
  </Button>
));
AdminRetryButton.displayName = "AdminRetryButton";

/** Card-shaped error state for a failed query — distinct from "no data" empty states. */
export const AdminQueryError = memo<{ message?: string; onRetry: () => void; className?: string }>(
  ({ message = "Failed to load data.", onRetry, className }) => (
    <Card className={cn("border-none shadow-[0_1px_2px_rgba(15,23,42,0.04)]", className)}>
      <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
        <AlertCircle size={28} className="text-red-400" />
        <p className="text-[13px] text-slate-500">{message}</p>
        <AdminRetryButton onRetry={onRetry} />
      </CardContent>
    </Card>
  ),
);
AdminQueryError.displayName = "AdminQueryError";

/** Error state sized to drop into a table-cell colSpan slot. */
export const AdminTableErrorRow = memo<{ message?: string; onRetry: () => void }>(
  ({ message = "Failed to load data.", onRetry }) => (
    <div className="flex flex-col items-center justify-center gap-2 py-6">
      <div className="flex items-center gap-2">
        <AlertCircle size={16} className="text-red-400" />
        <span className="text-[13px] text-slate-500">{message}</span>
      </div>
      <AdminRetryButton onRetry={onRetry} />
    </div>
  ),
);
AdminTableErrorRow.displayName = "AdminTableErrorRow";

/** Tab-level page heading — bold title, light subtitle. */
export const AdminPageHeading = memo<{ title: string; subtitle?: string }>(
  ({ title, subtitle }) => (
    <div className="mb-7">
      <h1 className="text-[1.5rem] font-semibold tracking-tight text-slate-900">{title}</h1>
      {subtitle && <p className="mt-1 text-[13px] text-slate-500">{subtitle}</p>}
    </div>
  ),
);
AdminPageHeading.displayName = "AdminPageHeading";

/** Standard admin section header — neutral icon chip + title + divider. */
export const ZoneHeading = memo<{ icon: React.ElementType; label: string }>(
  ({ icon: Icon, label }) => (
    <div className="flex items-center gap-3 mb-5 mt-1">
      <div className="w-8 h-8 rounded-[9px] flex items-center justify-center shrink-0" style={{ background: ADMIN_NEUTRAL_BG }}>
        <Icon size={17} color={ADMIN_NEUTRAL} />
      </div>
      <span className="font-semibold text-[15px] text-slate-900 tracking-tight">{label}</span>
      <div className="flex-1 h-px bg-slate-200" />
    </div>
  ),
);
ZoneHeading.displayName = "ZoneHeading";

/** Small stat card: neutral icon chip, big number, uppercase label. */
export interface AdminStatCardProps {
  icon:     React.ElementType;
  value:    React.ReactNode;
  label:    string;
  loading?: boolean;
}

export const AdminStatCard = memo<AdminStatCardProps>(({ icon: Icon, value, label, loading }) => {
  if (loading) return (
    <Card className="border-none overflow-hidden">
      <CardContent className="flex items-center gap-3 py-4">
        <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
        <div className="flex-1 min-w-0 space-y-2">
          <Skeleton className="h-6 w-10" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Card className="group overflow-hidden border-none transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-4px_rgba(15,23,42,0.08),0_2px_6px_rgba(15,23,42,0.04)]">
      <CardContent className="flex items-center gap-3 py-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ADMIN_NEUTRAL_BG }}>
          <Icon size={18} color={ADMIN_NEUTRAL} />
        </div>
        <div className="min-w-0">
          <div className="text-[1.4rem] font-bold text-slate-900 leading-none tabular-nums tracking-tight">{value}</div>
          <div className="text-[10.5px] font-medium text-slate-400 uppercase tracking-wider mt-1.5 truncate">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
});
AdminStatCard.displayName = "AdminStatCard";

/** Chart/section card wrapper — soft elevation, optional icon-chip title row. */
export const AdminChartCard = memo<{ icon?: React.ElementType; title?: string; children: React.ReactNode; className?: string }>(
  ({ icon: Icon, title, children, className }) => (
    <Card className={cn("border-none overflow-hidden transition-shadow duration-200 hover:shadow-[0_8px_24px_-4px_rgba(15,23,42,0.08),0_2px_6px_rgba(15,23,42,0.04)]", className)}>
      <CardContent className="pt-6">
        {title && (
          <div className="flex items-center gap-2.5 mb-5">
            {Icon && (
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: ADMIN_NEUTRAL_BG }}>
                <Icon size={16} color={ADMIN_NEUTRAL} />
              </div>
            )}
            <span className="font-semibold text-[14.5px] text-slate-900">{title}</span>
          </div>
        )}
        {children}
      </CardContent>
    </Card>
  ),
);
AdminChartCard.displayName = "AdminChartCard";

/** Labelled icon row used inside detail dialogs. */
export const InfoRow = memo<{ icon: React.ReactNode; label: string; value: string; mono?: boolean }>(
  ({ icon, label, value, mono }) => (
    <div className="flex items-center gap-3 py-[10px]">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: ADMIN_NEUTRAL_BG }}>
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

/** Score-based tone mapper: >=70 excellent, >=50 satisfactory, else needs work. */
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
