import React from "react";
import RoleGuard from "@/components/guards/RoleGuard";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";

const SkillsPage: React.FC = () => {
  return (
    <RoleGuard allowedRoles={["Company"]}>
      <DashboardLayout>
        <p>Here the skills page</p>
      </DashboardLayout>
    </RoleGuard>
  );
};

export default SkillsPage;