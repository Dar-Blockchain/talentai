import React from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import ChatShell from "@/components/features/chat/ChatShell";
import { RootState } from "@/store/store";
import { ChatModulePageFrame } from "@/modules/shared/chat";
import { useCandidateChatSession } from "@/modules/candidate-chat/hooks/useCandidateChatSession";
import { getCandidateChatBasePath } from "@/modules/candidate-chat/utils/routes";

interface CandidateChatPageContentProps {
  initialConversationId: string | null;
  isCompany: boolean;
  enableDeletes?: boolean;
  fillHeight?: boolean;
  embeddedInCompanyHub?: boolean;
  onConversationChange?: (id: string) => void;
}

const CandidateChatPageContent: React.FC<CandidateChatPageContentProps> = ({
  initialConversationId,
  isCompany,
  enableDeletes,
  fillHeight = false,
  embeddedInCompanyHub = false,
  onConversationChange,
}) => {
  const { t: tCandidate } = useTranslation("modules/candidates/candidateChat");
  const { t: tCompanyHub } = useTranslation("modules/company/companyChat");
  const role = useSelector((state: RootState) => state.user.connectedUser.user?.role);
  const basePath = getCandidateChatBasePath(role);

  const session = useCandidateChatSession({
    initialConversationId,
    deleteRedirectRoute: basePath,
    enableDeletes: enableDeletes ?? !isCompany,
    onConversationChange: (id) => {
      onConversationChange?.(id);
      window.history.replaceState(null, "", `${basePath}/${id}`);
    },
  });

  return (
    <ChatModulePageFrame
      title={isCompany ? tCompanyHub("channels.candidate.title") : tCandidate("candidate.title")}
      subtitle={isCompany ? tCompanyHub("channels.candidate.subtitle") : tCandidate("candidate.subtitle")}
      fillHeight={fillHeight}
      embeddedInCompanyHub={embeddedInCompanyHub || isCompany}
    >
      <ChatShell
        conversations={session.conversations}
        conversation={session.conversation}
        messages={session.messages}
        activeConversationId={session.activeConversationId}
        currentUserId={session.currentUserId}
        otherUser={session.otherUser}
        loading={session.loading}
        sending={session.sending}
        isCompany={isCompany}
        showConversationSidebar
        enableDeletes={enableDeletes ?? !isCompany}
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
      />
    </ChatModulePageFrame>
  );
};

export default CandidateChatPageContent;
