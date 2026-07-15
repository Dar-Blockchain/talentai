"use client";
import React, { memo } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import { StatCard } from "./KpiAtoms";
import {
  Brain as PsychologyOutlined,
  Briefcase as WorkOutlined,
  Users as PeopleOutlined,
} from "lucide-react";

const STALE = 60_000;
const sel   = (r: any) => r.data?.data ?? r.data;

const fetchDashboardStats = () => axiosInstance.get("dashboard/statsCards").then(sel);
const fetchAppMetrics     = () => axiosInstance.get("job-applications/company/my/metrics").then(sel);

const HiringStatCards = memo(() => {
  const { t } = useTranslation("dashboard");

  const { data: stats,  isLoading: l0 } = useQuery({ queryKey: ["statCards", "dashboard"],  queryFn: fetchDashboardStats, staleTime: STALE });
  const { data: appMet, isLoading: l1 } = useQuery({ queryKey: ["statCards", "appMetrics"], queryFn: fetchAppMetrics,      staleTime: STALE });

  const avgScore = stats?.avgInterviewScore != null
    ? `${stats.avgInterviewScore}%`
    : "—";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
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
    </div>
  );
});
HiringStatCards.displayName = "HiringStatCards";
export default HiringStatCards;
