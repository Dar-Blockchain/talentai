"use client";

import React from "react";
import { Box } from "@mui/material";
import Header from "./DashboardHeader";

interface ChatLayoutProps {
  children: React.ReactNode;
}

const HEADER_HEIGHT = 64;

const ChatLayout: React.FC<ChatLayoutProps> = ({ children }) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Fixed header */}
      <Box sx={{
        position: "fixed",
        top: 0, left: 0, right: 0,
        height: HEADER_HEIGHT,
        zIndex: 1200,
      }}>
        <Header onOpenMobile={() => {}} />
      </Box>

      {/* Content — full width, no sidebar */}
      <Box sx={{
        flex: 1,
        mt: `${HEADER_HEIGHT}px`,
        height: `calc(100vh - ${HEADER_HEIGHT}px)`,
        overflow: "hidden",
        backgroundColor: "rgb(249 250 251)",
        display: "flex",
        flexDirection: "column",
        p: { xs: 1.5, sm: 2.5, md: 3 },
      }}>
        {children}
      </Box>
    </Box>
  );
};

export default ChatLayout;
