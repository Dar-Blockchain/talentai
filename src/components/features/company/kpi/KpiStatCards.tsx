"use client";
import React, { useEffect } from "react";
import { Box, Typography, Skeleton } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";
import { AppDispatch } from "@/store/store";
import { fetchDashboardStats, selectDashboardStats, selectDashboardStatsLoading } from "@/store/slices/companySlice";
import { fetchCompanyApplicationMetrics, selectApplicationMetrics, selectApplicationMetricsLoading } from "@/store/slices/jobApplicationSlice";
import { fetchCampaignMetrics, selectCampaignMetrics, selectCampaignMetricsLoading } from "@/store/slices/campaignSlice";
import { fetchDepartmentStats, selectDepartmentStats, selectDepartmentStatsLoading } from "@/store/slices/departmentSlice";
import { fetchMemberStats, selectMembers } from "@/store/slices/memberSlice";
import PsychologyOutlined from "@mui/icons-material/PsychologyOutlined";
import WorkOutlined from "@mui/icons-material/WorkOutlined";
import PeopleOutlined from "@mui/icons-material/PeopleOutlined";
import CampaignOutlined from "@mui/icons-material/CampaignOutlined";
import AccountTreeOutlined from "@mui/icons-material/AccountTreeOutlined";
import GroupsOutlined from "@mui/icons-material/GroupsOutlined";

const TEAL = "#0D9488";
const TEAL_BG = "#F0FDFA";

const StatCardSkeleton: React.FC = () => (
  <Box sx={{ bgcolor: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", p: 2 }}>
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      <Skeleton variant="rounded" width={40} height={40} sx={{ borderRadius: "10px", flexShrink: 0 }} />
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Skeleton variant="text" width="50%" height={28} />
        <Skeleton variant="text" width="80%" height={14} sx={{ mt: 0.3 }} />
      </Box>
    </Box>
  </Box>
);

const StatCard: React.FC<{
  icon: React.ElementType;
  color: string;
  bg: string;
  value: React.ReactNode;
  label: string;
  loading: boolean;
  onClick?: () => void;
}> = ({ icon: Icon, color, bg, value, label, loading, onClick }) => {
  if (loading) return <StatCardSkeleton />;
  return (
    <Box
      onClick={onClick}
      sx={{
        bgcolor: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB",
        p: 2, cursor: onClick ? "pointer" : "default",
        transition: "box-shadow 0.2s",
        "&:hover": { boxShadow: onClick ? "0 2px 12px rgba(0,0,0,0.07)" : "none" },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box sx={{ width: 40, height: 40, borderRadius: "10px", bgcolor: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon sx={{ fontSize: 20, color }} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Box sx={{ fontSize: "1.4rem", fontWeight: 800, color: "#111827", lineHeight: 1 }}>{value}</Box>
          <Typography sx={{ fontSize: "0.67rem", fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.04em", mt: 0.3, whiteSpace: "nowrap" }}>
            {label}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

const KpiStatCards: React.FC = () => {
  const { t } = useTranslation("dashboard");
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const dashboardStats    = useSelector(selectDashboardStats);
  const statsLoading      = useSelector(selectDashboardStatsLoading);
  const appMetrics        = useSelector(selectApplicationMetrics);
  const appMetricsLoading = useSelector(selectApplicationMetricsLoading);
  const campaignMetrics   = useSelector(selectCampaignMetrics);
  const campaignLoading   = useSelector(selectCampaignMetricsLoading);
  const deptStats         = useSelector(selectDepartmentStats);
  const deptLoading       = useSelector(selectDepartmentStatsLoading);
  const { stats: memberStats, fetchingStats: memberLoading } = useSelector(selectMembers);

  useEffect(() => {
    dispatch(fetchDashboardStats());
    dispatch(fetchCompanyApplicationMetrics());
    dispatch(fetchCampaignMetrics());
    dispatch(fetchDepartmentStats());
    dispatch(fetchMemberStats());
  }, [dispatch]);

  return (
    <Box sx={{
      display: "grid",
      gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(3, 1fr)", lg: "repeat(6, 1fr)" },
      gap: 1.5,
      mb: 3,
    }}>
      <StatCard
        icon={PsychologyOutlined} color="#3B82F6" bg="#EFF6FF"
        loading={statsLoading}
        value={<>{(dashboardStats as any)?.avgInterviewScore ?? "—"}{(dashboardStats as any)?.avgInterviewScore != null ? "%" : ""}</>}
        label={t("overview.stat.avg_interview_score")}
      />
      <StatCard
        icon={WorkOutlined} color={TEAL} bg={TEAL_BG}
        loading={statsLoading}
        value={(dashboardStats as any)?.activeJobPosts ?? "—"}
        label={t("overview.stat.active_job_posts")}
        onClick={() => router.push("/company/posts")}
      />
      <StatCard
        icon={PeopleOutlined} color="#8B5CF6" bg="#F5F3FF"
        loading={appMetricsLoading}
        value={appMetrics?.totalApplicants ?? 0}
        label={t("overview.stat.applicants")}
        onClick={() => router.push("/company/applications")}
      />
      <StatCard
        icon={CampaignOutlined} color="#F59E0B" bg="#FFF7ED"
        loading={campaignLoading}
        value={
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5 }}>
            <span>{campaignMetrics?.total ?? 0}</span>
            {(campaignMetrics?.active ?? 0) > 0 && (
              <Typography component="span" sx={{ fontSize: "0.62rem", color: "#10B981", fontWeight: 700 }}>
                {campaignMetrics!.active} {t("overview.campaign_activity.active")}
              </Typography>
            )}
          </Box>
        }
        label={t("overview.stat.campaigns")}
        onClick={() => router.push("/company/campaigns")}
      />
      <StatCard
        icon={AccountTreeOutlined} color="#3B82F6" bg="#EFF6FF"
        loading={deptLoading}
        value={deptStats?.total ?? 0}
        label={t("overview.stat.departments")}
        onClick={() => router.push("/company/departments")}
      />
      <StatCard
        icon={GroupsOutlined} color="#A855F7" bg="#FDF4FF"
        loading={memberLoading}
        value={memberStats?.total ?? 0}
        label={t("overview.stat.team_members")}
        onClick={() => router.push("/company/employees")}
      />
    </Box>
  );
};

export default KpiStatCards;
