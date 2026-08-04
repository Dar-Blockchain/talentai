import React from "react";
import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";
import CandidateSkills from "@/modules/candidate/skills/components/CandidateSkills";
import { getCandidateLayout } from "@/modules/shared/layouts/candidate/getCandidateLayout";
import { useCandidateLayout } from "@/modules/shared/layouts/candidate/CandidateLayoutContext";
import type { NextPageWithLayout } from "@/pages/_app";

const CandidateSkillsPage: React.FC = () => {
  const { t } = useTranslation("dashboard");
  useCandidateLayout(t("candidate.sections.skills_title"));
  return <CandidateSkills />;
};

const Dynamic = dynamic(() => Promise.resolve(CandidateSkillsPage), { ssr: false }) as NextPageWithLayout;
Dynamic.getLayout = getCandidateLayout;

export default Dynamic;
