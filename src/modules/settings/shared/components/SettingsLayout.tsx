import type { ReactElement } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { RootState } from "@/store/store";
import DashboardLayout from "@/modules/shared/layouts/dashboard/DashboardLayout";
import CandidateWorkspaceLayout from "@/modules/shared/layouts/candidate/CandidateWorkspaceLayout";

/**
 * Role-aware layout for `/settings`. The settings page renders different
 * content per role (Company/Employee/Candidate) via `SettingsShell`, and
 * Candidates use the workspace shell instead of the dashboard shell. The role
 * itself is stable for the lifetime of a session, so this still mounts its
 * chosen layout once and keeps it persistent across navigation — same
 * contract as `getDashboardLayout`, just with a runtime branch instead of a
 * static import. Kept as a layout-selection component (not a content/shell
 * component), so it's the only place that's allowed to instantiate
 * `DashboardLayout` / `CandidateWorkspaceLayout` for this route.
 */
function SettingsLayout({ children }: { children: ReactElement }) {
  const { t } = useTranslation("dashboard");
  const role = useSelector((state: RootState) => state.user.connectedUser.user?.role);

  if (role === "Candidate") {
    return <CandidateWorkspaceLayout breadcrumb={t("candidate.nav.settings")}>{children}</CandidateWorkspaceLayout>;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}

export function getSettingsLayout(page: ReactElement) {
  return <SettingsLayout>{page}</SettingsLayout>;
}
