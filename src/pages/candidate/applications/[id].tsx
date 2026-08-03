import React from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import ApplicationDetail from "@/modules/candidate/applications/components/ApplicationDetail";
import { getCandidateLayout } from "@/modules/shared/layouts/candidate/getCandidateLayout";
import { useCandidateLayout } from "@/modules/shared/layouts/candidate/CandidateLayoutContext";
import type { NextPageWithLayout } from "@/pages/_app";

const CandidateApplicationDetailPage: React.FC = () => {
  const { t }  = useTranslation("dashboard");
  const router = useRouter();
  const id     = String(router.query.id ?? "");
  useCandidateLayout(t("candidate.nav.applications"));
  return id ? <ApplicationDetail id={id} /> : null;
};

const Dynamic = dynamic(() => Promise.resolve(CandidateApplicationDetailPage), { ssr: false }) as NextPageWithLayout;
Dynamic.getLayout = getCandidateLayout;

export default Dynamic;
