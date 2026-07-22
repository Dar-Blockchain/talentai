"use client";
import React, { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/modules/shared/ui/shadcn/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/modules/shared/ui/shadcn/tooltip";
import { KpiCard, toApiRange, formatTrendDateRange, type TrendRangeTab } from "./KpiAtoms";
import { ChartTooltip, GRAY, GRAY2, T, T_DARK } from "../utils/kpiTokens";
import { useKpiHoursComparisonQuery } from "../queries";

// Each bar is stacked into its two hour components — same hue family per entity
// (gray = manual, teal = AI), darker shade for interview time (bottom segment),
// lighter shade for analysis (top segment) — so composition reads without adding
// a third categorical hue.
const MANUAL_INTERVIEW_COLOR = GRAY;   // darker gray
const MANUAL_ANALYSIS_COLOR  = GRAY2;  // lighter gray
const AI_INTERVIEW_COLOR     = T_DARK; // darker teal
const AI_ANALYSIS_COLOR      = T;      // lighter teal

interface Props { postId?: string; tab: TrendRangeTab; rangeValue: number }

// Human-readable duration: "1h 20m", "45m", or "1h" — never a raw decimal like "0.83h".
const formatDuration = (hours: number): string => {
  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

const fmtHours = (v: any, name: any) => [formatDuration(v), name] as [string, string];

// One row per metric (Manual / With TalentAI / Time Saved), each split into its
// two components (Interview Time | Analysis) side by side — instead of one big
// box per component, which would double the card count for no reason.
function SplitRow({
  label, borderClass, bgClass, valueColor, dotColor,
  leftLabel, leftValue, leftSub,
  rightLabel, rightValue, rightSub,
}: {
  label: string; borderClass: string; bgClass?: string; valueColor: string; dotColor: string;
  leftLabel: string; leftValue: string; leftSub: string;
  rightLabel: string; rightValue: string; rightSub: string;
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
    </div>
  );
}

// Value label on the top segment of the last bucket's bars only (not every bar —
// that would be chart-wide clutter; see dataviz "label selectively" rule). Shows
// the full stacked total (interview + analysis), not just the top segment's value.
const makeStackTotalLabel = (
  color: string, lastIndex: number, formatter: (v: number) => string,
  totalOf: (payload: any) => number,
) =>
  (props: any) => {
    const { x, y, width, index, payload } = props;
    if (index !== lastIndex || !payload) return null;
    const total = totalOf(payload);
    if (!total) return null;
    return (
      <text x={x + width / 2} y={y} dy={-6} textAnchor="middle" fontSize={10} fontWeight={700} fill={color} fontFamily="Poppins">
        {formatter(total)}
      </text>
    );
  };

const KpiManualVsTalentAiHours = memo<Props>(({ postId, tab, rangeValue }) => {
  const { t } = useTranslation("dashboard");

  const { data, isLoading: loading } = useKpiHoursComparisonQuery({ postId, ...toApiRange(tab, rangeValue) });

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

  // Per-bucket composition for the chart below: same two components as the cards
  // above (interview time, analysis), but plotted for every bucket in the range —
  // not just the latest one the cards summarize.
  const chartData = useMemo(() => trend.map((p) => ({
    ...p,
    manualInterviewHours: (p.interviewsCompleted * interviewDurationMinutes) / 60,
    manualAnalysisHours:  p.manualHours,
    aiInterviewHours:     0,
    aiAnalysisHours:      p.aiHours,
  })), [trend, interviewDurationMinutes]);

  const legendManual = t("hoursComparison.legend_manual", "Manual (by hand)");
  const legendAi      = t("hoursComparison.legend_ai", "With TalentAI");

  return (
    <KpiCard
      title={t("hoursComparison.title", "Hours needed: manual vs with TalentAI")}
      subtitle={dateRange || t("hoursComparison.subtitle_fallback", "Last months")}
    >
      <p className="text-[12px] text-slate-500 leading-snug mb-4">
        {t(
          "hoursComparison.description",
          "How many hours your team would spend screening the same CVs and interviews by hand each month, compared with letting TalentAI do it automatically."
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
            />
          )}
        </div>
        </TooltipProvider>
      )}

      {loading ? (
        <Skeleton className="w-full h-[160px] rounded-[10px]" />
      ) : isNoData ? (
        <div className="h-[160px] flex items-center justify-center">
          <span className="text-[0.82rem] text-slate-400">{t("hoursComparison.no_data", "No data yet")}</span>
        </div>
      ) : (
        <>
          <div className="mb-2 text-[11px] font-semibold text-slate-500">
            {t("hoursComparison.chart_title", "Breakdown over time: interview time vs. analysis")}
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
              <RechartsTooltip {...ChartTooltip} formatter={fmtHours} labelFormatter={(month: any) => month} />
              <Bar dataKey="manualInterviewHours" stackId="manual" fill={MANUAL_INTERVIEW_COLOR} stroke="#fff" strokeWidth={2} name={t("hoursComparison.chart_legend_manual_interview", "Manual — interview time")} />
              <Bar dataKey="manualAnalysisHours" stackId="manual" fill={MANUAL_ANALYSIS_COLOR} stroke="#fff" strokeWidth={2} radius={[4, 4, 0, 0]} name={t("hoursComparison.chart_legend_manual_analysis", "Manual — analysis")}
                label={makeStackTotalLabel(GRAY, chartData.length - 1, formatDuration, (p) => p.manualInterviewHours + p.manualAnalysisHours)}
              />
              <Bar dataKey="aiInterviewHours" stackId="ai" fill={AI_INTERVIEW_COLOR} stroke="#fff" strokeWidth={2} name={t("hoursComparison.chart_legend_ai_interview", "TalentAI — interview time")} />
              <Bar dataKey="aiAnalysisHours" stackId="ai" fill={AI_ANALYSIS_COLOR} stroke="#fff" strokeWidth={2} radius={[4, 4, 0, 0]} name={t("hoursComparison.chart_legend_ai_analysis", "TalentAI — analysis")}
                label={makeStackTotalLabel(T, chartData.length - 1, formatDuration, (p) => p.aiInterviewHours + p.aiAnalysisHours)}
              />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: MANUAL_INTERVIEW_COLOR }} />
              <span className="text-[0.7rem] text-slate-500 font-medium">{t("hoursComparison.chart_legend_manual_interview", "Manual — interview time")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: MANUAL_ANALYSIS_COLOR }} />
              <span className="text-[0.7rem] text-slate-500 font-medium">{t("hoursComparison.chart_legend_manual_analysis", "Manual — analysis")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: AI_INTERVIEW_COLOR }} />
              <span className="text-[0.7rem] text-slate-500 font-medium">{t("hoursComparison.chart_legend_ai_interview", "TalentAI — interview time")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: AI_ANALYSIS_COLOR }} />
              <span className="text-[0.7rem] text-slate-500 font-medium">{t("hoursComparison.chart_legend_ai_analysis", "TalentAI — analysis")}</span>
            </div>
          </div>
        </>
      )}
    </KpiCard>
  );
});
KpiManualVsTalentAiHours.displayName = "KpiManualVsTalentAiHours";
export default KpiManualVsTalentAiHours;
