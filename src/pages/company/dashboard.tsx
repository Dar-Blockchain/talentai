import React from "react";
import RoleGuard from "@/components/guards/RoleGuard";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import DashboardOverview from "@/components/dashboard-workplace/DashboardOverview";

const CompanyDashboard: React.FC = () => {
  return (
    <RoleGuard allowedRoles={["Company"]}>
      <DashboardLayout>
        <DashboardOverview />
      </DashboardLayout>
    </RoleGuard>
  );
};

export default CompanyDashboard;