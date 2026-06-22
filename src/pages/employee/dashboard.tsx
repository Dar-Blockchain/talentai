import React from "react";
import EmployeeDashboardOverview from "@/components/features/employee/EmployeeDashboardOverview";
import dynamic from "next/dynamic";
import { getDashboardLayout } from "@/modules/shared/layouts";
import type { NextPageWithLayout } from "@/pages/_app";

const EmployeeDashboard: React.FC = () => {
  return <EmployeeDashboardOverview />;
};

const EmployeeDashboardPage: NextPageWithLayout = dynamic(() => Promise.resolve(EmployeeDashboard), {
  ssr: false,
});
EmployeeDashboardPage.getLayout = getDashboardLayout;

export default EmployeeDashboardPage;
