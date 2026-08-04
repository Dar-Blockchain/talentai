"use client";
import React, { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/modules/shared/ui/shadcn/skeleton";
import { TrendingUp as TrendingUpOutlined } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { ZoneHeading, KpiCard, Delta } from "./KpiAtoms";
import { ChartTooltip, GRAY, T } from "../utils/kpiTokens";
import type { KpiFunnelData } from "../types";

const OPACITIES  = ["FF", "AA", "77"] as const;
const STEP_KEYS  = ["funnel_applied", "funnel_completed", "funnel_shortlisted"] as const;
const TREND_KEYS = ["applied", "completed", "shortlisted"] as const;

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

  const trend   = data?.trend ?? [];
  const seriesLabel = (key: string) => t(`pages.kpi.funnel_${key}`);

  // Real month-over-month comparison (current month's bucket vs the one before
  // it), instead of comparing a value to itself.
  const currentMonth  = trend[trend.length - 1];
  const previousMonth = trend[trend.length - 2];

  const SERIES_COLORS: Record<(typeof TREND_KEYS)[number], string> = {
    applied:     T,
    completed:   "#7C3AED",
    shortlisted: "#F59E0B",
  };

  return (
    <>
      <ZoneHeading icon={TrendingUpOutlined} label={t("pages.kpi.zone3_title")} color="#10B981" />
      <KpiCard className="flex-1">
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
                        {currentMonth && previousMonth && (
                          <Delta
                            cur={currentMonth[TREND_KEYS[i]] ?? 0}
                            prev={previousMonth[TREND_KEYS[i]] ?? 0}
                          />
                        )}
                      </div>
                      <div className="mt-3 h-1 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${fillPct}%`, background: `${T}${OPACITIES[i]}` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
        </div>

        {loading ? (
          <Skeleton className="w-full h-[190px] rounded-[10px]" />
        ) : trend.length === 0 ? (
          <div className="h-[190px] flex items-center justify-center">
            <span className="text-[0.82rem] text-slate-400">{t("pages.kpi.funnel_trend_empty", "No data yet")}</span>
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={190}>
              <LineChart data={trend} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontFamily: "Poppins", fontSize: 11, fill: GRAY }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontFamily: "Poppins", fontSize: 11, fill: GRAY }} axisLine={false} tickLine={false} allowDecimals={false} />
                <RechartsTooltip {...ChartTooltip} formatter={(v: any, key: any) => [v, seriesLabel(key)]} cursor={{ stroke: "#E2E8F0", strokeWidth: 1 }} />
                {TREND_KEYS.map((key) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    name={key}
                    stroke={SERIES_COLORS[key]}
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 0 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
            <div className="flex gap-5 mt-3 flex-wrap">
              {TREND_KEYS.map((key) => (
                <div key={key} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: SERIES_COLORS[key] }} />
                  <span className="text-[0.72rem] text-slate-500 font-medium">{seriesLabel(key)}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </KpiCard>
    </>
  );
});
KpiRecruitmentFunnel.displayName = "KpiRecruitmentFunnel";
export default KpiRecruitmentFunnel;
