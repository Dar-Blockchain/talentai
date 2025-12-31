import React from "react";
import CandidateOnly from "@/components/guards/CandidateOnly";
import PageContainer from "@/components/layout/PageContainer";
import HeaderDashboard from "@/components/layout/HeaderDashboard";
import InterviewDetailsTabs from "@/components/dashboard-candidate/InterviewDetailsModern";
import RecommendedOpportunities from "@/components/dashboard-candidate/RecommendedOpportunities";
import WelcomeHeader from "@/components/dashboard-candidate/WelcomeHeader";
import UserInfoCard from "@/components/dashboard-candidate/UserInfoCard";
import CandidateEngagementTasks from "@/components/dashboard-candidate/CandidateEngagementTasks";

const DashboardCandidate: React.FC = () => {
  return (
    <CandidateOnly>
      <PageContainer>
        <HeaderDashboard />
        <WelcomeHeader />
        <CandidateEngagementTasks />
        <RecommendedOpportunities />
        <UserInfoCard />
        <InterviewDetailsTabs />
      </PageContainer>
    </CandidateOnly>
  );
};

export default DashboardCandidate;
