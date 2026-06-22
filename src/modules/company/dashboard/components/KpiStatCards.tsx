"use client";
import React, { memo } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import { Card, CardContent } from "@/modules/shared/ui/shadcn/card";
import { Skeleton } from "@/modules/shared/ui/shadcn/skeleton";
import { cn } from "@/lib/utils";
import PsychologyOutlined  from "@mui/icons-material/PsychologyOutlined";
import WorkOutlined        from "@mui/icons-material/WorkOutlined";
import PeopleOutlined      from "@mui/icons-material/PeopleOutlined";
import CampaignOutlined    from "@mui/icons-material/CampaignOutlined";
import AccountTreeOutlined from "@mui/icons-material/AccountTreeOutlined";
import GroupsOutlined      from "@mui/icons-material/GroupsOutlined";

const STALE = 60_000;
const sel   = (r: any) => r.data?.data ?? r.data;

const fetchDashboardStats  = () => axiosInstance.get("dashboard/statsCards").then(sel);
const fetchAppMetrics      = () => axiosInstance.get("job-applications/company/my/metrics").then(sel);
const fetchCampaignMetrics = () => axiosInstance.get("internal-campaigns/metrics").then(sel);
const fetchDepartmentStats = () => axiosInstance.get("departments/stats").then(sel);
const selMember            = (r: any) => r.data?.stats ?? r.data?.data ?? r.data;

// ─── StatCard ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  icon:     React.ElementType;
  color:    string;
  bg:       string;
  value:    React.ReactNode;
  label:    string;
  loading:  boolean;
  href?:    string;
}

const StatCard = memo<StatCardProps>(({ icon: Icon, color, bg, value, label, loading, href }) => {
  const router = useRouter();

  if (loading) return (
    <Card>
      <CardContent className="flex items-center gap-3 py-4">
        <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
        <div className="flex-1 min-w-0 space-y-2">
          <Skeleton className="h-6 w-10" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Card
      className={cn("group", href && "cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200")}
      onClick={href ? () => router.push(href) : undefined}
    >
      <CardContent className="flex items-center gap-3 py-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110" style={{ background: bg }}>
          <Icon style={{ fontSize: 20, color }} />
        </div>
        <div className="min-w-0">
          <div className="text-[1.35rem] font-extrabold text-slate-900 leading-none tabular-nums">{value}</div>
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-1 truncate">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
});
StatCard.displayName = "StatCard";

// ─── KpiStatCards ─────────────────────────────────────────────────────────────

const KpiStatCards = memo(() => {
  const { t } = useTranslation("dashboard");

  const { data: stats,    isLoading: l0 } = useQuery({ queryKey: ["statCards", "dashboard"],   queryFn: fetchDashboardStats,  staleTime: STALE });
  const { data: appMet,   isLoading: l1 } = useQuery({ queryKey: ["statCards", "appMetrics"],  queryFn: fetchAppMetrics,       staleTime: STALE });
  const { data: campMet,  isLoading: l2 } = useQuery({ queryKey: ["statCards", "campaigns"],   queryFn: fetchCampaignMetrics,  staleTime: STALE });
  const { data: deptStat, isLoading: l3 } = useQuery({ queryKey: ["statCards", "departments"], queryFn: fetchDepartmentStats,  staleTime: STALE });
  const { data: membStat, isLoading: l4 } = useQuery({
    queryKey: ["statCards", "members"],
    queryFn:  () => axiosInstance.get("company-memberships/memberships/stats").then(selMember),
    staleTime: STALE,
  });

  const avgScore = stats?.avgInterviewScore != null
    ? `${stats.avgInterviewScore}%`
    : "—";

  const campaignValue = (
    <span className="flex items-baseline gap-1">
      <span>{campMet?.total ?? 0}</span>
      {(campMet?.active ?? 0) > 0 && (
        <span className="text-[11px] text-emerald-500 font-bold leading-none">+{campMet!.active}</span>
      )}
    </span>
  );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
      <StatCard icon={PsychologyOutlined}  color="#3B82F6" bg="#EFF6FF" loading={l0} value={avgScore}                     label={t("overview.stat.avg_interview_score")} />
      <StatCard icon={WorkOutlined}        color="#0D9488" bg="#F0FDFA" loading={l0} value={stats?.activeJobPosts ?? "—"} label={t("overview.stat.active_job_posts")}    href="/company/posts" />
      <StatCard icon={PeopleOutlined}      color="#8B5CF6" bg="#F5F3FF" loading={l1} value={appMet?.totalApplicants ?? 0} label={t("overview.stat.applicants")}          href="/company/applications" />
      <StatCard icon={CampaignOutlined}    color="#F59E0B" bg="#FFF7ED" loading={l2} value={campaignValue}                label={t("overview.stat.campaigns")}           href="/company/campaigns" />
      <StatCard icon={AccountTreeOutlined} color="#3B82F6" bg="#EFF6FF" loading={l3} value={deptStat?.total ?? 0}         label={t("overview.stat.departments")}         href="/company/departments" />
      <StatCard icon={GroupsOutlined}      color="#A855F7" bg="#FDF4FF" loading={l4} value={membStat?.total ?? 0}         label={t("overview.stat.team_members")}        href="/company/employees" />
    </div>
  );
});
KpiStatCards.displayName = "KpiStatCards";
export default KpiStatCards;
