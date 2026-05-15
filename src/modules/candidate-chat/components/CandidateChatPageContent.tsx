import React from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { Box } from "@mui/material";
import PersonSearchOutlined from "@mui/icons-material/PersonSearchOutlined";
import ForumOutlined from "@mui/icons-material/ForumOutlined";
import { RootState } from "@/store/store";
import CompanyHubChatFrame from "@/modules/shared/chat/components/CompanyHubChatFrame";
import CompanyHubMintChatShell from "@/modules/shared/chat/components/CompanyHubMintChatShell";
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
  const router = useRouter();
  const { t: tCandidate } = useTranslation("modules/candidates/candidateChat");
  const { t: tCompanyHub } = useTranslation("modules/company/companyChat");
  const role = useSelector((state: RootState) => state.user.connectedUser.user?.role);
  const basePath = getCandidateChatBasePath(role);

  const session = useCandidateChatSession({
    initialConversationId,
    deleteRedirectRoute: basePath,
    enableDeletes: enableDeletes ?? true,
    onConversationChange: (id) => {
      onConversationChange?.(id);
      const href = `${basePath}/${id}`;
      void router.replace(href, undefined, { scroll: false });
    },
  });

  const companyTitleIcon = (
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
      <PersonSearchOutlined sx={{ fontSize: 20 }} />
    </Box>
  );

  const candidateTitleIcon = (
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
      <ForumOutlined sx={{ fontSize: 20 }} />
    </Box>
  );

  if (isCompany) {
    const embedded = embeddedInCompanyHub || isCompany;
    return (
      <CompanyHubChatFrame
        title={tCompanyHub("channels.candidate.title")}
        subtitle={tCompanyHub("channels.candidate.subtitle")}
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
      </CompanyHubChatFrame>
    );
  }

  return (
    <CompanyHubChatFrame
      title={tCandidate("candidate.title")}
      subtitle={tCandidate("candidate.subtitle")}
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
    </CompanyHubChatFrame>
  );
};

export default CandidateChatPageContent;
