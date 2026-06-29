"use client";
import React, { memo } from "react";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Card, CardContent } from "@/modules/shared/ui/shadcn/card";
import { Skeleton } from "@/modules/shared/ui/shadcn/skeleton";
import { Badge } from "@/modules/shared/ui/shadcn/badge";
import { cn } from "@/lib/utils";
import { ADMIN_ACCENT, ADMIN_NEUTRAL, ADMIN_NEUTRAL_BG, ADMIN_GRADIENTS, AdminGradientName, adminGradientCss, adminGlowShadow } from "../theme";

/** Inline retry button shared by the card and table-row error states. */
const AdminRetryButton = memo<{ onRetry: () => void }>(({ onRetry }) => (
  <button
    onClick={onRetry}
    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-700 transition-colors hover:bg-slate-50"
  >
    <RefreshIcon style={{ fontSize: 14 }} />
    Retry
  </button>
));
AdminRetryButton.displayName = "AdminRetryButton";

/** Card-shaped error state for a failed query — distinct from "no data" empty states. */
export const AdminQueryError = memo<{ message?: string; onRetry: () => void; className?: string }>(
  ({ message = "Failed to load data.", onRetry, className }) => (
    <Card className={cn("border-none shadow-[0_1px_2px_rgba(15,23,42,0.04)]", className)}>
      <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
        <ErrorOutlineIcon sx={{ fontSize: 28 }} className="text-red-400" />
        <p className="text-[13px] text-slate-500">{message}</p>
        <AdminRetryButton onRetry={onRetry} />
      </CardContent>
    </Card>
  ),
);
AdminQueryError.displayName = "AdminQueryError";

/** Error state sized to drop into a <TableRow><TableCell colSpan={n}> slot. */
export const AdminTableErrorRow = memo<{ message?: string; onRetry: () => void }>(
  ({ message = "Failed to load data.", onRetry }) => (
    <div className="flex flex-col items-center justify-center gap-2 py-6">
      <div className="flex items-center gap-2">
        <ErrorOutlineIcon sx={{ fontSize: 16 }} className="text-red-400" />
        <span className="text-[13px] text-slate-500">{message}</span>
      </div>
      <AdminRetryButton onRetry={onRetry} />
    </div>
  ),
);
AdminTableErrorRow.displayName = "AdminTableErrorRow";

/** Sticky table header cell — medium-weight neutral gray, sits above scrolling rows. */
export const ADMIN_TABLE_HEAD_CELL_SX = {
  fontWeight: 600,
  backgroundColor: "#FAFBFC",
  color: "#64748B",
  borderBottom: "1px solid #EEF1F5",
} as const;

/** Table row — hover-only highlight, no zebra striping (cleaner, less busy). */
export const ADMIN_TABLE_ROW_SX = {
  "& td": { borderBottom: "1px solid #F1F4F8" },
  "&:hover": { backgroundColor: "#FAFBFC !important" },
  "&:last-of-type td": { borderBottom: "none" },
} as const;

/** Tab-level page heading — bold title, light subtitle, no underline rule
 *  (clean Linear-style heading instead of an underlined tab look). */
export const AdminPageHeading = memo<{ title: string; subtitle?: string; gradient?: AdminGradientName }>(
  ({ title, subtitle }) => (
    <div className="mb-7">
      <h1 className="text-[1.5rem] font-semibold tracking-tight text-slate-900">
        {title}
      </h1>
      {subtitle && <p className="mt-1 text-[13px] text-slate-500">{subtitle}</p>}
    </div>
  ),
);
AdminPageHeading.displayName = "AdminPageHeading";

/** Standard admin section header — neutral icon chip + title, no divider line
 *  (the surrounding card edge already provides separation). */
export const ZoneHeading = memo<{ icon: React.ElementType; label: string; gradient?: AdminGradientName }>(
  ({ icon: Icon, label }) => (
    <div className="flex items-center gap-2.5 mb-5 mt-1">
      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: ADMIN_NEUTRAL_BG }}>
        <Icon style={{ fontSize: 15, color: ADMIN_NEUTRAL }} />
      </div>
      <span className="font-semibold text-[14px] text-slate-900 tracking-tight">{label}</span>
    </div>
  ),
);
ZoneHeading.displayName = "ZoneHeading";

/** Small stat card: neutral icon chip, big number, uppercase label. */
export interface AdminStatCardProps {
  icon:    React.ElementType;
  value:   React.ReactNode;
  label:   string;
  gradient?: AdminGradientName;
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
          <Icon style={{ fontSize: 18, color: ADMIN_NEUTRAL }} />
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

/** Chart/section card wrapper — soft elevation, neutral icon-chip title row. */
export const AdminChartCard = memo<{ icon?: React.ElementType; title?: string; gradient?: AdminGradientName; children: React.ReactNode; className?: string }>(
  ({ icon: Icon, title, children, className }) => (
    <Card className={cn("border-none overflow-hidden transition-shadow duration-200 hover:shadow-[0_8px_24px_-4px_rgba(15,23,42,0.08),0_2px_6px_rgba(15,23,42,0.04)]", className)}>
      <CardContent className="pt-6">
        {title && (
          <div className="flex items-center gap-2.5 mb-5">
            {Icon && (
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: ADMIN_NEUTRAL_BG }}>
                <Icon style={{ fontSize: 16, color: ADMIN_NEUTRAL }} />
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

/** Labelled icon row used inside detail dialogs (avatar/email/date rows, etc). */
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
