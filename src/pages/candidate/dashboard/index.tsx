import React from "react";
import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";
import { CandidateDashboard } from "@/modules/candidate/dashboard";
import { getCandidateLayout } from "@/modules/shared/layouts/candidate/getCandidateLayout";
import { useCandidateLayout } from "@/modules/shared/layouts/candidate/CandidateLayoutContext";
import type { NextPageWithLayout } from "@/pages/_app";

const DashboardPage: React.FC = () => {
  const { t } = useTranslation("dashboard");
  useCandidateLayout(t("candidate.nav.dashboard"));
  return <CandidateDashboard />;
};

const Dynamic = dynamic(() => Promise.resolve(DashboardPage), { ssr: false }) as NextPageWithLayout;
Dynamic.getLayout = getCandidateLayout;

export default Dynamic;
