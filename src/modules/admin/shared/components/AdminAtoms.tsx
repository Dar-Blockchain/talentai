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
    <Card className={cn("shadow-none", className)}>
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

/** Sticky table header cell — bold, flat neutral gray, sits above scrolling rows. */
export const ADMIN_TABLE_HEAD_CELL_SX = {
  fontWeight: 700,
  backgroundColor: "#F8FAFC",
  color: "#475569",
} as const;

/** Table row — zebra striping on even rows, neutral hover. */
export const ADMIN_TABLE_ROW_SX = {
  "&:nth-of-type(even)": { backgroundColor: "#FAFAFA" },
  "&:hover": { backgroundColor: "#F1F5F9 !important" },
} as const;

/** Tab-level page heading — bold black/gray title with a neutral underline, optional subtitle. */
export const AdminPageHeading = memo<{ title: string; subtitle?: string; gradient?: AdminGradientName }>(
  ({ title, subtitle }) => (
    <div className="mb-6">
      <h1 className="relative inline-block pb-2.5 text-[1.6rem] font-extrabold tracking-tight text-slate-900">
        {title}
        <span className="absolute bottom-0 left-0 h-[3px] w-12 rounded-full bg-slate-300" />
      </h1>
      {subtitle && <p className="mt-1.5 text-[13px] text-slate-500">{subtitle}</p>}
    </div>
  ),
);
AdminPageHeading.displayName = "AdminPageHeading";

/** Standard admin section header — neutral icon chip + title + flex-1 divider line. */
export const ZoneHeading = memo<{ icon: React.ElementType; label: string; gradient?: AdminGradientName }>(
  ({ icon: Icon, label }) => (
    <div className="flex items-center gap-3 mb-5 mt-1">
      <div className="w-8 h-8 rounded-[9px] flex items-center justify-center shrink-0" style={{ background: ADMIN_NEUTRAL_BG }}>
        <Icon style={{ fontSize: 17, color: ADMIN_NEUTRAL }} />
      </div>
      <span className="font-semibold text-[15px] text-slate-900 tracking-tight">{label}</span>
      <div className="flex-1 h-px bg-slate-200" />
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
    <Card className="shadow-none overflow-hidden">
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
    <Card className="group overflow-hidden shadow-none transition-all hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="flex items-center gap-3 py-4">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: ADMIN_NEUTRAL_BG }}>
          <Icon style={{ fontSize: 19, color: ADMIN_NEUTRAL }} />
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

/** Chart/section card wrapper — flat card, neutral icon-chip title row. */
export const AdminChartCard = memo<{ icon?: React.ElementType; title?: string; gradient?: AdminGradientName; children: React.ReactNode; className?: string }>(
  ({ icon: Icon, title, children, className }) => (
    <Card className={cn("shadow-none overflow-hidden transition-shadow hover:shadow-md", className)}>
      <CardContent className="pt-6">
        {title && (
          <div className="flex items-center gap-2 mb-5">
            {Icon && (
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: ADMIN_NEUTRAL_BG }}>
                <Icon style={{ fontSize: 17, color: ADMIN_NEUTRAL }} />
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
