import React from "react";
import dynamic from "next/dynamic";
import { Box } from "@mui/material";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";

const KpiStatCards  = dynamic(() => import("@/components/features/company/kpi/KpiStatCards"));
const KpiFiltersBar = dynamic(() => import("@/components/features/company/kpi/KpiFiltersBar"));
const KpiZone1      = dynamic(() => import("@/components/features/company/kpi/KpiZone1"));
const KpiZone2      = dynamic(() => import("@/components/features/company/kpi/KpiZone2"));
const KpiZone3      = dynamic(() => import("@/components/features/company/kpi/KpiZone3"));
const KpiZone4      = dynamic(() => import("@/components/features/company/kpi/KpiZone4"));
const KpiZone5      = dynamic(() => import("@/components/features/company/kpi/KpiZone5"));
const KpiZone6      = dynamic(() => import("@/components/features/company/kpi/KpiZone6"));
const KpiZone7      = dynamic(() => import("@/components/features/company/kpi/KpiZone7"));

const CompanyDashboard: React.FC = () => (
  <DashboardLayout>
    <Box sx={{ maxWidth: 1440, mx: "auto" }}>
      <KpiStatCards />
      <KpiFiltersBar />
      <KpiZone1 />
      <KpiZone2 />
      <KpiZone3 />
      <KpiZone4 />
      <KpiZone5 />
      <KpiZone6 />
      <KpiZone7 />
    </Box>
  </DashboardLayout>
);

export default CompanyDashboard;
