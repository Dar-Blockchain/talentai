import React from "react";
import { Box, Button } from "@mui/material";
import ReplayOutlined from "@mui/icons-material/ReplayOutlined";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import DashboardOverview from "@/components/features/company/DashboardOverview";
import OnboardingTour from "@/components/features/company/OnboardingTour";

const CompanyDashboard: React.FC = () => {
  const resetTour = () => {
    localStorage.removeItem("talentai_onboarding_done");
    window.location.reload();
  };

  return (
    <DashboardLayout>
      <OnboardingTour />
      <DashboardOverview />
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
        <Button
          size="small"
          startIcon={<ReplayOutlined sx={{ fontSize: 14 }} />}
          onClick={resetTour}
          sx={{ textTransform: "none", fontSize: "0.72rem", color: "#9CA3AF", "&:hover": { color: "#374151" } }}
        >
          Replay tour
        </Button>
      </Box>
    </DashboardLayout>
  );
};

export default CompanyDashboard;