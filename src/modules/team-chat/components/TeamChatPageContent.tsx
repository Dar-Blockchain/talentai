import React, { useEffect, useState } from "react";
import { Box, Paper, Tab, Tabs, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import ChatShell from "@/components/features/chat/ChatShell";
import { RootState } from "@/store/store";
import { useTeamChatSession } from "@/modules/team-chat/hooks/useTeamChatSession";
import TeamChatColleaguesPanel from "./TeamChatColleaguesPanel";
import { getTeamChatBasePath } from "@/modules/team-chat/utils/routes";

interface TeamChatPageContentProps {
  initialConversationId: string | null;
  onConversationChange?: (id: string) => void;
}

const TeamChatPageContent: React.FC<TeamChatPageContentProps> = ({
  initialConversationId,
  onConversationChange,
}) => {
  const { t } = useTranslation("modules/teamChat/teamChat");
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

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "calc(100vh - 100px)", gap: 2 }}>
      <Paper
        elevation={0}
        sx={{
          px: 2.5,
          py: 2,
          borderRadius: "18px",
          border: "1px solid #E8EAED",
          bgcolor: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Box>
          <Typography sx={{ fontSize: "1.25rem", fontWeight: 700, color: "#111827" }}>
            {t("title")}
          </Typography>
          <Typography sx={{ fontSize: "13px", color: "#6B7280", mt: 0.25 }}>
            {t("subtitle")}
          </Typography>
        </Box>
        <Tabs
          value={tab}
          onChange={(_, value) => setTab(value)}
          sx={{
            minHeight: 40,
            bgcolor: "#F9FAFB",
            borderRadius: "12px",
            p: 0.5,
            "& .MuiTabs-indicator": { display: "none" },
            "& .MuiTab-root": {
              minHeight: 36,
              px: 2,
              textTransform: "none",
              fontWeight: 600,
              borderRadius: "10px",
              color: "#6B7280",
            },
            "& .Mui-selected": {
              bgcolor: "#fff",
              color: "#0F766E",
              boxShadow: "0 1px 3px rgba(15, 118, 110, 0.12)",
            },
          }}
        >
          <Tab value="messages" label={t("tabs.messages")} />
          <Tab value="colleagues" label={t("tabs.colleagues")} />
        </Tabs>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          flex: 1,
          minHeight: 0,
          borderRadius: "18px",
          border: "1px solid #E8EAED",
          bgcolor: "#fff",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
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
      </Paper>
    </Box>
  );
};

export default TeamChatPageContent;
