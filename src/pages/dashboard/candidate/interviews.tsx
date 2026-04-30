import React from "react";
import dynamic from "next/dynamic";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import PageHeader from "@/components/layout/dashboard/PageHeader";
import CandidateInterviews from "@/components/features/candidate/candidate-interviews/CandidateInterviews";
import SchoolOutlined from "@mui/icons-material/SchoolOutlined";

const CandidateInterviewsPage: React.FC = () => (
  <DashboardLayout>
    <PageHeader
      title="Interviews"
      subtitle="Your interviews and skills assessments"
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard/candidate" },
        { label: "Interviews" },
      ]}
      icon={SchoolOutlined}
    />
    <CandidateInterviews onViewAll={() => {}} onBackToAll={() => {}} showViewAll={false} />
  </DashboardLayout>
);

export default dynamic(() => Promise.resolve(CandidateInterviewsPage), { ssr: false });
