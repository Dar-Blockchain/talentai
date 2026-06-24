import React from "react";
import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";
import CandidateWorkspaceLayout from "@/modules/shared/layouts/candidate/CandidateWorkspaceLayout";
import CandidateProfilePanel from "@/modules/candidate/profile/CandidateProfilePanel";
import { CandidateApplicationsList } from "@/modules/candidate/applications";

const CandidateApplicationsPage: React.FC = () => {
  const { t } = useTranslation("dashboard");

  return (
    <CandidateWorkspaceLayout
      breadcrumb={t("candidate.nav.applications")}
      leftPanel={<CandidateProfilePanel />}
    >
      <CandidateApplicationsList />
    </CandidateWorkspaceLayout>
  );
};

export default dynamic(() => Promise.resolve(CandidateApplicationsPage), { ssr: false });
