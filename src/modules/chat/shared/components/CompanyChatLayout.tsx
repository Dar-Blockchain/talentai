import React from "react";
import { Box } from "@mui/material";
import CompanyChatTopNav from "@/modules/chat/shared/components/CompanyChatTopNav";
import type { CompanyChatChannel } from "@/modules/chat/shared/constants/companyChannels";
import { companyChatSx } from "@/modules/chat/shared/styles/companyChat";

interface CompanyChatLayoutProps {
  activeChannel: CompanyChatChannel;
  children: React.ReactNode;
}

const CompanyChatLayout: React.FC<CompanyChatLayoutProps> = ({ activeChannel, children }) => (
  <Box
    sx={{
      ...companyChatSx.workspace,
      ...(activeChannel === "team" ? companyChatSx.workspaceTeamDense : {}),
    }}
  >
    <CompanyChatTopNav activeChannel={activeChannel} />
    <Box sx={companyChatSx.content}>{children}</Box>
  </Box>
);

export default CompanyChatLayout;
