import React from "react";
import { useRouter } from "next/router";
import { Box } from "@mui/material";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import TeamChatPageContent from "@/modules/team-chat/components/TeamChatPageContent";

export default function CompanyTeamChatConversationPage() {
  const router = useRouter();
  const { conversationId } = router.query;
  const routeId = typeof conversationId === "string" ? conversationId : null;

  return (
    <DashboardLayout>
      <Box sx={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
        <TeamChatPageContent initialConversationId={routeId} />
      </Box>
    </DashboardLayout>
  );
}
