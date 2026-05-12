import React from "react";
import dynamic from "next/dynamic";
import { Box } from "@mui/material";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";

const KpiStatCards         = dynamic(() => import("@/components/features/company/kpi/KpiStatCards"));
const KpiFiltersBar        = dynamic(() => import("@/components/features/company/kpi/KpiFiltersBar"));
const KpiActionsToTake     = dynamic(() => import("@/components/features/company/kpi/KpiActionsToTake"));
const KpiPostsOverview     = dynamic(() => import("@/components/features/company/kpi/KpiPostsOverview"));
const KpiRecruitmentFunnel = dynamic(() => import("@/components/features/company/kpi/KpiRecruitmentFunnel"));
const KpiHiringVelocity    = dynamic(() => import("@/components/features/company/kpi/KpiHiringVelocity"));
const KpiCandidateQuality  = dynamic(() => import("@/components/features/company/kpi/KpiCandidateQuality"));
const KpiRoiSavings        = dynamic(() => import("@/components/features/company/kpi/KpiRoiSavings"));

const CompanyDashboard: React.FC = () => {
  return (
    <DashboardLayout>
      <Box sx={{ maxWidth: 1440, mx: "auto" }}>
        <KpiStatCards />
        <KpiFiltersBar />
        <KpiActionsToTake />
        <KpiPostsOverview />
        <KpiRecruitmentFunnel />
        <KpiHiringVelocity />
        <KpiCandidateQuality />
        <KpiRoiSavings />
      </Box>
    </DashboardLayout>
  );
};

export default CompanyDashboard;
