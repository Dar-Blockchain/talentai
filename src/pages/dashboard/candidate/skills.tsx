import React from "react";
import dynamic from "next/dynamic";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import CandidateSkills from "@/components/features/candidate/candidate-skills/CandidateSkills";

const CandidateSkillsPage: React.FC = () => (
  <DashboardLayout>
    <CandidateSkills />
  </DashboardLayout>
);

export default dynamic(() => Promise.resolve(CandidateSkillsPage), { ssr: false });
