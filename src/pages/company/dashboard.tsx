import React from "react";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import DashboardOverview from "@/components/features/company/DashboardOverview";

const CompanyDashboard: React.FC = () => (
  <DashboardLayout>
    <DashboardOverview />
  </DashboardLayout>
);

export default CompanyDashboard;
