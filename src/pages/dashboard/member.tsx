import React from "react";
import dynamic from "next/dynamic";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import DashboardOverview from "@/components/features/company/DashboardOverview";

const DashboardMember: React.FC = () => (
    <DashboardLayout>
      <DashboardOverview />
    </DashboardLayout>
);

export default dynamic(() => Promise.resolve(DashboardMember), { ssr: false });
