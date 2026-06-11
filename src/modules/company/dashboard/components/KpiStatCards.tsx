"use client";
import React, { memo, useCallback, useMemo } from "react";
import { Box, Typography, Skeleton } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import PsychologyOutlined    from "@mui/icons-material/PsychologyOutlined";
import WorkOutlined          from "@mui/icons-material/WorkOutlined";
import PeopleOutlined        from "@mui/icons-material/PeopleOutlined";
import CampaignOutlined      from "@mui/icons-material/CampaignOutlined";
import AccountTreeOutlined   from "@mui/icons-material/AccountTreeOutlined";
import GroupsOutlined        from "@mui/icons-material/GroupsOutlined";

// ─── Static constants ─────────────────────────────────────────────────────────

const TEAL    = "#0D9488";
const TEAL_BG = "#F0FDFA";
const STALE   = 60_000;

const GRID_SX            = { display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(3, 1fr)", lg: "repeat(6, 1fr)" }, gap: 1.5, mb: 3 } as const;
const SKELETON_CARD_SX   = { bgcolor: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", p: 2 } as const;
const SKELETON_ROW_SX    = { display: "flex", alignItems: "center", gap: 1.5 } as const;
const SKELETON_INNER_SX  = { minWidth: 0, flex: 1 } as const;
const CARD_BASE_SX       = { bgcolor: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", p: 2, transition: "box-shadow 0.2s" } as const;
const CARD_ROW_SX        = { display: "flex", alignItems: "center", gap: 1.5 } as const;
const ICON_BOX_SX        = { width: 40, height: 40, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 } as const;
const VALUE_BOX_SX       = { minWidth: 0 } as const;
const VALUE_SX           = { fontSize: "1.4rem", fontWeight: 800, color: "#111827", lineHeight: 1 } as const;
const LABEL_SX           = { fontSize: "0.67rem", fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.04em", mt: 0.3, whiteSpace: "nowrap" } as const;
const CAMPAIGN_VAL_SX    = { display: "flex", alignItems: "baseline", gap: 0.5 } as const;
const CAMPAIGN_ACTIVE_SX = { fontSize: "0.62rem", color: "#10B981", fontWeight: 700 } as const;

// ─── Queries ──────────────────────────────────────────────────────────────────

const fetchDashboardStats    = () => axiosInstance.get("dashboard/statsCards").then(r => r.data?.data ?? r.data);
const fetchAppMetrics        = () => axiosInstance.get("job-applications/company/my/metrics").then(r => r.data?.data ?? r.data);
const fetchCampaignMetrics   = () => axiosInstance.get("internal-campaigns/metrics").then(r => r.data?.data ?? r.data);
const fetchDepartmentStats   = () => axiosInstance.get("departments/stats").then(r => r.data?.data ?? r.data);
const fetchMemberStats       = () => axiosInstance.get("company-memberships/memberships/stats").then(r => r.data?.stats ?? r.data?.data ?? r.data);

// ─── StatCardSkeleton ─────────────────────────────────────────────────────────

const StatCardSkeleton = memo(() => (
  <Box sx={SKELETON_CARD_SX}>
    <Box sx={SKELETON_ROW_SX}>
      <Skeleton variant="rounded" width={40} height={40} sx={{ borderRadius: "10px", flexShrink: 0 }} />
      <Box sx={SKELETON_INNER_SX}>
        <Skeleton variant="text" width="50%" height={28} />
        <Skeleton variant="text" width="80%" height={14} sx={{ mt: 0.3 }} />
      </Box>
    </Box>
  </Box>
));
StatCardSkeleton.displayName = "StatCardSkeleton";

// ─── StatCard ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ElementType;
  color: string;
  bg: string;
  value: React.ReactNode;
  label: string;
  loading: boolean;
  onClick?: () => void;
}

const StatCard = memo<StatCardProps>(({ icon: Icon, color, bg, value, label, loading, onClick }) => {
  const cardSx    = useMemo(() => ({ ...CARD_BASE_SX, cursor: onClick ? "pointer" : "default", "&:hover": { boxShadow: onClick ? "0 2px 12px rgba(0,0,0,0.07)" : "none" } }), [onClick]);
  const iconBoxSx = useMemo(() => ({ ...ICON_BOX_SX, bgcolor: bg }), [bg]);

  if (loading) return <StatCardSkeleton />;
  return (
    <Box onClick={onClick} sx={cardSx}>
      <Box sx={CARD_ROW_SX}>
        <Box sx={iconBoxSx}><Icon sx={{ fontSize: 20, color }} /></Box>
        <Box sx={VALUE_BOX_SX}>
          <Box sx={VALUE_SX}>{value}</Box>
          <Typography sx={LABEL_SX}>{label}</Typography>
        </Box>
      </Box>
    </Box>
  );
});
StatCard.displayName = "StatCard";

// ─── KpiStatCards ─────────────────────────────────────────────────────────────

const KpiStatCards = memo(() => {
  const { t }  = useTranslation("dashboard");
  const router = useRouter();

  const { data: stats,    isLoading: statsLoading    } = useQuery({ queryKey: ["statCards", "dashboard"],    queryFn: fetchDashboardStats,  staleTime: STALE });
  const { data: appMet,   isLoading: appLoading      } = useQuery({ queryKey: ["statCards", "appMetrics"],   queryFn: fetchAppMetrics,       staleTime: STALE });
  const { data: campMet,  isLoading: campLoading     } = useQuery({ queryKey: ["statCards", "campaigns"],    queryFn: fetchCampaignMetrics,  staleTime: STALE });
  const { data: deptStat, isLoading: deptLoading     } = useQuery({ queryKey: ["statCards", "departments"],  queryFn: fetchDepartmentStats,  staleTime: STALE });
  const { data: membStat, isLoading: membLoading     } = useQuery({ queryKey: ["statCards", "members"],      queryFn: fetchMemberStats,      staleTime: STALE });

  const goToPosts        = useCallback(() => router.push("/company/posts"),        [router]);
  const goToApplications = useCallback(() => router.push("/company/applications"), [router]);
  const goToCampaigns    = useCallback(() => router.push("/company/campaigns"),    [router]);
  const goToDepartments  = useCallback(() => router.push("/company/departments"),  [router]);
  const goToEmployees    = useCallback(() => router.push("/company/employees"),    [router]);

  const avgScore = useMemo(() => (
    <>{stats?.avgInterviewScore ?? "—"}{stats?.avgInterviewScore != null ? "%" : ""}</>
  ), [stats?.avgInterviewScore]);

  const campaignValue = useMemo(() => (
    <Box sx={CAMPAIGN_VAL_SX}>
      <span>{campMet?.total ?? 0}</span>
      {(campMet?.active ?? 0) > 0 && (
        <Typography component="span" sx={CAMPAIGN_ACTIVE_SX}>
          {campMet!.active} {t("overview.campaign_activity.active")}
        </Typography>
      )}
    </Box>
  ), [campMet?.total, campMet?.active, t]);

  return (
    <Box sx={GRID_SX}>
      <StatCard icon={PsychologyOutlined}  color="#3B82F6"  bg="#EFF6FF" loading={statsLoading} value={avgScore}                         label={t("overview.stat.avg_interview_score")} />
      <StatCard icon={WorkOutlined}        color={TEAL}     bg={TEAL_BG} loading={statsLoading} value={stats?.activeJobPosts ?? "—"}     label={t("overview.stat.active_job_posts")}    onClick={goToPosts} />
      <StatCard icon={PeopleOutlined}      color="#8B5CF6"  bg="#F5F3FF" loading={appLoading}   value={appMet?.totalApplicants ?? 0}     label={t("overview.stat.applicants")}          onClick={goToApplications} />
      <StatCard icon={CampaignOutlined}    color="#F59E0B"  bg="#FFF7ED" loading={campLoading}  value={campaignValue}                    label={t("overview.stat.campaigns")}           onClick={goToCampaigns} />
      <StatCard icon={AccountTreeOutlined} color="#3B82F6"  bg="#EFF6FF" loading={deptLoading}  value={deptStat?.total ?? 0}             label={t("overview.stat.departments")}         onClick={goToDepartments} />
      <StatCard icon={GroupsOutlined}      color="#A855F7"  bg="#FDF4FF" loading={membLoading}  value={membStat?.total ?? 0}             label={t("overview.stat.team_members")}        onClick={goToEmployees} />
    </Box>
  );
});
KpiStatCards.displayName = "KpiStatCards";
export default KpiStatCards;
