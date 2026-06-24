import React from "react";
import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";
import CandidateWorkspaceLayout from "@/modules/shared/layouts/candidate/CandidateWorkspaceLayout";
import CandidateSkills from "@/components/features/candidate/candidate-skills/CandidateSkills";

const CandidateSkillsPage: React.FC = () => {
  const { t } = useTranslation("dashboard");

  return (
    <CandidateWorkspaceLayout breadcrumb={t("candidate.sections.skills_title")}>
      <CandidateSkills />
    </CandidateWorkspaceLayout>
  );
};

export default dynamic(() => Promise.resolve(CandidateSkillsPage), { ssr: false });
