import React from "react";
import { Box, Paper, Typography } from "@mui/material";
import { chatModulePageSx } from "@/modules/shared/chat/styles/modulePage";
import { companyChatSx } from "@/modules/shared/chat/styles/companyChat";

interface ChatModulePageFrameProps {
  title: string;
  subtitle: string;
  headerAside?: React.ReactNode;
  fillHeight?: boolean;
  embeddedInCompanyHub?: boolean;
  children: React.ReactNode;
}

const ChatModulePageFrame: React.FC<ChatModulePageFrameProps> = ({
  title,
  subtitle,
  headerAside,
  fillHeight = false,
  embeddedInCompanyHub = false,
  children,
}) => {
  if (embeddedInCompanyHub) {
    return (
      <Box sx={{ ...chatModulePageSx.root, ...(fillHeight ? chatModulePageSx.rootFill : {}), gap: 0 }}>
        <Paper elevation={0} sx={chatModulePageSx.bodyPaper}>
          {headerAside && (
            <Box sx={companyChatSx.toolbar}>
              {headerAside}
            </Box>
          )}
          <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
            {children}
          </Box>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ ...chatModulePageSx.root, ...(fillHeight ? chatModulePageSx.rootFill : {}) }}>
      <Paper
        elevation={0}
        sx={{
          ...chatModulePageSx.headerPaper,
          ...(headerAside
            ? {
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                flexWrap: "wrap",
              }
            : {}),
        }}
      >
        <Box>
          <Typography sx={chatModulePageSx.title}>{title}</Typography>
          <Typography sx={chatModulePageSx.subtitle}>{subtitle}</Typography>
        </Box>
        {headerAside}
      </Paper>

      <Paper elevation={0} sx={chatModulePageSx.bodyPaper}>
        {children}
      </Paper>
    </Box>
  );
};

export default ChatModulePageFrame;
