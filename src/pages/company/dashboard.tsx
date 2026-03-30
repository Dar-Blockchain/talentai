import React from "react";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import DashboardOverview from "@/components/features/company/DashboardOverview";
import OnboardingTour from "@/components/features/company/OnboardingTour";

const CompanyDashboard: React.FC = () => (
  <DashboardLayout>
    <OnboardingTour />
    <DashboardOverview />
  </DashboardLayout>
);

export default CompanyDashboard;
