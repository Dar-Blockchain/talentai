import React from "react";
import PageContainer from "@/components/layout/PageContainer";
import Header from "@/components/layout/Header";
import InterviewDetailsTabs from "@/components/dashboard-candidate/InterviewDetailsModern";
import RecommendedOpportunities from "@/components/dashboard-candidate/RecommendedOpportunities";
import WelcomeHeader from "@/components/dashboard-candidate/WelcomeHeader";
import CandidateEngagementTasks from "@/components/dashboard-candidate/CandidateEngagementTasks";
import RoleGuard from "@/components/guards/RoleGuard";
import CandidateSkills from "@/components/dashboard-candidate/candidate-skills/CandidateSkills";
import dynamic from 'next/dynamic';

const DashboardCandidate: React.FC = () => {

  return (
    <RoleGuard allowedRoles={["Candidate"]}>
      <PageContainer>
        <Header />
        <WelcomeHeader />
        <CandidateSkills/>
        <CandidateEngagementTasks />
        <RecommendedOpportunities />
        <InterviewDetailsTabs />
      </PageContainer>
    </RoleGuard>
  );
};

// Export with dynamic import to prevent SSR issues
export default dynamic(() => Promise.resolve(DashboardCandidate), {
  ssr: false
});
