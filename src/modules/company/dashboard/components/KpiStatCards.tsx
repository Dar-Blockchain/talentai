"use client";
import React, { memo } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import { Skeleton } from "@/modules/shared/ui/shadcn/skeleton";
import { cn } from "@/lib/utils";
import {
  Brain as PsychologyOutlined,
  Briefcase as WorkOutlined,
  Users as PeopleOutlined,
  Megaphone as CampaignOutlined,
  Network as AccountTreeOutlined,
  Users as GroupsOutlined,
  ChevronRight as ArrowForwardIosRounded,
} from "lucide-react";

const STALE = 60_000;
const sel   = (r: any) => r.data?.data ?? r.data;

const fetchDashboardStats  = () => axiosInstance.get("dashboard/statsCards").then(sel);
const fetchAppMetrics      = () => axiosInstance.get("job-applications/company/my/metrics").then(sel);
const fetchCampaignMetrics = () => axiosInstance.get("internal-campaigns/metrics").then(sel);
const fetchDepartmentStats = () => axiosInstance.get("departments/stats").then(sel);
const selMember            = (r: any) => r.data?.stats ?? r.data?.data ?? r.data;

// ─── StatCard ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  icon:    React.ElementType;
  color:   string;
  bg:      string;
  value:   React.ReactNode;
  label:   string;
  loading: boolean;
  href?:   string;
}

const StatCard = memo<StatCardProps>(({ icon: Icon, color, bg, value, label, loading, href }) => {
  const router = useRouter();
  const clickable = !!href;

  if (loading) return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm p-4">
      <div className="flex items-start gap-3">
        <Skeleton className="w-11 h-11 rounded-xl shrink-0" />
        <div className="flex-1 space-y-2 pt-0.5">
          <Skeleton className="h-7 w-14" />
          <Skeleton className="h-3 w-4/5" />
        </div>
      </div>
    </div>
  );

  return (
    <div
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={clickable ? () => router.push(href!) : undefined}
      onKeyDown={clickable ? (e) => e.key === "Enter" && router.push(href!) : undefined}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm p-4 transition-all duration-200",
        clickable && "cursor-pointer hover:shadow-lg hover:-translate-y-0.5 hover:border-slate-200"
      )}
    >
      <div className="flex items-start gap-3 mt-1">
        {/* icon bubble */}
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110"
          style={{ background: bg }}
        >
          <Icon size={22} color={color} />
        </div>

        {/* text */}
        <div className="flex-1 min-w-0">
          <div className="text-2xl font-black text-slate-800 leading-none tabular-nums tracking-tight">
            {value}
          </div>
          <div className="text-[11px] font-semibold text-slate-400 mt-1.5 leading-snug uppercase tracking-wide">
            {label}
          </div>
        </div>

        {/* arrow for clickable cards */}
        {clickable && (
          <ArrowForwardIosRounded
            size={13}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-slate-300 shrink-0 mt-0.5"
          />
        )}
      </div>

      {/* subtle hover overlay */}
      {clickable && (
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none rounded-2xl"
          style={{ background: `${bg}33` }}
        />
      )}
    </div>
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
    <span className="flex items-baseline gap-1.5">
      <span>{campMet?.total ?? 0}</span>
      {(campMet?.active ?? 0) > 0 && (
        <span className="text-[13px] text-emerald-500 font-bold leading-none">+{campMet!.active}</span>
      )}
    </span>
  );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      <StatCard
        icon={PsychologyOutlined}
        color="#3B82F6" bg="#EFF6FF"
        loading={l0} value={avgScore}
        label={t("overview.stat.avg_interview_score")}
      />
      <StatCard
        icon={WorkOutlined}
        color="#0D9488" bg="#F0FDFA"
        loading={l0} value={stats?.activeJobPosts ?? "—"}
        label={t("overview.stat.active_job_posts")}
        href="/company/posts"
      />
      <StatCard
        icon={PeopleOutlined}
        color="#8B5CF6" bg="#F5F3FF"
        loading={l1} value={appMet?.totalApplicants ?? 0}
        label={t("overview.stat.applicants")}
        href="/company/applications"
      />
      <StatCard
        icon={CampaignOutlined}
        color="#F59E0B" bg="#FFFBEB"
        loading={l2} value={campaignValue}
        label={t("overview.stat.campaigns")}
        href="/company/campaigns"
      />
      <StatCard
        icon={AccountTreeOutlined}
        color="#0EA5E9" bg="#F0F9FF"
        loading={l3} value={deptStat?.total ?? 0}
        label={t("overview.stat.departments")}
        href="/company/departments"
      />
      <StatCard
        icon={GroupsOutlined}
        color="#A855F7" bg="#FDF4FF"
        loading={l4} value={membStat?.total ?? 0}
        label={t("overview.stat.team_members")}
        href="/company/employees"
      />
    </div>
  );
});
KpiStatCards.displayName = "KpiStatCards";
export default KpiStatCards;
