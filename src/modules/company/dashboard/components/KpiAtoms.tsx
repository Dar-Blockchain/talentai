"use client";
import React, { memo } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { ArrowUp as ArrowUpwardOutlined, ArrowDown as ArrowDownwardOutlined, Minus as RemoveOutlined, ChevronRight as ArrowForwardIosRounded } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/modules/shared/ui/shadcn/card";
import { Badge } from "@/modules/shared/ui/shadcn/badge";
import { Skeleton } from "@/modules/shared/ui/shadcn/skeleton";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { cn } from "@/lib/utils";
import type { TrendRangeUnit } from "../types";

// ── Days / Months / Years trend filter ──────────────────────────────────────────
// Shared by the Manual-vs-TalentAI hours & cost cards. "Years" is UI sugar: it
// still asks the backend for monthly buckets (a 1-3 point line wouldn't show a
// usable trend), just over a bigger month count — see `toApiRange`.

export type TrendRangeTab = "day" | "month" | "year";

const TAB_OPTIONS: { tab: TrendRangeTab; labelKey: string; labelDefault: string; values: number[]; suffix: string }[] = [
  { tab: "day",   labelKey: "trendRangeFilter.days",   labelDefault: "Days",   values: [7, 14, 30],   suffix: "d" },
  { tab: "month", labelKey: "trendRangeFilter.months", labelDefault: "Months", values: [3, 6, 9, 12], suffix: "M" },
  { tab: "year",  labelKey: "trendRangeFilter.years",  labelDefault: "Years",  values: [1, 2, 3],     suffix: "Y" },
];

export const toApiRange = (tab: TrendRangeTab, value: number): { unit: TrendRangeUnit; value: number } =>
  tab === "year" ? { unit: "month", value: value * 12 } : { unit: tab, value };

// Shared "May – Jul 2026" / "Jul 2026" subtitle formatting for any trend array
// with a `month` field — used by both the hours and cost cards so a synced
// range filter reads identically on both.
export const formatTrendDateRange = (
  trend: { month: string }[], tab: TrendRangeTab, rangeValue: number,
): string => {
  if (!trend.length) return "";
  const showYear = tab === "month" && rangeValue <= 12;
  const year = new Date().getFullYear();
  if (trend.length === 1) return showYear ? `${trend[0].month} ${year}` : trend[0].month;
  return showYear
    ? `${trend[0].month} – ${trend[trend.length - 1].month} ${year}`
    : `${trend[0].month} – ${trend[trend.length - 1].month}`;
};

export const TrendRangeFilter = memo<{
  tab: TrendRangeTab;
  value: number;
  onChange: (tab: TrendRangeTab, value: number) => void;
}>(({ tab, value, onChange }) => {
  const { t } = useTranslation("dashboard");
  const active = TAB_OPTIONS.find((o) => o.tab === tab) ?? TAB_OPTIONS[1];
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-0.5">
        {TAB_OPTIONS.map((opt) => (
          <Button
            key={opt.tab}
            size="xs"
            variant={tab === opt.tab ? "default" : "ghost"}
            onClick={() => onChange(opt.tab, opt.values[0])}
            className={cn(
              "rounded-full h-6 px-2.5 text-[11px] font-semibold transition-all duration-150",
              tab !== opt.tab && "text-slate-500 hover:text-slate-700 hover:bg-slate-100",
            )}
          >
            {t(opt.labelKey, opt.labelDefault)}
          </Button>
        ))}
      </div>
      <div className="w-px h-4 bg-slate-200 hidden sm:block" />
      <div className="flex items-center gap-0.5">
        {active.values.map((v) => (
          <Button
            key={v}
            size="xs"
            variant={value === v ? "default" : "ghost"}
            onClick={() => onChange(tab, v)}
            className={cn(
              "rounded-full h-6 px-2 text-[11px] font-semibold transition-all duration-150",
              value !== v && "text-slate-500 hover:text-slate-700 hover:bg-slate-100",
            )}
          >
            {v}{active.suffix}
          </Button>
        ))}
      </div>
    </div>
  );
});
TrendRangeFilter.displayName = "TrendRangeFilter";

export const Delta = memo<{ cur: number; prev: number }>(({ cur, prev }) => {
  const d = cur - prev;
  if (d === 0) return (
    <Badge variant="outline" className="gap-0.5 text-[11px] font-semibold text-slate-400 border-slate-200 bg-slate-100">
      <RemoveOutlined size={11} />stable
    </Badge>
  );
  const up = d > 0;
  return (
    <Badge variant="outline" className={cn("gap-0.5 text-[11px] font-bold border-transparent", up ? "bg-emerald-50 text-emerald-500" : "bg-red-50 text-red-500")}>
      {up ? <ArrowUpwardOutlined size={11} /> : <ArrowDownwardOutlined size={11} />}
      {up ? "+" : ""}{d}
    </Badge>
  );
});
Delta.displayName = "Delta";

export const ZoneHeading = memo<{ icon: React.ElementType; label: string; color?: string }>(
  ({ icon: Icon, label, color = "#0D9488" }) => (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-8 h-8 rounded-[9px] flex items-center justify-center shrink-0" style={{ background: `${color}18` }}>
        <Icon size={17} color={color} />
      </div>
      <span className="font-semibold text-[15px] text-slate-900 tracking-tight">{label}</span>
      <div className="flex-1 h-px bg-slate-200" />
    </div>
  ),
);
ZoneHeading.displayName = "ZoneHeading";

export const KpiCard = memo<{ title?: string; subtitle?: string; children: React.ReactNode; className?: string; contentClassName?: string }>(
  ({ title, subtitle, children, className, contentClassName }) => (
    <Card className={cn("rounded-2xl", className)}>
      {title && (
        <CardHeader className="pb-0">
          <CardTitle className="font-semibold text-[15px] text-slate-900">{title}</CardTitle>
          {subtitle && <CardDescription className="text-[13px] text-slate-500">{subtitle}</CardDescription>}
        </CardHeader>
      )}
      <CardContent className={cn(!title && "pt-6", contentClassName)}>{children}</CardContent>
    </Card>
  ),
);
KpiCard.displayName = "KpiCard";

export const ActionCard = memo<{
  icon: React.ElementType; label: string; value: number;
  color: string; bg: string; trend: number; note: string;
}>(({ icon: Icon, label, value, color, bg, trend, note }) => (
  <Card className="rounded-2xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
    <CardContent>
      <div className="flex items-start justify-between mb-3">
        <div className="w-11 h-11 rounded-[13px] flex items-center justify-center" style={{ background: bg }}>
          <Icon size={22} color={color} />
        </div>
        <Delta cur={value} prev={value - trend} />
      </div>
      <div className="text-[2rem] font-extrabold text-slate-900 leading-none">{value}</div>
      <div className="text-[13px] font-semibold text-slate-600 mt-1.5 mb-0.5">{label}</div>
      <div className="text-[11px] text-slate-400">{note}</div>
    </CardContent>
  </Card>
));
ActionCard.displayName = "ActionCard";

export const MetricRow = memo<{ label: string; value: string | number; sub?: string; color?: string; last?: boolean }>(
  ({ label, value, sub, color = "#0D9488", last }) => (
    <div className={cn("flex items-center justify-between py-3", !last && "border-b border-slate-100")}>
      <span className="text-[13px] text-slate-500">{label}</span>
      <div className="text-right">
        <span className="font-bold text-[15px]" style={{ color }}>{value}</span>
        {sub && <div className="text-[11px] text-slate-400">{sub}</div>}
      </div>
    </div>
  ),
);
MetricRow.displayName = "MetricRow";

export interface StatCardProps {
  icon:    React.ElementType;
  color:   string;
  bg:      string;
  value:   React.ReactNode;
  label:   string;
  loading: boolean;
  href?:   string;
}

export const StatCard = memo<StatCardProps>(({ icon: Icon, color, bg, value, label, loading, href }) => {
  const router = useRouter();
  const clickable = !!href;

  if (loading) return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm p-4">
      <div className="flex items-start gap-3">
        <Skeleton className="w-11 h-11 rounded-xl shrink-0" />
        <div className="flex-1 space-y-2 pt-0.5">
          <Skeleton className="h-7 w-14" />
          <Skeleton className="h-3 w-4/5" />
        </div>
      </div>
    </div>
  );

  return (
    <div
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={clickable ? () => router.push(href!) : undefined}
      onKeyDown={clickable ? (e) => e.key === "Enter" && router.push(href!) : undefined}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm p-4 transition-all duration-200",
        clickable && "cursor-pointer hover:shadow-lg hover:-translate-y-0.5 hover:border-slate-200"
      )}
    >
      <div className="flex items-start gap-3 mt-1">
        {/* icon bubble */}
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110"
          style={{ background: bg }}
        >
          <Icon size={22} color={color} />
        </div>

        {/* text */}
        <div className="flex-1 min-w-0">
          <div className="text-2xl font-black text-slate-800 leading-none tabular-nums tracking-tight">
            {value}
          </div>
          <div className="text-[11px] font-semibold text-slate-400 mt-1.5 leading-snug uppercase tracking-wide">
            {label}
          </div>
        </div>

        {/* arrow for clickable cards */}
        {clickable && (
          <ArrowForwardIosRounded
            size={13}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-slate-300 shrink-0 mt-0.5"
          />
        )}
      </div>

      {/* subtle hover overlay */}
      {clickable && (
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none rounded-2xl"
          style={{ background: `${bg}33` }}
        />
      )}
    </div>
  );
});
StatCard.displayName = "StatCard";
