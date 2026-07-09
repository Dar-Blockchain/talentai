"use client";
import React, { memo } from "react";
import { ArrowUp as ArrowUpwardOutlined, ArrowDown as ArrowDownwardOutlined, Minus as RemoveOutlined } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/modules/shared/ui/shadcn/card";
import { Badge } from "@/modules/shared/ui/shadcn/badge";
import { cn } from "@/lib/utils";

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
    <div className="flex items-center gap-3 mb-5 mt-1">
      <div className="w-8 h-8 rounded-[9px] flex items-center justify-center shrink-0" style={{ background: `${color}18` }}>
        <Icon size={17} color={color} />
      </div>
      <span className="font-semibold text-[15px] text-slate-900 tracking-tight">{label}</span>
      <div className="flex-1 h-px bg-slate-200" />
    </div>
  ),
);
ZoneHeading.displayName = "ZoneHeading";

export const KpiCard = memo<{ title?: string; subtitle?: string; children: React.ReactNode; className?: string }>(
  ({ title, subtitle, children, className }) => (
    <Card className={cn("rounded-2xl", className)}>
      {title && (
        <CardHeader className="pb-0">
          <CardTitle className="font-semibold text-[15px] text-slate-900">{title}</CardTitle>
          {subtitle && <CardDescription className="text-[13px] text-slate-500">{subtitle}</CardDescription>}
        </CardHeader>
      )}
      <CardContent className={cn(!title && "pt-6")}>{children}</CardContent>
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
