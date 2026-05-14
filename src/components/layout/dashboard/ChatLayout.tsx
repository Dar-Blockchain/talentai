"use client";

import React from "react";
import { Box, Modal, CircularProgress, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { isLoggingOutCheck } from "@/store/slices/authSlice";
import { useTranslation } from "react-i18next";
import Header from "./Header";

interface ChatLayoutProps {
  children: React.ReactNode;
}

const HEADER_HEIGHT = 64;

const ChatLayout: React.FC<ChatLayoutProps> = ({ children }) => {
  const { t } = useTranslation("auth");
  const isLoggingOut = useSelector(isLoggingOutCheck);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Logout overlay */}
      <Modal open={isLoggingOut} disableAutoFocus>
        <Box sx={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          bgcolor: "rgba(255,255,255,0.85)", backdropFilter: "blur(6px)",
          gap: 2.5,
        }}>
          <Box sx={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
            bgcolor: "#fff", borderRadius: "20px", px: 5, py: 4,
            boxShadow: "0 8px 40px rgba(0,0,0,0.12)",
            border: "1px solid #E8EAED",
          }}>
            <CircularProgress size={40} sx={{ color: "#8310FF" }} />
            <Box sx={{ textAlign: "center" }}>
              <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: "#0F172A" }}>
                {t("logout.signing_out")}
              </Typography>
              <Typography sx={{ fontSize: "0.8125rem", color: "#94A3B8", mt: 0.5 }}>
                {t("logout.please_wait")}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Modal>

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
