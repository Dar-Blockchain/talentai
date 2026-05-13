import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import ChatShell from "@/components/features/chat/ChatShell";
import { RootState } from "@/store/store";
import { ChatModulePageFrame } from "@/modules/shared/chat";
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
    onConversationChange: (id) => {
      onConversationChange?.(id);
      window.history.replaceState(null, "", `${teamChatBasePath}/${id}`);
    },
  });

  const subTabs = (
    <ChatSegmentedControl<"messages" | "colleagues">
      value={tab}
      options={[
        { value: "messages", label: t("tabs.messages") },
        { value: "colleagues", label: t("tabs.colleagues") },
      ]}
      onChange={setTab}
    />
  );

  return (
    <ChatModulePageFrame
      title={t("title")}
      subtitle={t("subtitle")}
      fillHeight={fillHeight}
      embeddedInCompanyHub={embeddedInCompanyHub}
      headerAside={subTabs}
    >
      {tab === "colleagues" ? (
        <TeamChatColleaguesPanel />
      ) : (
        <ChatShell
          conversations={session.conversations}
          conversation={session.conversation}
          messages={session.messages}
          activeConversationId={session.activeConversationId}
          currentUserId={session.currentUserId}
          otherUser={session.otherUser}
          loading={session.loading}
          sending={session.sending}
          isCompany
          enableDeletes={false}
          newMessage={session.newMessage}
          setNewMessage={session.setNewMessage}
          onSend={session.handleSendMessage}
          onKeyDown={session.handleKeyDown}
          deleteDialogOpen={false}
          setDeleteDialogOpen={() => {}}
          isDeleting={false}
          onDeleteMessage={() => {}}
          onConfirmDelete={() => {}}
          onSelectConversation={session.handleSelectConversation}
        />
      )}
    </ChatModulePageFrame>
  );
};

export default TeamChatPageContent;
