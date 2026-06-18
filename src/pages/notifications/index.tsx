import type { ReactElement } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useAuthContext } from "@/modules/auth/shared/context/AuthContext";
import LoadingScreen from "@/components/ui/LoadingScreen";
import { CandidateNotificationsPanel } from "@/modules/notifications/candidate";
import { CandidateWorkspaceLayout, DashboardLayout } from "@/modules/shared/layouts";
import type { NextPageWithLayout } from "@/pages/_app";

// Role-aware layout switcher: the role itself doesn't change during a session,
// so this still mounts its chosen layout once and keeps it persistent across
// navigation — exactly like every other dashboard page's `getLayout`. It's a
// separate component (not an inline arrow per render) so its identity stays
// stable across re-renders of `_app`.
function NotificationsLayout({ children }: { children: ReactElement }) {
  const user = useSelector((state: RootState) => state.user.connectedUser.user);
  const { isLoggingOut } = useAuthContext();

  // During logout the user is cleared from the store. Without this guard the
  // role check below would fall back to the company DashboardLayout, flashing
  // the company UI to candidates/employees before the redirect to /signin.
  if (isLoggingOut || !user) {
    return <LoadingScreen />;
  }

  if (user.role === "Candidate") {
    return <CandidateWorkspaceLayout>{children}</CandidateWorkspaceLayout>;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}

const NotificationsPage: NextPageWithLayout = function NotificationsPage() {
  return <CandidateNotificationsPanel variant="page" />;
};
NotificationsPage.getLayout = (page) => <NotificationsLayout>{page}</NotificationsLayout>;

export default NotificationsPage;
