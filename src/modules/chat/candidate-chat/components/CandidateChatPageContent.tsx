import React, { memo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { UserSearch as PersonSearchOutlined, MessagesSquare as ForumOutlined } from "lucide-react";
import { RootState } from "@/store/store";
import CompanyHubChatFrame from "@/modules/chat/shared/components/CompanyHubChatFrame";
import CompanyHubMintChatShell from "@/modules/chat/shared/components/CompanyHubMintChatShell";
import { useCandidateChatSession } from "@/modules/chat/candidate-chat/hooks/useCandidateChatSession";
import { getCandidateChatBasePath } from "@/modules/chat/candidate-chat/utils/routes";

// Static icon nodes — defined outside the component so they never get recreated.
const titleIconClass = "flex h-9 w-9 items-center justify-center rounded-xl text-[#10B981] bg-[#ECFDF5] border border-[rgba(52,211,153,0.25)] shadow-[0_4px_20px_rgba(15,23,42,0.05)]";

const companyTitleIcon = (
  <div aria-hidden className={titleIconClass}>
    <PersonSearchOutlined size={20} />
  </div>
);

const candidateTitleIcon = (
  <div aria-hidden className={titleIconClass}>
    <ForumOutlined size={20} />
  </div>
);

interface CandidateChatPageContentProps {
  initialConversationId: string | null;
  isCompany: boolean;
  enableDeletes?: boolean;
  fillHeight?: boolean;
  embeddedInCompanyHub?: boolean;
  onConversationChange?: (id: string) => void;
}

const CandidateChatPageContent = memo(function CandidateChatPageContent({
  initialConversationId,
  isCompany,
  enableDeletes,
  fillHeight = false,
  embeddedInCompanyHub = false,
  onConversationChange,
}: CandidateChatPageContentProps) {
  const router = useRouter();
  const { t: tCandidate } = useTranslation("modules/candidates/candidateChat");
  const { t: tCompanyHub } = useTranslation("modules/company/companyChat");
  const role = useSelector((state: RootState) => state.user.connectedUser.user?.role);
  const basePath = getCandidateChatBasePath(role);

  const handleConversationChange = useCallback(
    (id: string) => {
      onConversationChange?.(id);
      void router.replace(`${basePath}/${id}`, undefined, { scroll: false });
    },
    [onConversationChange, basePath, router],
  );

  const session = useCandidateChatSession({
    initialConversationId,
    deleteRedirectRoute: basePath,
    enableDeletes: enableDeletes ?? true,
    onConversationChange: handleConversationChange,
  });

  if (isCompany) {
    const embedded = embeddedInCompanyHub || isCompany;
    return (
      <CompanyHubChatFrame
        title={tCompanyHub("channels.candidate.title")}
titleStartAdornment={companyTitleIcon}
        fillHeight={fillHeight}
        embeddedInCompanyHub={embedded}
      >
        <CompanyHubMintChatShell
          isCompany
          teamScopedMessageDeletes
          conversations={session.conversations}
          conversation={session.conversation}
          messages={session.messages}
          activeConversationId={session.activeConversationId}
          currentUserId={session.currentUserId}
          otherUser={session.otherUser}
          loading={session.loading}
          sending={session.sending}
          deleteConversationTitle={tCompanyHub("delete_chat_title")}
          deleteConversationDescription={tCompanyHub("delete_chat_for_me_body")}
          onSend={session.handleSendMessage}
          onDeleteMessage={session.handleDeleteMessage}
          onDeleteConversation={session.executeDeleteConversation}
          onSelectConversation={session.handleSelectConversation}
        />
      </CompanyHubChatFrame>
    );
  }

  return (
    <CompanyHubChatFrame
      title={tCandidate("candidate.title")}
      titleStartAdornment={candidateTitleIcon}
      fillHeight={fillHeight}
      embeddedInCompanyHub={embeddedInCompanyHub}
    >
      <CompanyHubMintChatShell
        isCompany={false}
        teamScopedMessageDeletes
        conversations={session.conversations}
        conversation={session.conversation}
        messages={session.messages}
        activeConversationId={session.activeConversationId}
        currentUserId={session.currentUserId}
        otherUser={session.otherUser}
        loading={session.loading}
        sending={session.sending}
        enableDeletes={enableDeletes ?? true}
        deleteConversationTitle={tCandidate("delete_chat_title")}
        deleteConversationDescription={tCandidate("delete_chat_for_me_body")}
        onSend={session.handleSendMessage}
        onDeleteMessage={session.handleDeleteMessage}
        onDeleteConversation={session.executeDeleteConversation}
        onSelectConversation={session.handleSelectConversation}
      />
    </CompanyHubChatFrame>
  );
});

export default CandidateChatPageContent;
