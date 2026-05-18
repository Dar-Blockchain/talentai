import React from "react";
import { useRouter } from "next/router";
import { Box, CircularProgress } from "@mui/material";
import MessagesShell from "@/modules/shared/chat/components/MessagesShell";

export default function MessagesConversationPage() {
  const router = useRouter();
  const { conversationId } = router.query;
  const routeId = typeof conversationId === "string" ? conversationId : null;

  if (!router.isReady) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 280 }}>
        <CircularProgress sx={{ color: "#0D9488" }} />
      </Box>
    );
  }

  return <MessagesShell conversationId={routeId} />;
}
