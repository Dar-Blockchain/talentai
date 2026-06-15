import React from "react";
import DashboardLayout from "@/modules/shared/layouts/dashboard/DashboardLayout";
import EmployeeMyCampaigns from "@/components/features/employee/EmployeeMyCampaigns";
import dynamic from "next/dynamic";

const EmployeeCampaignsPage: React.FC = () => {
  return (
    <DashboardLayout>
      <EmployeeMyCampaigns />
    </DashboardLayout>
  );
};

export default dynamic(() => Promise.resolve(EmployeeCampaignsPage), {
  ssr: false,
});
