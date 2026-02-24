import React from "react";
import RoleGuard from "@/components/guards/RoleGuard";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";

const CampaignDetailsPage: React.FC = () => {
  return (
    <RoleGuard allowedRoles={["Company"]}>
      <DashboardLayout>
        <p>Here the campaign details page</p>
      </DashboardLayout>
    </RoleGuard>
  );
};

export default CampaignDetailsPage;