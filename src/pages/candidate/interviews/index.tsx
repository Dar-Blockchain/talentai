import React from "react";
import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";
import CandidateWorkspaceLayout from "@/modules/shared/layouts/candidate/CandidateWorkspaceLayout";
import CandidateProfilePanel    from "@/modules/candidate/profile/CandidateProfilePanel";
import { CandidateInterviewsTabs } from "@/modules/candidate/interviews";

const CandidateInterviewsPage: React.FC = () => {
  const { t } = useTranslation("dashboard");

  return (
    <CandidateWorkspaceLayout
      breadcrumb={t("candidate.nav.interviews")}
      leftPanel={<CandidateProfilePanel />}
    >
      <CandidateInterviewsTabs />
    </CandidateWorkspaceLayout>
  );
};

export default dynamic(() => Promise.resolve(CandidateInterviewsPage), { ssr: false });
