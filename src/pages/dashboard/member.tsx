import React from "react";
import dynamic from "next/dynamic";
import MemberGuard from "@/components/guards/MemberGuard";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import DashboardOverview from "@/components/dashboard-workplace/DashboardOverview";

const DashboardMember: React.FC = () => (
  <MemberGuard>
    <DashboardLayout>
      <DashboardOverview />
    </DashboardLayout>
  </MemberGuard>
);

export default dynamic(() => Promise.resolve(DashboardMember), { ssr: false });
