import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { Box } from "@mui/material";
import GroupsRounded from "@mui/icons-material/GroupsRounded";
import { RootState } from "@/store/store";
import CompanyHubChatFrame from "@/modules/shared/chat/components/CompanyHubChatFrame";
import CompanyHubMintChatShell from "@/modules/shared/chat/components/CompanyHubMintChatShell";
import ChatSegmentedControl from "@/modules/shared/chat/components/ChatSegmentedControl";
import { useTeamChatSession } from "@/modules/team-chat/hooks/useTeamChatSession";
import TeamChatColleaguesPanel from "./TeamChatColleaguesPanel";
import { getTeamChatBasePath } from "@/modules/team-chat/utils/routes";

// Static icon node — defined outside the component so it's never recreated.
const titleIcon = (
  <Box
    aria-hidden
    sx={{
      width: 36,
      height: 36,
      borderRadius: "12px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#10B981",
      bgcolor: "#ECFDF5",
      border: "1px solid rgba(52, 211, 153, 0.25)",
      boxShadow: "0 4px 20px rgba(15, 23, 42, 0.05)",
    }}
  >
    <GroupsRounded sx={{ fontSize: 20 }} />
  </Box>
);

interface TeamChatPageContentProps {
  initialConversationId: string | null;
  fillHeight?: boolean;
  embeddedInCompanyHub?: boolean;
  onConversationChange?: (id: string) => void;
}

const TeamChatPageContent = memo(function TeamChatPageContent({
  initialConversationId,
  fillHeight = false,
  embeddedInCompanyHub = false,
  onConversationChange,
}: TeamChatPageContentProps) {
  const { t } = useTranslation("modules/company/teamChat");
  const router = useRouter();
  const role = useSelector((state: RootState) => state.user.connectedUser.user?.role);
  const teamChatBasePath = getTeamChatBasePath(role);
  const [tab, setTab] = useState<"messages" | "colleagues">("messages");

  useEffect(() => {
    if (initialConversationId) {
      setTab("messages");
      return;
    }
    if (router.query.tab === "colleagues") {
      setTab("colleagues");
    }
  }, [initialConversationId, router.query.tab]);

  const handleConversationChange = useCallback(
    (id: string) => {
      onConversationChange?.(id);
      void router.replace(`${teamChatBasePath}/${id}`, undefined, { scroll: false });
    },
    [onConversationChange, teamChatBasePath, router],
  );

  const session = useTeamChatSession({
    initialConversationId,
    deleteRedirectRoute: teamChatBasePath,
    onConversationChange: handleConversationChange,
  });

  const tabOptions = useMemo(
    () => [
      { value: "messages" as const, label: t("tabs.messages") },
      { value: "colleagues" as const, label: t("tabs.colleagues") },
    ],
    [t],
  );

  const subTabs = useMemo(
    () => (
      <ChatSegmentedControl<"messages" | "colleagues">
        fullWidth
        mintLightTeamUi
        value={tab}
        options={tabOptions}
        onChange={setTab}
      />
    ),
    [tab, tabOptions],
  );

  return (
    <CompanyHubChatFrame
      title={t("title")}
      subtitle={role === "Employee" ? undefined : t("subtitle")}
      titleStartAdornment={titleIcon}
      fillHeight={fillHeight}
      embeddedInCompanyHub={embeddedInCompanyHub}
      bodyTopBar={subTabs}
    >
      {tab === "colleagues" ? (
        <TeamChatColleaguesPanel />
      ) : (
        <CompanyHubMintChatShell
          isCompany
          conversations={session.conversations}
          conversation={session.conversation}
          messages={session.messages}
          activeConversationId={session.activeConversationId}
          currentUserId={session.currentUserId}
          otherUser={session.otherUser}
          loading={session.loading}
          sending={session.sending}
          teamScopedMessageDeletes
          deleteConversationTitle={t("delete_chat_title")}
          deleteConversationDescription={t("delete_chat_for_me_body")}
          onSend={session.handleSendMessage}
          onDeleteMessage={session.handleDeleteMessage}
          onDeleteConversation={session.executeDeleteConversation}
          onSelectConversation={session.handleSelectConversation}
        />
      )}
    </CompanyHubChatFrame>
  );
});

export default TeamChatPageContent;
