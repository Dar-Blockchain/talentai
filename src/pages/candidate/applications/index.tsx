import React from "react";
import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";
import { CandidateApplicationsList } from "@/modules/candidate/applications";
import { getCandidateLayout } from "@/modules/shared/layouts/candidate/getCandidateLayout";
import { useCandidateLayout } from "@/modules/shared/layouts/candidate/CandidateLayoutContext";
import type { NextPageWithLayout } from "@/pages/_app";

const CandidateApplicationsPage: React.FC = () => {
  const { t } = useTranslation("dashboard");
  useCandidateLayout(t("candidate.nav.applications"));
  return <CandidateApplicationsList />;
};

const Dynamic = dynamic(() => Promise.resolve(CandidateApplicationsPage), { ssr: false }) as NextPageWithLayout;
Dynamic.getLayout = getCandidateLayout;

export default Dynamic;
