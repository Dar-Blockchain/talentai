import React from "react";
import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";
import { CandidateInterviewsTabs } from "@/modules/candidate/interviews";
import { getCandidateLayout } from "@/modules/shared/layouts/candidate/getCandidateLayout";
import { useCandidateLayout } from "@/modules/shared/layouts/candidate/CandidateLayoutContext";
import type { NextPageWithLayout } from "@/pages/_app";

const CandidateInterviewsPage: React.FC = () => {
  const { t } = useTranslation("dashboard");
  useCandidateLayout(t("candidate.nav.interviews"));
  return <CandidateInterviewsTabs />;
};

const Dynamic = dynamic(() => Promise.resolve(CandidateInterviewsPage), { ssr: false }) as NextPageWithLayout;
Dynamic.getLayout = getCandidateLayout;

export default Dynamic;
