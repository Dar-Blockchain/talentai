import React from "react";
import EmployeeMyCampaigns from "@/components/features/employee/EmployeeMyCampaigns";
import dynamic from "next/dynamic";
import { getDashboardLayout } from "@/modules/shared/layouts";
import type { NextPageWithLayout } from "@/pages/_app";

const EmployeeCampaigns: React.FC = () => {
  return <EmployeeMyCampaigns />;
};

const EmployeeCampaignsPage: NextPageWithLayout = dynamic(() => Promise.resolve(EmployeeCampaigns), {
  ssr: false,
});
EmployeeCampaignsPage.getLayout = getDashboardLayout;

export default EmployeeCampaignsPage;
