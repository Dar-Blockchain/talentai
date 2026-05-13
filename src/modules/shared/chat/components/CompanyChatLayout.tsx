import React from "react";
import { Box } from "@mui/material";
import CompanyChatTopNav from "@/modules/shared/chat/components/CompanyChatTopNav";
import type { CompanyChatChannel } from "@/modules/shared/chat/constants/companyChannels";
import { companyChatSx } from "@/modules/shared/chat/styles/companyChat";

interface CompanyChatLayoutProps {
  activeChannel: CompanyChatChannel;
  children: React.ReactNode;
}

const CompanyChatLayout: React.FC<CompanyChatLayoutProps> = ({ activeChannel, children }) => (
  <Box sx={companyChatSx.workspace}>
    <CompanyChatTopNav activeChannel={activeChannel} />
    <Box sx={companyChatSx.content}>{children}</Box>
  </Box>
);

export default CompanyChatLayout;
