"use client";
import React, { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import { Skeleton } from "@/modules/shared/ui/shadcn/skeleton";
import { UserPlus as PersonAddOutlined, Mail as MailOutlined } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { KpiCard } from "../KpiAtoms";
import { ChartTooltip, GRAY } from "../../utils/kpiTokens";

const STALE = 60_000;

interface TrendPoint { date: string; count: number }

interface MemberStatsResponse {
  total?: number;
  memberships?: { total?: number; trend?: TrendPoint[] };
  invitations?: { total?: number };
}

// The API sometimes wraps the payload (`{ stats: T }` / `{ data: T }`) and
// sometimes returns `T` directly, so we accept `unknown` here and cast to
// the declared shape.
const selMember = (r: { data: unknown }): MemberStatsResponse => {
  const body = r.data as { stats?: MemberStatsResponse; data?: MemberStatsResponse } | undefined;
  return (body?.stats ?? body?.data ?? body) as MemberStatsResponse;
};
const fetchMemberStats = () => axiosInstance.get("company-memberships/memberships/stats").then(selMember);

const fmtDate = (d: string) => {
  const parsed = new Date(d);
  return Number.isNaN(parsed.getTime()) ? d : parsed.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

const TeamGrowthChart = memo(() => {
  const { t } = useTranslation("dashboard");
  const { data, isLoading } = useQuery({ queryKey: ["teamDashboard", "memberStats"], queryFn: fetchMemberStats, staleTime: STALE });

  const trend: TrendPoint[] = data?.memberships?.trend ?? [];
  const chartData = useMemo(() => trend.map((p) => ({ ...p, label: fmtDate(p.date) })), [trend]);
  const totalMembers = data?.memberships?.total ?? data?.total ?? 0;
  const pendingInvitations = data?.invitations?.total ?? 0;
  const isNoData = chartData.every((p) => p.count === 0);

  return (
    <KpiCard title={t("team.growth.title", "Team Growth")} subtitle={t("team.growth.subtitle", "New members over the last 30 days")}>
      <div className="flex items-center gap-6 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
            <PersonAddOutlined size={18} color="#A855F7" />
          </div>
          <div>
            {isLoading ? <Skeleton className="h-6 w-10" /> : (
              <div className="font-extrabold text-xl text-slate-800 leading-none">{totalMembers}</div>
            )}
            <div className="text-[11px] text-slate-400 mt-0.5">{t("team.growth.total_members", "Total members")}</div>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
            <MailOutlined size={18} color="#F59E0B" />
          </div>
          <div>
            {isLoading ? <Skeleton className="h-6 w-10" /> : (
              <div className="font-extrabold text-xl text-slate-800 leading-none">{pendingInvitations}</div>
            )}
            <div className="text-[11px] text-slate-400 mt-0.5">{t("team.growth.pending_invitations", "Pending invitations")}</div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="w-full h-[160px] rounded-[10px]" />
      ) : isNoData ? (
        <div className="h-[160px] flex items-center justify-center">
          <span className="text-[0.82rem] text-slate-400">{t("team.growth.no_data", "No new members in this period")}</span>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="teamGrowthGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#A855F7" stopOpacity={0.22} />
                <stop offset="95%" stopColor="#A855F7" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis dataKey="label" tick={{ fontFamily: "Poppins", fontSize: 10, fill: GRAY }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fontFamily: "Poppins", fontSize: 10, fill: GRAY }} axisLine={false} tickLine={false} allowDecimals={false} />
            <RechartsTooltip {...ChartTooltip} labelFormatter={(v) => v} formatter={(v: number) => [v, t("team.growth.new_members", "New members")]} />
            <Area type="monotone" dataKey="count" stroke="#A855F7" fill="url(#teamGrowthGrad)" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </KpiCard>
  );
});
TeamGrowthChart.displayName = "TeamGrowthChart";
export default TeamGrowthChart;
