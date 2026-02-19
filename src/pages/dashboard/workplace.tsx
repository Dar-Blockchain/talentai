import { useState, useCallback } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import SettingsOutlined from "@mui/icons-material/SettingsOutlined";
import RoleGuard from "@/components/guards/RoleGuard";
import WorkplaceLayout from "@/components/dashboard-workplace/WorkplaceLayout";
import dynamic from "next/dynamic";

const Loader = () => (
  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
    <CircularProgress sx={{ color: "#0D9488" }} />
  </Box>
);

const DashboardOverview = dynamic(
  () => import("@/components/dashboard-workplace/DashboardOverview"),
  { ssr: false, loading: Loader }
);
const SkillsMatrix = dynamic(
  () => import("@/components/dashboard-workplace/SkillsMatrix"),
  { ssr: false, loading: Loader }
);
const AssessmentCampaigns = dynamic(
  () => import("@/components/dashboard-workplace/AssessmentCampaigns"),
  { ssr: false, loading: Loader }
);
const EmployeeEnablement = dynamic(
  () => import("@/components/dashboard-workplace/EmployeeEnablement"),
  { ssr: false, loading: Loader }
);
const AnalyticsReporting = dynamic(
  () => import("@/components/dashboard-workplace/AnalyticsReporting"),
  { ssr: false, loading: Loader }
);

const SettingsPlaceholder = () => (
  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", textAlign: "center" }}>
    <Box sx={{ width: 64, height: 64, bgcolor: "#F0FDFA", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", mb: 2 }}>
      <SettingsOutlined sx={{ fontSize: 32, color: "#0D9488" }} />
    </Box>
    <Typography sx={{ fontSize: "24px", fontWeight: 700, color: "#111827" }}>Settings</Typography>
    <Typography sx={{ color: "#6B7280", mt: 1 }}>Configuration options and user management will appear here.</Typography>
  </Box>
);

const tabComponents: Record<string, React.ComponentType> = {
  dashboard: DashboardOverview,
  skills: SkillsMatrix,
  campaigns: AssessmentCampaigns,
  enablement: EmployeeEnablement,
  analytics: AnalyticsReporting,
  settings: SettingsPlaceholder,
};

const DashboardWorkplace = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const handleSetTab = useCallback((tab: string) => setActiveTab(tab), []);

  const TabContent = tabComponents[activeTab] ?? DashboardOverview;

  return (
    <RoleGuard allowedRoles={["Company"]}>
      <WorkplaceLayout activeTab={activeTab} setActiveTab={handleSetTab}>
        <TabContent />
      </WorkplaceLayout>
    </RoleGuard>
  );
};

export default dynamic(() => Promise.resolve(DashboardWorkplace), { ssr: false });
