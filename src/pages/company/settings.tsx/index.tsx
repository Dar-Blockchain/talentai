import React from "react";
import RoleGuard from "@/components/guards/RoleGuard";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";

const SettingsPage: React.FC = () => {
  return (
    <RoleGuard allowedRoles={["Company"]}>
      <DashboardLayout>
        <p>Here the settings page</p>
      </DashboardLayout>
    </RoleGuard>
  );
};

export default SettingsPage;