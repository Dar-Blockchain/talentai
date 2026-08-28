"use client";
import React, { memo, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import { Skeleton } from "@/modules/shared/ui/shadcn/skeleton";
import { CheckCircle2 as CheckCircleOutlined, TrendingUp as TrendingUpOutlined } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from "recharts";
import { KpiCard, TrendRangeFilter, toApiRange, type TrendRangeTab } from "../KpiAtoms";
import { ChartTooltip, GRAY } from "../../utils/kpiTokens";
import { useCampaignsAnalytics } from "../../hooks/useCampaignsAnalytics";

interface TrendPoint { period: string; count: number }

const sel = (r: any) => r.data?.data ?? r.data;
const fetchCompletionsTrend = (unit: "day" | "month", value: number) =>
  axiosInstance.get("internal-campaigns/completions-trend", { params: { unit, value } }).then(sel);

const CampaignCompletionsTrend = memo(() => {
  const { t } = useTranslation("dashboard");
  const [tab, setTab] = useState<TrendRangeTab>("day");
  const [rangeValue, setRangeValue] = useState(30);
  const { unit, value } = toApiRange(tab, rangeValue);

  const { data, isLoading } = useQuery({
    queryKey: ["campaignsDashboard", "completionsTrend", unit, value],
    queryFn: () => fetchCompletionsTrend(unit, value),
    staleTime: 60_000,
  });
  const { data: analytics } = useCampaignsAnalytics();

  const trend: TrendPoint[] = data?.trend ?? [];
  const totalInPeriod = useMemo(() => trend.reduce((sum, p) => sum + p.count, 0), [trend]);
  const completionRate = analytics?.participants.completionRate ?? 0;
  const isNoData = trend.length > 0 && trend.every((p) => p.count === 0);

  return (
    <KpiCard
      title={t("campaigns_dashboard.completions_trend.title", "Completions")}
      subtitle={t("campaigns_dashboard.completions_trend.subtitle", "Campaign completions over time")}
      headerFilter={<TrendRangeFilter tab={tab} value={rangeValue} onChange={(t, v) => { setTab(t); setRangeValue(v); }} />}
    >
      <div className="flex items-center gap-6 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
            <CheckCircleOutlined size={18} color="#10B981" />
          </div>
          <div>
            {isLoading ? <Skeleton className="h-6 w-10" /> : (
              <div className="font-extrabold text-xl text-slate-800 leading-none">{totalInPeriod}</div>
            )}
            <div className="text-[11px] text-slate-400 mt-0.5">{t("campaigns_dashboard.completions_trend.completed", "Completed")}</div>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-sky-50 flex items-center justify-center shrink-0">
            <TrendingUpOutlined size={18} color="#0EA5E9" />
          </div>
          <div>
            <div className="font-extrabold text-xl text-slate-800 leading-none">{completionRate}%</div>
            <div className="text-[11px] text-slate-400 mt-0.5">{t("campaigns_dashboard.stat.completion_rate", "Completion Rate")}</div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="w-full h-[180px] rounded-[10px]" />
      ) : isNoData ? (
        <div className="h-[180px] flex items-center justify-center">
          <span className="text-[0.82rem] text-slate-400">{t("campaigns_dashboard.completions_trend.no_data", "No completions in this period")}</span>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={trend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis dataKey="period" tick={{ fontFamily: "Poppins", fontSize: 10, fill: GRAY }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fontFamily: "Poppins", fontSize: 10, fill: GRAY }} axisLine={false} tickLine={false} allowDecimals={false} />
            <RechartsTooltip {...ChartTooltip} labelFormatter={(v) => v} formatter={(v: any) => [v, t("campaigns_dashboard.completions_trend.completed", "Completed")]} />
            <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={28}>
              {trend.map((_, i) => <Cell key={i} fill="#10B981" fillOpacity={0.85} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </KpiCard>
  );
});
CampaignCompletionsTrend.displayName = "CampaignCompletionsTrend";
export default CampaignCompletionsTrend;
