import React, { useState } from "react";
import PageContainer from "@/components/layout/PageContainer";
import Header from "@/components/layout/Header";
import RecommendedOpportunities from "@/components/dashboard-candidate/RecommendedOpportunities";
import WelcomeHeader from "@/components/dashboard-candidate/WelcomeHeader";
import CandidateEngagementTasks from "@/components/dashboard-candidate/CandidateEngagementTasks";
import RoleGuard from "@/components/guards/RoleGuard";
import CandidateSkills from "@/components/dashboard-candidate/candidate-skills/CandidateSkills";
import dynamic from 'next/dynamic';
import CandidateInterviews from "@/components/dashboard-candidate/candidate-interviews/CandidateInterviews";

const DashboardCandidate: React.FC = () => {
  const [activeSection, setActiveSection] = useState<"interviews" | "all">("all");

  return (
    <RoleGuard allowedRoles={["Candidate"]}>
      <PageContainer>
        <Header />
        {/* Only show these sections when viewing all */}
        {activeSection === "all" && (
          <>
            <WelcomeHeader />
            <CandidateSkills />
            <CandidateEngagementTasks />
            <RecommendedOpportunities />
          </>
        )}
        {/* Show CandidateInterviews in both views */}
        <CandidateInterviews
          onViewAll={() => setActiveSection("interviews")}
          onBackToAll={() => setActiveSection("all")}
          showViewAll={activeSection === "all"}
        />
      </PageContainer>
    </RoleGuard>
  );
};

// Export with dynamic import to prevent SSR issues
export default dynamic(() => Promise.resolve(DashboardCandidate), {
  ssr: false
});
