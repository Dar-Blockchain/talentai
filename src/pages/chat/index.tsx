import { useEffect } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import ChatLayout from "@/components/layout/dashboard/ChatLayout";
import SharedChatIndexPage from "@/components/features/chat/SharedChatIndexPage";
import { RootState } from "@/store/store";
import { getTeamChatBasePath } from "@/modules/team-chat/utils/routes";

export default function ChatIndexPage() {
  const router = useRouter();
  const { t } = useTranslation("modules/chat/chat");
  const role = useSelector((state: RootState) => state.user.connectedUser.user?.role);
  const isCompany = role === "Company" || role === "Employee";

  useEffect(() => {
    if (role === "Company" || role === "Employee") {
      router.replace(getTeamChatBasePath(role));
    }
  }, [role, router]);
  const emptyText =
    role === "Company"
      ? t("index.empty_company")
      : role === "Employee"
        ? t("index.empty_employee")
        : t("index.empty_candidate");

  if (role === "Company" || role === "Employee") {
    return null;
  }

  return (
    <SharedChatIndexPage
      basePath="/chat"
      emptyText={emptyText}
      layout={isCompany ? DashboardLayout : ChatLayout}
    />
  );
}
