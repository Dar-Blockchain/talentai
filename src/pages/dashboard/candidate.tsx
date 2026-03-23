import React, { useState } from "react";
import PageContainer from "@/components/layout/PageContainer";
import Header from "@/components/layout/Header";
import RecommendedOpportunities from "@/components/features/candidate/RecommendedOpportunities";
import WelcomeHeader from "@/components/features/candidate/WelcomeHeader";
import CandidateEngagementTasks from "@/components/features/candidate/CandidateEngagementTasks";
import CandidateSkills from "@/components/features/candidate/candidate-skills/CandidateSkills";
import dynamic from 'next/dynamic';
import CandidateInterviews from "@/components/features/candidate/candidate-interviews/CandidateInterviews";

const DashboardCandidate: React.FC = () => {
  const [activeSection, setActiveSection] = useState<"interviews" | "opportunities" | "all">("all");

  return (
      <PageContainer>
        <Header />
        {/* WelcomeHeader is always visible */}
        <WelcomeHeader />
        {/* Only show these sections when viewing all */}
        {activeSection === "all" && (
          <>
            <CandidateSkills />
            <CandidateEngagementTasks />
          </>
        )}
        {/* Show RecommendedOpportunities in "all" and "opportunities" views */}
        {/* {(activeSection === "all" || activeSection === "opportunities") && (
          <RecommendedOpportunities
            onViewAll={() => setActiveSection("opportunities")}
            onBackToAll={() => setActiveSection("all")}
            showViewAll={activeSection === "all"}
          />
        )} */}
        {/* Show CandidateInterviews in "all" and "interviews" views */}
        {(activeSection === "all" || activeSection === "interviews") && (
          <CandidateInterviews
            onViewAll={() => setActiveSection("interviews")}
            onBackToAll={() => setActiveSection("all")}
            showViewAll={activeSection === "all"}
          />
        )}
      </PageContainer>
  );
};

// Export with dynamic import to prevent SSR issues
export default dynamic(() => Promise.resolve(DashboardCandidate), {
  ssr: false
});
