import React from "react";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import EmployeeDashboardOverview from "@/components/features/employee/EmployeeDashboardOverview";
import dynamic from "next/dynamic";

const EmployeeDashboard: React.FC = () => {
  return (
    <DashboardLayout>
      <EmployeeDashboardOverview />
    </DashboardLayout>
  );
};

export default dynamic(() => Promise.resolve(EmployeeDashboard), {
  ssr: false,
});
