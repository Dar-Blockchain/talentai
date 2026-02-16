import { useState } from "react";
import { Box, Typography } from "@mui/material";
import SettingsOutlined from "@mui/icons-material/SettingsOutlined";
import RoleGuard from "@/components/guards/RoleGuard";
import WorkplaceLayout from "@/components/dashboard-workplace/WorkplaceLayout";
import DashboardOverview from "@/components/dashboard-workplace/DashboardOverview";
import SkillsMatrix from "@/components/dashboard-workplace/SkillsMatrix";
import AssessmentCampaigns from "@/components/dashboard-workplace/AssessmentCampaigns";
import EmployeeEnablement from "@/components/dashboard-workplace/EmployeeEnablement";
import AnalyticsReporting from "@/components/dashboard-workplace/AnalyticsReporting";
import dynamic from "next/dynamic";

const DashboardWorkplace = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardOverview />;
      case "skills":
        return <SkillsMatrix />;
      case "campaigns":
        return <AssessmentCampaigns />;
      case "enablement":
        return <EmployeeEnablement />;
      case "analytics":
        return <AnalyticsReporting />;
      case "settings":
        return (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", textAlign: "center" }}>
            <Box sx={{ width: 64, height: 64, bgcolor: "#F0FDFA", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", mb: 2 }}>
              <SettingsOutlined sx={{ fontSize: 32, color: "#0D9488" }} />
            </Box>
            <Typography sx={{ fontSize: "24px", fontWeight: 700, color: "#111827" }}>Settings</Typography>
            <Typography sx={{ color: "#6B7280", mt: 1 }}>Configuration options and user management will appear here.</Typography>
          </Box>
        );
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <RoleGuard allowedRoles={["Company"]}>
      <WorkplaceLayout activeTab={activeTab} setActiveTab={setActiveTab}>
        {renderContent()}
      </WorkplaceLayout>
    </RoleGuard>
  );
};

export default dynamic(() => Promise.resolve(DashboardWorkplace), { ssr: false });
