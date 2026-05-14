import React, { useEffect, useState } from "react";
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

interface TeamChatPageContentProps {
  initialConversationId: string | null;
  fillHeight?: boolean;
  embeddedInCompanyHub?: boolean;
  onConversationChange?: (id: string) => void;
}

const TeamChatPageContent: React.FC<TeamChatPageContentProps> = ({
  initialConversationId,
  fillHeight = false,
  embeddedInCompanyHub = false,
  onConversationChange,
}) => {
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

  const session = useTeamChatSession({
    initialConversationId,
    deleteRedirectRoute: teamChatBasePath,
    onConversationChange: (id) => {
      onConversationChange?.(id);
      const href = `${teamChatBasePath}/${id}`;
      void router.replace(href, undefined, { scroll: false });
    },
  });

  const subTabs = (
    <ChatSegmentedControl<"messages" | "colleagues">
      fullWidth
      mintLightTeamUi
      value={tab}
      options={[
        { value: "messages", label: t("tabs.messages") },
        { value: "colleagues", label: t("tabs.colleagues") },
      ]}
      onChange={setTab}
    />
  );

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
          newMessage={session.newMessage}
          setNewMessage={session.setNewMessage}
          onSend={session.handleSendMessage}
          onKeyDown={session.handleKeyDown}
          deleteDialogOpen={session.deleteDialogOpen}
          setDeleteDialogOpen={session.setDeleteDialogOpen}
          isDeleting={session.isDeleting}
          onDeleteMessage={session.handleDeleteMessage}
          onConfirmDelete={session.handleConfirmDeleteConversation}
          onSelectConversation={session.handleSelectConversation}
          onRequestDeleteConversation={session.requestDeleteConversation}
          resetDeleteConversationTarget={session.resetDeleteConversationTarget}
        />
      )}
    </CompanyHubChatFrame>
  );
};

export default TeamChatPageContent;
