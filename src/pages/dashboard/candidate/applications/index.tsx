import React from "react";
import dynamic from "next/dynamic";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import PageHeader from "@/components/layout/dashboard/PageHeader";
import CandidateApplications from "@/components/features/candidate/CandidateApplications";
import AssignmentOutlined from "@mui/icons-material/AssignmentOutlined";

const CandidateApplicationsPage: React.FC = () => (
  <DashboardLayout>
    <PageHeader
      title="Applications"
      subtitle="Track all your job applications"
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard/candidate" },
        { label: "Applications" },
      ]}
      icon={AssignmentOutlined}
    />
    <CandidateApplications />
  </DashboardLayout>
);

export default dynamic(() => Promise.resolve(CandidateApplicationsPage), { ssr: false });
