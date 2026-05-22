import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
} from "@mui/material";
import GroupsRounded from "@mui/icons-material/GroupsRounded";
import AddCommentOutlined from "@mui/icons-material/AddCommentOutlined";
import CloseRounded from "@mui/icons-material/CloseRounded";
import { RootState } from "@/store/store";
import CompanyHubChatFrame from "@/modules/chat/shared/components/CompanyHubChatFrame";
import CompanyHubMintChatShell from "@/modules/chat/shared/components/CompanyHubMintChatShell";
import { useTeamChatSession } from "@/modules/chat/team-chat/hooks/useTeamChatSession";
import TeamChatColleaguesPanel from "./TeamChatColleaguesPanel";
import { getTeamChatBasePath } from "@/modules/chat/team-chat/utils/routes";

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
  const [colleaguesOpen, setColleaguesOpen] = useState(false);

  useEffect(() => {
    if (router.query.tab === "colleagues") setColleaguesOpen(true);
  }, [router.query.tab]);

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

  const newChatButton = useMemo(
    () => (
      <Tooltip title={t("tabs.colleagues")} placement="top">
        <IconButton
          size="small"
          onClick={() => setColleaguesOpen(true)}
          sx={{
            bgcolor: "#10B981",
            color: "#fff",
            width: 36,
            height: 36,
            borderRadius: "12px",
            transition: "all 0.2s",
            boxShadow: "0 2px 8px rgba(16,185,129,0.3)",
            "&:hover": {
              bgcolor: "#059669",
              boxShadow: "0 4px 14px rgba(16,185,129,0.45)",
              transform: "translateY(-1px)",
            },
          }}
        >
          <AddCommentOutlined sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>
    ),
    [t],
  );

  return (
    <>
      <CompanyHubChatFrame
        title={t("title")}
        subtitle={role === "Employee" ? undefined : t("subtitle")}
        titleStartAdornment={titleIcon}
        fillHeight={fillHeight}
        embeddedInCompanyHub={embeddedInCompanyHub}
      >
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
          sidebarFooter={newChatButton}
        />
      </CompanyHubChatFrame>

      <Dialog
        open={colleaguesOpen}
        onClose={() => setColleaguesOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "20px",
            overflow: "hidden",
            height: "72vh",
            display: "flex",
            flexDirection: "column",
            border: "1px solid #E5E7EB",
            boxShadow: "0 24px 48px rgba(15,23,42,0.14)",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2.5,
            py: 1.5,
            borderBottom: "1px solid #E5E7EB",
            bgcolor: "#FFFFFF",
            flexShrink: 0,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 30,
                height: 30,
                borderRadius: "10px",
                bgcolor: "#ECFDF5",
                border: "1px solid rgba(52,211,153,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <GroupsRounded sx={{ fontSize: 16, color: "#10B981" }} />
            </Box>
            <Box
              component="span"
              sx={{
                fontFamily: "Poppins, sans-serif",
                fontWeight: 700,
                fontSize: "0.9375rem",
                color: "#111827",
                letterSpacing: "-0.02em",
              }}
            >
              {t("tabs.colleagues")}
            </Box>
          </Box>
          <IconButton
            size="small"
            onClick={() => setColleaguesOpen(false)}
            sx={{
              color: "#6B7280",
              borderRadius: "10px",
              "&:hover": { bgcolor: "#F3F4F6", color: "#111827" },
            }}
          >
            <CloseRounded sx={{ fontSize: 20 }} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <TeamChatColleaguesPanel onClose={() => { setColleaguesOpen(false); }} />
        </DialogContent>
      </Dialog>
    </>
  );
});

export default TeamChatPageContent;
