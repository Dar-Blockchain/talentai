"use client";
import React, { memo, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/modules/shared/ui/shadcn/skeleton";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/modules/shared/ui/shadcn/tooltip";
import { KpiCard, toApiRange, formatTrendDateRange, type TrendRangeTab } from "./KpiAtoms";
import { GRAY2, T } from "../utils/kpiTokens";
import { useKpiCostComparisonQuery } from "../queries";

const MANUAL_COLOR = GRAY2;
const AI_COLOR      = T;

interface Props { postId?: string; tab: TrendRangeTab; rangeValue: number }

const KpiManualVsTalentAiCost = memo<Props>(({ postId, tab, rangeValue }) => {
  const { t } = useTranslation("dashboard");
  // Hover feedback without a floating tooltip — a tooltip that follows the
  // cursor would sit right on top of the center label on a donut this small.
  // Dimming the other slice + bolding the matching legend row instead.
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // A light summary card: shares the range filter with the Hours card it sits
  // beside (same tab/rangeValue), but only ever shows the latest point in that
  // range — the full per-bucket breakdown lives in the Hours card's chart.
  const { data, isLoading: loading } = useKpiCostComparisonQuery({ postId, ...toApiRange(tab, rangeValue) });

  const currency = data?.currency ?? "USD";
  const formatCost = useMemo(() => {
    const fmt = new Intl.NumberFormat(undefined, {
      style: "currency", currency, maximumFractionDigits: 0,
    });
    return (v: number) => fmt.format(v);
  }, [currency]);
  const trend = data?.trend ?? [];
  const dateRange = useMemo(() => formatTrendDateRange(trend, tab, rangeValue), [trend, tab, rangeValue]);
  const latest = trend.length ? trend[trend.length - 1] : null;
  const isNoData = !latest || (latest.manualCost === 0 && latest.aiCost === 0);

  const legendManual = t("costComparison.legend_manual", "Manual (by hand)");
  const legendAi      = t("costComparison.legend_ai", "With TalentAI");

  const pieData = latest
    ? [
        { key: "manual", name: legendManual, value: latest.manualCost, color: MANUAL_COLOR },
        { key: "ai",     name: legendAi,     value: latest.aiCost,     color: AI_COLOR },
      ]
    : [];

  const costSaved = latest ? latest.costSaved : null;

  return (
    <KpiCard
      title={t("costComparison.title", "Cost needed: manual vs with TalentAI")}
      subtitle={dateRange || t("costComparison.subtitle_fallback", "This month")}
    >
      <p className="text-[12px] text-slate-500 leading-snug mb-4">
        {t(
          "costComparison.description",
          "How much your team would spend screening the same CVs and interviews by hand each month, compared with letting TalentAI do it automatically."
        )}
      </p>

      {loading ? (
        <div className="flex flex-col items-center py-4">
          <Skeleton className="h-[160px] w-[160px] rounded-full" />
          <Skeleton className="h-3 w-32 rounded mt-4" />
        </div>
      ) : isNoData ? (
        <div className="h-[200px] flex items-center justify-center">
          <span className="text-[0.82rem] text-slate-400">{t("costComparison.no_data", "No data yet")}</span>
        </div>
      ) : (
        <>
          <div className="relative">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={78}
                  paddingAngle={3}
                  stroke="#fff"
                  strokeWidth={2}
                  isAnimationActive={false}
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  {pieData.map((entry, i) => (
                    <Cell
                      key={entry.key}
                      fill={entry.color}
                      opacity={activeIndex === null || activeIndex === i ? 1 : 0.35}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {activeIndex != null && pieData[activeIndex] && (
              // Pinned to a corner instead of following the cursor — a Recharts
              // Tooltip that tracks the mouse would land on top of the center
              // label on a donut this small, so it's fixed here instead.
              <div className="absolute top-0 right-0 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 shadow-md pointer-events-none">
                <div className="text-[10px] text-slate-500">{pieData[activeIndex].name}</div>
                <div className="text-[13px] font-bold" style={{ color: pieData[activeIndex].color }}>
                  {formatCost(pieData[activeIndex].value)}
                </div>
              </div>
            )}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className={cn("text-[1.6rem] font-extrabold leading-none", costSaved != null && costSaved >= 0 ? "text-emerald-600" : "text-red-500")}>
                {costSaved != null ? formatCost(Math.abs(costSaved)) : "—"}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                {costSaved != null && costSaved >= 0
                  ? t("costComparison.pie_saved_sub", "saved with TalentAI")
                  : t("costComparison.pie_added_sub", "extra cost this month")}
              </div>
            </div>
          </div>

          <TooltipProvider delayDuration={150}>
          <div className="flex flex-col gap-2 mt-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={cn("flex items-center justify-between rounded-md px-1 -mx-1 transition-colors cursor-help", activeIndex === 0 && "bg-slate-50")}
                  onMouseEnter={() => setActiveIndex(0)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: MANUAL_COLOR }} />
                    <span className="text-[12px] text-slate-500 border-b border-dashed border-slate-300">{legendManual}</span>
                  </div>
                  <span className="text-[12px] font-semibold text-slate-700">{formatCost(latest!.manualCost)}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-56 text-center">
                {t("costComparison.breakdown_manual", "{{iv}} candidates × {{rate}}", {
                  iv: latest!.interviewsCompleted, rate: formatCost(data?.manualCostPerCandidate ?? 0),
                })}
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={cn("flex items-center justify-between rounded-md px-1 -mx-1 transition-colors cursor-help", activeIndex === 1 && "bg-teal-50/60")}
                  onMouseEnter={() => setActiveIndex(1)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: AI_COLOR }} />
                    <span className="text-[12px] text-slate-500 border-b border-dashed border-slate-300">{legendAi}</span>
                  </div>
                  <span className="text-[12px] font-semibold text-teal-700">{formatCost(latest!.aiCost)}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-56 text-center">
                {t("costComparison.breakdown_ai", "{{iv}} candidates × {{rate}}", {
                  iv: latest!.interviewsCompleted, rate: formatCost(data?.aiCostPerInterview ?? 0),
                })}
              </TooltipContent>
            </Tooltip>
          </div>
          </TooltipProvider>
        </>
      )}
    </KpiCard>
  );
});
KpiManualVsTalentAiCost.displayName = "KpiManualVsTalentAiCost";
export default KpiManualVsTalentAiCost;
