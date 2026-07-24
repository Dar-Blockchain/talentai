"use client";
import React, { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/modules/shared/ui/shadcn/skeleton";
import { CheckCircle2 as CheckCircleOutlined, TrendingUp as TrendingUpOutlined } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { KpiCard } from "../KpiAtoms";
import { ChartTooltip, GRAY } from "../../utils/kpiTokens";
import { useCampaignsAnalytics } from "../../hooks/useCampaignsAnalytics";

const fmtDate = (d: string) => {
  const parsed = new Date(d);
  return Number.isNaN(parsed.getTime()) ? d : parsed.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

const CampaignCompletionTrend = memo(() => {
  const { t } = useTranslation("dashboard");
  const { data, isLoading } = useCampaignsAnalytics();

  const trend = data?.trend ?? [];
  const chartData = useMemo(() => trend.map((p) => ({ ...p, label: fmtDate(p.date) })), [trend]);
  const totalInPeriod = useMemo(() => trend.reduce((sum, p) => sum + p.count, 0), [trend]);
  const completionRate = data?.participants.completionRate ?? 0;
  const isNoData = chartData.every((p) => p.count === 0);

  return (
    <KpiCard title={t("campaigns_dashboard.trend.title", "Completion Trend")} subtitle={t("campaigns_dashboard.trend.subtitle", "Campaign completions over the last 30 days")}>
      <div className="flex items-center gap-6 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
            <CheckCircleOutlined size={18} color="#10B981" />
          </div>
          <div>
            {isLoading ? <Skeleton className="h-6 w-10" /> : (
              <div className="font-extrabold text-xl text-slate-800 leading-none">{totalInPeriod}</div>
            )}
            <div className="text-[11px] text-slate-400 mt-0.5">{t("campaigns_dashboard.trend.completed", "Completed")}</div>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-sky-50 flex items-center justify-center shrink-0">
            <TrendingUpOutlined size={18} color="#0EA5E9" />
          </div>
          <div>
            {isLoading ? <Skeleton className="h-6 w-10" /> : (
              <div className="font-extrabold text-xl text-slate-800 leading-none">{completionRate}%</div>
            )}
            <div className="text-[11px] text-slate-400 mt-0.5">{t("campaigns_dashboard.stat.completion_rate", "Completion Rate")}</div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="w-full h-[160px] rounded-[10px]" />
      ) : isNoData ? (
        <div className="h-[160px] flex items-center justify-center">
          <span className="text-[0.82rem] text-slate-400">{t("campaigns_dashboard.trend.no_data", "No completions in this period")}</span>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="campaignTrendGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#10B981" stopOpacity={0.22} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis dataKey="label" tick={{ fontFamily: "Poppins", fontSize: 10, fill: GRAY }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fontFamily: "Poppins", fontSize: 10, fill: GRAY }} axisLine={false} tickLine={false} allowDecimals={false} />
            <RechartsTooltip {...ChartTooltip} labelFormatter={(v) => v} formatter={(v: any) => [v, t("campaigns_dashboard.trend.completed", "Completed")]} />
            <Area type="monotone" dataKey="count" stroke="#10B981" fill="url(#campaignTrendGrad)" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </KpiCard>
  );
});
CampaignCompletionTrend.displayName = "CampaignCompletionTrend";
export default CampaignCompletionTrend;
