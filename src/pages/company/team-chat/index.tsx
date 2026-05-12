import React from "react";
import { Box } from "@mui/material";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import TeamChatPageContent from "@/modules/team-chat/components/TeamChatPageContent";

export default function CompanyTeamChatIndexPage() {
  return (
    <DashboardLayout>
      <Box sx={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
        <TeamChatPageContent initialConversationId={null} />
      </Box>
    </DashboardLayout>
  );
}
