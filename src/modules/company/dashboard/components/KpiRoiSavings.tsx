"use client";
import React, { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/modules/shared/ui/shadcn/skeleton";
import { PiggyBank as SavingsOutlined } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { ZoneHeading, KpiCard, MetricRow } from "./KpiAtoms";
import { ChartTooltip, GRAY, T } from "../utils/kpiTokens";
import type { KpiRoiData } from "../types";

const BASELINE = 35;
const fmt = (v: number | null) => v != null ? `€${v}` : "—";
const fmtDay = (v: any) => [`${v}d`, ""] as [string, string];

interface Props { data: KpiRoiData | undefined; loading: boolean }

const KpiRoiSavings = memo<Props>(({ data, loading }) => {
  const { t } = useTranslation("dashboard");

  const chartData = useMemo(() =>
    (data?.trend ?? []).map((p) => ({ month: p.month, tth: p.tth, baseline: BASELINE })),
  [data?.trend]);

  const [minY, maxY] = useMemo(() => {
    const vals = (data?.trend ?? []).map((p) => p.tth).filter((v): v is number => v !== null);
    return vals.length
      ? [Math.floor(Math.min(...vals, BASELINE) * 0.75), Math.ceil(Math.max(...vals, BASELINE) * 1.2)]
      : [10, 50];
  }, [data?.trend]);

  const isNoData       = chartData.every((p) => p.tth === null);
  const savedHoursText = `${data?.completedInterviews ?? 0} ${t("pages.kpi.saved_hours_formula")}`;
  const legendTalentai = t("pages.kpi.legend_talentai");
  const legendBaseline = t("pages.kpi.legend_baseline");

  return (
    <>
      <ZoneHeading icon={SavingsOutlined} label={t("pages.kpi.zone7_title")} color="#7C3AED" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6 mb-6">

        <div className="md:col-span-1 flex flex-col gap-4">
          <div className="border border-teal-200 rounded-[18px] p-5 bg-gradient-to-br from-teal-50 to-emerald-50">
            <div className="text-[0.68rem] font-bold text-teal-600 uppercase tracking-[0.08em] mb-2">{t("pages.kpi.saved_hours_label")}</div>
            {loading
              ? <Skeleton className="h-12 w-20 rounded" />
              : <div className="font-extrabold text-[2.8rem] text-teal-800 leading-none">{data?.savedHours != null ? `${data.savedHours}h` : "—"}</div>}
            <div className="text-[0.72rem] text-slate-400 mt-1">
              {loading ? <Skeleton className="h-3 w-40 rounded" /> : savedHoursText}
            </div>
          </div>

          <div className="border border-slate-200 rounded-[18px] p-5 bg-white flex-1">
            <div className="font-bold text-[0.7rem] text-slate-400 uppercase tracking-[0.07em] mb-4">{t("pages.kpi.costs_label")}</div>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-9 w-full rounded-lg" />
                <Skeleton className="h-9 w-full rounded-lg" />
              </div>
            ) : (
              <>
                <MetricRow label={t("pages.kpi.cost_per_hire")}      value={fmt(data?.costPerHire ?? null)}        sub={t("pages.kpi.cost_per_hire_sub")}      color="#7C3AED" />
                <MetricRow label={t("pages.kpi.cost_per_shortlist")} value={fmt(data?.costPerShortlisted ?? null)} sub={t("pages.kpi.cost_per_shortlist_sub")} color="#0891B2" last />
              </>
            )}
          </div>
        </div>

        <div className="md:col-span-3">
          <KpiCard title={t("pages.kpi.chart_title")} subtitle={t("pages.kpi.chart_subtitle")}>
            {loading ? (
              <Skeleton className="w-full h-[230px] rounded-[10px]" />
            ) : isNoData ? (
              <div className="h-[230px] flex items-center justify-center">
                <span className="text-[0.82rem] text-slate-400">No data yet</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={230}>
                <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="roiTthGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={T}        stopOpacity={0.18} />
                      <stop offset="95%" stopColor={T}        stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="roiBaseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#94A3B8" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#94A3B8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontFamily: "Poppins", fontSize: 11, fill: GRAY }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontFamily: "Poppins", fontSize: 11, fill: GRAY }} axisLine={false} tickLine={false} domain={[minY, maxY]} unit="d" />
                  <RechartsTooltip {...ChartTooltip} formatter={fmtDay} />
                  <Area type="monotone" dataKey="baseline" stroke="#94A3B8" fill="url(#roiBaseGrad)" strokeWidth={1.5} strokeDasharray="5 4" name={legendBaseline} dot={false} connectNulls />
                  <Area type="monotone" dataKey="tth"      stroke={T}        fill="url(#roiTthGrad)"  strokeWidth={2.5} name={legendTalentai} dot={{ r: 4, fill: "#fff", stroke: T, strokeWidth: 2 }} activeDot={{ r: 5 }} connectNulls />
                </AreaChart>
              </ResponsiveContainer>
            )}
            <div className="flex gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-[18px] h-[2.5px] rounded bg-teal-600" />
                <span className="text-[0.72rem] text-slate-500 font-medium">{legendTalentai}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-[18px] border-t border-dashed border-slate-400" />
                <span className="text-[0.72rem] text-slate-500 font-medium">{legendBaseline}</span>
              </div>
            </div>
          </KpiCard>
        </div>
      </div>
    </>
  );
});
KpiRoiSavings.displayName = "KpiRoiSavings";
export default KpiRoiSavings;
