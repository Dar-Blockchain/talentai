import React from "react";
import RoleGuard from "@/components/guards/RoleGuard";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";

const NewCampaignPage: React.FC = () => {
  return (
    <RoleGuard allowedRoles={["Company"]}>
      <DashboardLayout>
        <p>Here the new campaign page</p>
      </DashboardLayout>
    </RoleGuard>
  );
};

export default NewCampaignPage;
