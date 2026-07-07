"use client";
import React, { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/modules/shared/ui/shadcn/skeleton";
import { TrendingUp as TrendingUpOutlined } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from "recharts";
import { ZoneHeading, KpiCard, Delta, MetricRow } from "./KpiAtoms";
import { ChartTooltip, GRAY, T, passRate } from "../utils/kpiTokens";
import type { KpiFunnelData } from "../types";

const OPACITIES  = ["FF", "AA", "77"] as const;
const STEP_KEYS  = ["funnel_applied", "funnel_completed", "funnel_shortlisted"] as const;

const fmtTick = (t: (k: string) => string) => (k: string) => t(`pages.kpi.${k}`);

const StepSkeleton = () => (
  <div className="flex-1 min-w-[calc(50%-8px)] md:min-w-0 border border-slate-200 rounded-[14px] p-4 sm:p-5 space-y-2">
    <Skeleton className="h-3 w-16 rounded" />
    <Skeleton className="h-9 w-12 rounded" />
    <div className="flex gap-2">
      <Skeleton className="h-5 w-9 rounded-full" />
      <Skeleton className="h-5 w-12 rounded-full" />
    </div>
    <Skeleton className="h-1 w-full rounded-full" />
  </div>
);

interface Props { data: KpiFunnelData | undefined; loading: boolean }

const KpiRecruitmentFunnel = memo<Props>(({ data, loading }) => {
  const { t } = useTranslation("dashboard");

  const applied     = data?.applied     ?? 0;
  const completed   = data?.completed   ?? 0;
  const shortlisted = data?.shortlisted ?? 0;

  const steps = useMemo(() => [
    { key: STEP_KEYS[0], value: applied     },
    { key: STEP_KEYS[1], value: completed   },
    { key: STEP_KEYS[2], value: shortlisted },
  ], [applied, completed, shortlisted]);

  const tickFmt = fmtTick(t);

  return (
    <>
      <ZoneHeading icon={TrendingUpOutlined} label={t("pages.kpi.zone3_title")} color="#10B981" />
      <KpiCard className="mb-4">
        <div className="flex gap-3 sm:gap-4 mb-6 flex-wrap md:flex-nowrap">
          {loading
            ? STEP_KEYS.map((k) => <StepSkeleton key={k} />)
            : steps.map((step, i) => {
                const rate    = i > 0 && applied > 0 ? Math.min(Math.round((step.value / applied) * 100), 100) : null;
                const fillPct = applied > 0 ? Math.round((step.value / applied) * 100) : 0;
                return (
                  <div key={step.key} className="flex-1 min-w-[calc(50%-8px)] md:min-w-0">
                    <div className="border border-slate-200 rounded-[14px] p-4 sm:p-5 h-full" style={{ background: i === 0 ? `${T}06` : "#fff" }}>
                      <div className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-[0.08em] mb-2">
                        {t(`pages.kpi.${step.key}`)}
                      </div>
                      <div className="font-extrabold text-2xl sm:text-[1.8rem] text-slate-900 leading-none">{step.value}</div>
                      <div className="mt-2 flex items-center gap-2 flex-wrap">
                        {rate !== null && (
                          <span className="font-bold text-[0.6rem] px-1.5 py-0.5 rounded-full" style={{ background: `${T}12`, color: T }}>
                            {rate}%
                          </span>
                        )}
                        <Delta cur={step.value} prev={step.value} />
                      </div>
                      <div className="mt-3 h-1 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${fillPct}%`, background: `${T}${OPACITIES[i]}` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
        </div>

        <div className="flex flex-col md:flex-row gap-5">
          <div className="flex-1 min-w-0">
            {loading ? (
              <Skeleton className="w-full h-[190px] rounded-[10px]" />
            ) : (
              <ResponsiveContainer width="100%" height={190}>
                <BarChart data={steps} barSize={40}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="key" tickFormatter={tickFmt} tick={{ fontFamily: "Poppins", fontSize: 11, fill: GRAY }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontFamily: "Poppins", fontSize: 11, fill: GRAY }} axisLine={false} tickLine={false} />
                  <RechartsTooltip {...ChartTooltip} formatter={(v: any) => [v, ""]} labelFormatter={tickFmt} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {steps.map((_, i) => <Cell key={i} fill={`${T}${OPACITIES[i]}`} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="w-full md:w-[220px] shrink-0 bg-slate-50 border border-slate-200 rounded-[14px] p-4 flex flex-col justify-center">
            <div className="font-bold text-[0.7rem] text-slate-400 uppercase tracking-[0.07em] mb-3">
              {t("pages.kpi.key_metrics")}
            </div>
            {loading ? (
              [0, 1, 2].map((i) => (
                <div key={i} className="py-3 border-b border-slate-100 last:border-0">
                  <Skeleton className="h-5 w-full rounded" />
                </div>
              ))
            ) : (
              <>
                <MetricRow label={t("pages.kpi.completed_rate")}  value={passRate(completed, applied)}   color="#7C3AED" />
                <MetricRow label={t("pages.kpi.shortlist_rate")}  value={passRate(shortlisted, applied)} color="#F59E0B" />
                <MetricRow label={t("pages.kpi.hire_conversion")} value={passRate(shortlisted, applied)} color="#10B981" last />
              </>
            )}
          </div>
        </div>
      </KpiCard>
    </>
  );
});
KpiRecruitmentFunnel.displayName = "KpiRecruitmentFunnel";
export default KpiRecruitmentFunnel;
