import React, { type ReactElement } from "react";
import CandidateWorkspaceLayout from "./CandidateWorkspaceLayout";
import CandidateProfilePanel from "@/modules/candidate/profile/CandidateProfilePanel";
import { CandidateLayoutProvider, useCandidateLayoutContext } from "./CandidateLayoutContext";

/**
 * Bridge components live at module scope so their references are stable across
 * navigations. React reconciles them in place (no remount) when the same
 * getLayout function is called on each route change.
 */
const WithProfilePanel: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { breadcrumb } = useCandidateLayoutContext();
  return (
    <CandidateWorkspaceLayout breadcrumb={breadcrumb} leftPanel={<CandidateProfilePanel />}>
      {children}
    </CandidateWorkspaceLayout>
  );
};

const WithoutPanel: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { breadcrumb } = useCandidateLayoutContext();
  return (
    <CandidateWorkspaceLayout breadcrumb={breadcrumb}>
      {children}
    </CandidateWorkspaceLayout>
  );
};

/** Layout with profile sidebar — used by most candidate pages. */
export function getCandidateLayout(page: ReactElement) {
  return (
    <CandidateLayoutProvider>
      <WithProfilePanel>{page}</WithProfilePanel>
    </CandidateLayoutProvider>
  );
}

/** Layout without left panel — used by full-screen candidate pages (e.g. interview report). */
export function getCandidateLayoutSlim(page: ReactElement) {
  return (
    <CandidateLayoutProvider>
      <WithoutPanel>{page}</WithoutPanel>
    </CandidateLayoutProvider>
  );
}
