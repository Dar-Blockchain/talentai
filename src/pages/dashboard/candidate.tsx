import React from "react";
import PageContainer from "@/components/layout/PageContainer";
import Header from "@/components/layout/Header";
import InterviewDetailsTabs from "@/components/dashboard-candidate/InterviewDetailsModern";
import RecommendedOpportunities from "@/components/dashboard-candidate/RecommendedOpportunities";
import WelcomeHeader from "@/components/dashboard-candidate/WelcomeHeader";
import UserInfoCard from "@/components/dashboard-candidate/UserInfoCard";
import CandidateEngagementTasks from "@/components/dashboard-candidate/CandidateEngagementTasks";
import RoleGuard from "@/components/guards/RoleGuard";

const DashboardCandidate: React.FC = () => {

  return (
    <RoleGuard allowedRoles={["Candidate"]}>
      <PageContainer>
        <Header />
        <WelcomeHeader />
        <CandidateEngagementTasks />
        <RecommendedOpportunities />
        <UserInfoCard />
        <InterviewDetailsTabs />
      </PageContainer>
    </RoleGuard>
  );
};

export default DashboardCandidate;
