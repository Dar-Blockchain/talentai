import { useState, useCallback } from "react";
import { Box, CircularProgress } from "@mui/material";
import RoleGuard from "@/components/guards/RoleGuard";
import WorkplaceLayout from "@/components/dashboard-workplace/WorkplaceLayout";
import dynamic from "next/dynamic";

const Loader = () => (
  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
    <CircularProgress sx={{ color: "#0D9488" }} />
  </Box>
);

const DashboardOverview = dynamic<{ onNavigate: (tab: string) => void }>(
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
const CompanySettings = dynamic(
  () => import("@/components/dashboard-workplace/CompanySettings"),
  { ssr: false, loading: Loader }
);
const DesignSystem = dynamic(
  () => import("@/components/dashboard-workplace/DesignSystem"),
  { ssr: false, loading: Loader }
);
const WorkplaceNotifications = dynamic(
  () => import("@/components/dashboard-workplace/WorkplaceNotifications"),
  { ssr: false, loading: Loader }
);

const DashboardWorkplace = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const handleSetTab = useCallback((tab: string) => setActiveTab(tab), []);

  const renderTab = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardOverview onNavigate={handleSetTab} />;
      case "skills":
        return <SkillsMatrix />;
      case "campaigns":
        return <AssessmentCampaigns />;
      case "enablement":
        return <EmployeeEnablement />;
      case "analytics":
        return <AnalyticsReporting />;
      case "settings":
        return <CompanySettings />;
      case "notifications":
        return <WorkplaceNotifications />;
      case "design-system":
        return <DesignSystem />;
      default:
        return <DashboardOverview onNavigate={handleSetTab} />;
    }
  };

  return (
    <RoleGuard allowedRoles={["Company"]}>
      <WorkplaceLayout activeTab={activeTab} setActiveTab={handleSetTab}>
        {renderTab()}
      </WorkplaceLayout>
    </RoleGuard>
  );
};

export default dynamic(() => Promise.resolve(DashboardWorkplace), { ssr: false });
