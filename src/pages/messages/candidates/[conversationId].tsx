import React from "react";
import { useRouter } from "next/router";
import { Box, CircularProgress } from "@mui/material";
import CandidatesMessagesShell from "@/modules/shared/chat/components/CandidatesMessagesShell";

export default function CompanyCandidateMessagesConversationPage() {
  const router = useRouter();
  const { conversationId } = router.query;
  const routeId = typeof conversationId === "string" ? conversationId : null;

  if (!router.isReady) {
    return (
      <Box sx={{ display: "flex", flex: 1, justifyContent: "center", alignItems: "center", minHeight: 280 }}>
        <CircularProgress sx={{ color: "#0D9488" }} />
      </Box>
    );
  }

  return <CandidatesMessagesShell conversationId={routeId} />;
}
