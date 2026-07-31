"use client";
import React, { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/modules/shared/ui/shadcn/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import type { TooltipProps } from "recharts";
import type { Props as RechartsLabelProps } from "recharts/types/component/Label";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/modules/shared/ui/shadcn/tooltip";
import { KpiCard, TrendRangeFilter, toApiRange, formatTrendDateRange, type TrendRangeTab } from "./KpiAtoms";
import { ChartTooltip, GRAY, GRAY2, T, WHITE } from "../utils/kpiTokens";
import { useKpiHoursComparisonQuery, useKpiCostComparisonQuery } from "../queries";
import type { CostTrendPoint } from "../types";

// One solid color per entity — matches the condensed tooltip (one line per
// entity, not split into interview/analysis), so the chart and the tooltip
// agree on what they're showing. The interview/analysis split still lives in
// the cards above, in full detail.
const MANUAL_COLOR = GRAY2;
const AI_COLOR      = T;
const SAVED_COLOR   = "#10B981"; // same emerald as the Time Saved card

interface Props {
  postId?: string; tab: TrendRangeTab; rangeValue: number;
  onRangeChange: (tab: TrendRangeTab, value: number) => void;
  createdAt?: string | null;
}

interface ChartDatum {
  month: string;
  manualTotalHours: number;
  aiTotalHours: number;
  savedTotalHours: number;
}

// Human-readable duration: "1h 20m", "45m", or "1h" — never a raw decimal like "0.83h".
const formatDuration = (hours: number): string => {
  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

// One row per metric (Manual / With TalentAI / Time Saved), each split into its
// two hour components (Interview Time | Analysis) side by side, plus an optional
// cost line spanning the full card — the cost card this used to be a separate
// card for is folded in here instead of duplicating the whole layout.
function SplitRow({
  label, borderClass, bgClass, valueColor, dotColor,
  leftLabel, leftValue, leftSub,
  rightLabel, rightValue, rightSub,
  costLabel, costValue, costSub,
}: {
  label: string; borderClass: string; bgClass?: string; valueColor: string; dotColor: string;
  leftLabel: string; leftValue: string; leftSub: string;
  rightLabel: string; rightValue: string; rightSub: string;
  costLabel?: string; costValue?: string; costSub?: string;
}) {
  return (
    <div className={cn("h-full rounded-2xl border p-4 transition-shadow duration-150 hover:shadow-sm", borderClass, bgClass)}>
      <div className="flex items-center gap-1.5 mb-3">
        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: dotColor }} />
        <span className="text-[10.5px] font-bold uppercase tracking-wider" style={{ color: valueColor }}>{label}</span>
      </div>
      <div className="grid grid-cols-2 divide-x divide-slate-200/70">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="pr-3 cursor-help">
              <div className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide leading-tight mb-1 min-h-[22px] flex items-end">{leftLabel}</div>
              <div
                className="text-[17px] font-extrabold leading-none tabular-nums inline-block border-b border-dashed border-slate-300"
                style={{ color: valueColor }}
              >
                {leftValue}
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-56 text-center">{leftSub}</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="pl-3 cursor-help">
              <div className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide leading-tight mb-1 min-h-[22px] flex items-end">{rightLabel}</div>
              <div
                className="text-[17px] font-extrabold leading-none tabular-nums inline-block border-b border-dashed border-slate-300"
                style={{ color: valueColor }}
              >
                {rightValue}
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-56 text-center">{rightSub}</TooltipContent>
        </Tooltip>
      </div>
      {costValue != null && (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="mt-3 pt-3 border-t border-dashed border-slate-200 flex items-center justify-between cursor-help">
              <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide">{costLabel}</span>
              <span
                className="text-[13px] font-extrabold tabular-nums border-b border-dashed border-slate-300"
                style={{ color: valueColor }}
              >
                {costValue}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-56 text-center">{costSub}</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}

// Value label on the top segment of the last bucket's bars only (not every bar —
// that would be chart-wide clutter; see dataviz "label selectively" rule). Shows
// the full stacked total (interview + analysis), not just the top segment's value.
const makeStackTotalLabel = (
  color: string, lastIndex: number, formatter: (v: number) => string,
  totalOf: (payload: ChartDatum) => number,
) =>
  function StackTotalLabel(props: RechartsLabelProps) {
    const { x = 0, y = 0, width = 0, index = 0, payload } = props as RechartsLabelProps & { payload?: ChartDatum };
    if (index !== lastIndex || !payload) return null;
    const total = totalOf(payload);
    if (!total) return null;
    return (
      <text x={Number(x) + Number(width) / 2} y={Number(y)} dy={-6} textAnchor="middle" fontSize={10} fontWeight={700} fill={color} fontFamily="Poppins">
        {formatter(total)}
      </text>
    );
  };

const KpiManualVsTalentAiHours = memo<Props>(({ postId, tab, rangeValue, onRangeChange, createdAt }) => {
  const { t } = useTranslation("dashboard");

  const { data, isLoading: loading } = useKpiHoursComparisonQuery({ postId, ...toApiRange(tab, rangeValue) });
  // Same range as the hours query — the cost card was merged into this one, so
  // its numbers ride along on the same filter instead of a separate fetch/card.
  const { data: costData } = useKpiCostComparisonQuery({ postId, ...toApiRange(tab, rangeValue) });

  const trend = data?.trend ?? [];
  const isNoData = trend.every((p) => p.manualHours === 0 && p.aiHours === 0);

  const dateRange = useMemo(() => formatTrendDateRange(trend, tab, rangeValue), [trend, tab, rangeValue]);

  const pctSaved = useMemo(() => {
    const last = [...trend].reverse().find((p) => p.manualHours > 0);
    if (!last) return null;
    return Math.round((1 - last.aiHours / last.manualHours) * 100);
  }, [trend]);

  // Absolute time saved/added, not just a percentage — "you saved 3h 40m" is what
  // actually answers "how much time did I save", the % is secondary context.
  const savedHours = useMemo(() => {
    const last = [...trend].reverse().find((p) => p.manualHours > 0 || p.aiHours > 0);
    if (!last) return null;
    return last.manualHours - last.aiHours;
  }, [trend]);

  const latest = trend.length ? trend[trend.length - 1] : null;

  // Interview time (separate from analysis above): with TalentAI the AI conducts
  // the interview itself, so none of it comes out of the recruiter's own calendar.
  // Without TalentAI, the recruiter must personally sit through every interview.
  const interviewDurationMinutes = data?.interviewDurationMinutes ?? 40;
  const interviewMinutesWithout = latest ? latest.interviewsCompleted * interviewDurationMinutes : null;

  // ── Cost, merged in from the old standalone cost card ──────────────────────
  const currency = costData?.currency ?? "USD";
  const formatCost = useMemo(() => {
    const fmt = new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 0 });
    return (v: number) => fmt.format(v);
  }, [currency]);

  const costTrend = costData?.trend ?? [];
  const latestCost = costTrend.length ? costTrend[costTrend.length - 1] : null;
  const costSaved  = latestCost ? latestCost.costSaved  : null;
  const gapPercent = latestCost ? latestCost.gapPercent : null;

  // Month → cost point, so the chart tooltip can show $ alongside hours for
  // whichever month is being hovered.
  const costByMonth = useMemo(() => {
    const map = new Map<string, CostTrendPoint>();
    costTrend.forEach((p) => map.set(p.month, p));
    return map;
  }, [costTrend]);

  // One solid total per entity per bucket — matches the single-color bars and
  // the condensed tooltip. Every bucket in the selected range keeps its own
  // x-axis label (day/month/year, whatever the filter is set to), even ones
  // with no activity — dropping those collapsed the axis down to a single
  // category and left the chart mostly empty space.
  const chartData = useMemo(() => trend.map((p) => ({
    month: p.month,
    manualTotalHours: (p.interviewsCompleted * interviewDurationMinutes) / 60 + p.manualHours,
    aiTotalHours:     p.aiHours,
    savedTotalHours:  Math.max(0, (p.interviewsCompleted * interviewDurationMinutes) / 60 + p.manualHours - p.aiHours),
  })), [trend, interviewDurationMinutes]);

  const legendManual = t("hoursComparison.legend_manual", "Manual (by hand)");
  const legendAi      = t("hoursComparison.legend_ai", "With TalentAI");
  const legendSaved   = t("hoursComparison.legend_saved", "Time Saved");

  // Custom tooltip instead of the default formatter — one line per entity
  // (Manual / TalentAI / Time Saved), hours and cost inline together, mirroring
  // the three solid bars exactly. Full interview/analysis detail stays in the
  // cards above instead of being repeated here.
  const ChartTooltipContent = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (!active || !payload?.length) return null;
    const row  = payload[0]?.payload as ChartDatum | undefined;
    const cost = label != null ? costByMonth.get(String(label)) : undefined;
    if (!row) return null;
    return (
      <div style={{ ...ChartTooltip.contentStyle, backgroundColor: WHITE, opacity: 1 }} className="px-3.5 py-2.5 min-w-52">
        <div className="font-semibold text-slate-800 mb-2 text-[13px]">{label}</div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-5">
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2 h-2 rounded-sm shrink-0" style={{ backgroundColor: MANUAL_COLOR }} />
              {legendManual}
            </span>
            <span className="font-bold text-slate-900 tabular-nums">
              {formatDuration(row.manualTotalHours)}{cost ? ` · ${formatCost(cost.manualCost)}` : ""}
            </span>
          </div>
          <div className="flex items-center justify-between gap-5">
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2 h-2 rounded-sm shrink-0" style={{ backgroundColor: AI_COLOR }} />
              {legendAi}
            </span>
            <span className="font-bold text-slate-900 tabular-nums">
              {formatDuration(row.aiTotalHours)}{cost ? ` · ${formatCost(cost.aiCost)}` : ""}
            </span>
          </div>
          <div className="flex items-center justify-between gap-5">
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2 h-2 rounded-sm shrink-0" style={{ backgroundColor: SAVED_COLOR }} />
              {legendSaved}
            </span>
            <span className="font-bold text-slate-900 tabular-nums">
              {formatDuration(row.savedTotalHours)}{cost && cost.costSaved > 0 ? ` · ${formatCost(cost.costSaved)}` : ""}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <KpiCard
      title={t("hoursComparison.title", "Time & cost saved: manual vs with TalentAI")}
      subtitle={dateRange || t("hoursComparison.subtitle_fallback", "Last months")}
      headerFilter={<TrendRangeFilter tab={tab} value={rangeValue} onChange={onRangeChange} createdAt={createdAt} />}
    >
      <p className="text-[12px] text-slate-500 leading-snug mb-4">
        {t(
          "hoursComparison.description",
          "How many hours and how much your team would spend screening the same CVs and interviews by hand each month, compared with letting TalentAI do it automatically."
        )}
      </p>

      {!loading && !isNoData && latest && (
        <TooltipProvider delayDuration={150}>
        <div className="grid grid-cols-3 gap-3 mb-4 items-stretch">
          <SplitRow
            label={legendManual}
            borderClass="border-slate-200"
            valueColor="#475569"
            dotColor={GRAY}
            leftLabel={t("hoursComparison.interview_time_title", "Interview Time")}
            leftValue={interviewMinutesWithout != null ? formatDuration(interviewMinutesWithout / 60) : "—"}
            leftSub={t("hoursComparison.interview_time_manual_sub", "{{iv}} interviews × {{min}}m", {
              iv: latest.interviewsCompleted, min: interviewDurationMinutes,
            })}
            rightLabel={t("hoursComparison.analysis_title", "Analysis: CV & Evaluation")}
            rightValue={formatDuration(latest.manualHours)}
            rightSub={t("hoursComparison.breakdown_manual", "{{cvs}} CVs × 7m + {{iv}} interviews × 10m", {
              cvs: latest.cvsAnalyzed, iv: latest.interviewsCompleted,
            })}
            costLabel={t("hoursComparison.cost_label", "Cost")}
            costValue={latestCost ? formatCost(latestCost.manualCost) : undefined}
            costSub={t("hoursComparison.cost_manual_sub", "{{iv}} candidates × {{rate}}", {
              iv: latest.interviewsCompleted, rate: formatCost(costData?.manualCostPerCandidate ?? 0),
            })}
          />
          <SplitRow
            label={legendAi}
            borderClass="border-teal-100"
            bgClass="bg-teal-50/60"
            valueColor="#0D9488"
            dotColor={T}
            leftLabel={t("hoursComparison.interview_time_title", "Interview Time")}
            leftValue="0m"
            leftSub={t("hoursComparison.interview_time_ai_sub", "AI conducts the interview")}
            rightLabel={t("hoursComparison.analysis_title", "Analysis: CV & Evaluation")}
            rightValue={formatDuration(latest.aiHours)}
            rightSub={t("hoursComparison.breakdown_ai", "{{cvs}} CVs × 0.2m + {{iv}} interviews × 1m", {
              cvs: latest.cvsAnalyzed, iv: latest.interviewsCompleted,
            })}
            costLabel={t("hoursComparison.cost_label", "Cost")}
            costValue={latestCost ? formatCost(latestCost.aiCost) : undefined}
            costSub={t("hoursComparison.cost_ai_sub", "{{iv}} candidates × {{rate}}", {
              iv: latest.interviewsCompleted, rate: formatCost(costData?.aiCostPerInterview ?? 0),
            })}
          />
          {savedHours != null && (
            <SplitRow
              label={savedHours >= 0 ? t("hoursComparison.legend_saved", "Time Saved") : t("hoursComparison.legend_added", "Time Added")}
              borderClass={savedHours >= 0 ? "border-emerald-100" : "border-red-100"}
              bgClass={savedHours >= 0 ? "bg-emerald-50/60" : "bg-red-50/60"}
              valueColor={savedHours >= 0 ? "#10B981" : "#EF4444"}
              dotColor={savedHours >= 0 ? "#10B981" : "#EF4444"}
              leftLabel={t("hoursComparison.interview_time_title", "Interview Time")}
              leftValue={interviewMinutesWithout != null ? formatDuration(interviewMinutesWithout / 60) : "—"}
              leftSub={t("hoursComparison.this_month", "this month")}
              rightLabel={t("hoursComparison.analysis_title", "Analysis: CV & Evaluation")}
              rightValue={formatDuration(Math.abs(savedHours))}
              rightSub={pctSaved != null
                ? (savedHours >= 0
                    ? t("hoursComparison.saved_pct", "{{pct}}% less time", { pct: pctSaved })
                    : t("hoursComparison.added_pct", "{{pct}}% more time", { pct: Math.abs(pctSaved) }))
                : t("hoursComparison.this_month", "this month")}
              costLabel={costSaved != null && costSaved >= 0
                ? t("hoursComparison.cost_saved_label", "Cost saved")
                : t("hoursComparison.cost_added_label", "Cost added")}
              costValue={costSaved != null ? formatCost(Math.abs(costSaved)) : undefined}
              costSub={gapPercent != null
                ? (costSaved != null && costSaved >= 0
                    ? t("hoursComparison.cost_saved_sub", "{{pct}}% less cost using TalentAI", { pct: gapPercent })
                    : t("hoursComparison.cost_added_sub", "{{pct}}% more cost using TalentAI", { pct: Math.abs(gapPercent) }))
                : t("hoursComparison.this_month", "this month")}
            />
          )}
        </div>
        </TooltipProvider>
      )}

      {loading ? (
        <Skeleton className="w-full h-[160px] rounded-[10px]" />
      ) : (
        <>
          <div className="mb-2 flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-semibold text-slate-500">
              {t("hoursComparison.chart_title", "Trend over time: manual vs. TalentAI vs. time saved")}
            </span>
            {isNoData && (
              <span className="text-[10.5px] text-slate-400">
                · {t("hoursComparison.no_data", "No data yet")}
              </span>
            )}
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chartData} margin={{ top: 24, right: 12, left: 4, bottom: 0 }} barGap={4} barCategoryGap="24%">
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontFamily: "Poppins", fontSize: 11, fill: GRAY }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide domain={[0, "dataMax"]} />
              {/* Pinned near the top of the chart instead of trailing the cursor's Y —
                  this tooltip is tall (hours + cost rows), so following the hovered
                  bar's exact vertical position could push it past the bottom of the
                  viewport and force a page scroll. A subtle cursor fill instead of
                  Recharts' default opaque gray highlight rectangle, which otherwise
                  reads like a large, meaningless block behind the bars. */}
              <RechartsTooltip
                content={<ChartTooltipContent />}
                position={{ y: -10 }}
                wrapperStyle={{ zIndex: 20 }}
                cursor={{ fill: GRAY2, fillOpacity: 0.15 }}
              />
              <Bar dataKey="manualTotalHours" fill={MANUAL_COLOR} radius={[4, 4, 0, 0]} name={legendManual}
                label={makeStackTotalLabel(GRAY, chartData.length - 1, formatDuration, (p) => p.manualTotalHours)}
              />
              <Bar dataKey="aiTotalHours" fill={AI_COLOR} radius={[4, 4, 0, 0]} name={legendAi}
                label={makeStackTotalLabel(T, chartData.length - 1, formatDuration, (p) => p.aiTotalHours)}
              />
              <Bar dataKey="savedTotalHours" fill={SAVED_COLOR} radius={[4, 4, 0, 0]} name={legendSaved}
                label={makeStackTotalLabel(SAVED_COLOR, chartData.length - 1, formatDuration, (p) => p.savedTotalHours)}
              />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: MANUAL_COLOR }} />
              <span className="text-[0.7rem] text-slate-500 font-medium">{legendManual}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: AI_COLOR }} />
              <span className="text-[0.7rem] text-slate-500 font-medium">{legendAi}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: SAVED_COLOR }} />
              <span className="text-[0.7rem] text-slate-500 font-medium">{legendSaved}</span>
            </div>
          </div>
        </>
      )}
    </KpiCard>
  );
});
KpiManualVsTalentAiHours.displayName = "KpiManualVsTalentAiHours";
export default KpiManualVsTalentAiHours;
