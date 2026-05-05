"use client";

import React from "react";
import {
  Box,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuOutlined from "@mui/icons-material/MenuOutlined";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import HeaderNotification from "@/components/layout/header/HeaderNotification";
import HeaderChat from "./HeaderChat";
import GlobalSearch from "./GlobalSearch";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import UserAvatar from "../header/UserAvatar";
import Image from "next/image";

interface HeaderProps {
  onOpenMobile: () => void;
  breadcrumb?: string;
}

const Header: React.FC<HeaderProps> = ({ onOpenMobile }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const user = useSelector((state: RootState) => state.user.connectedUser.user);

  const isCandidate = user?.role === "Candidate";

  return (
    <Box
      sx={{
        height: 64,
        bgcolor: "#fff",
        borderBottom: "1px solid #F3F4F6",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: { xs: 2, md: 3 },
      }}
    >
      {/* ── Left: mobile menu + logo ── */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        {isMobile && (
          <IconButton
            onClick={onOpenMobile}
            size="small"
            sx={{
              color: "#6B7280",
              width: 34,
              height: 34,
              borderRadius: "9px",
              bgcolor: "#F9FAFB",
              border: "1px solid #F3F4F6",
              "&:hover": { bgcolor: "#F3F4F6" },
            }}
          >
            <MenuOutlined sx={{ fontSize: 18 }} />
          </IconButton>
        )}

        {/* Logo — candidates only */}
        {isCandidate && (
          <Image src="/logo.svg" alt="TalentAI" width={120} height={32} style={{ objectFit: "contain" }} />
        )}
      </Box>

      {/* ── Right: search + actions + user ── */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
        {!isCandidate && <GlobalSearch />}
        {!isCandidate && <Box sx={{ width: "1px", height: 22, bgcolor: "#E5E7EB", mx: 0.25 }} />}
        {/* Chat */}
        <Box
          sx={{
            "& .MuiIconButton-root": {
              width: 34,
              height: 34,
              borderRadius: "9px",
              bgcolor: "#F9FAFB",
              border: "1px solid #F3F4F6",
              color: "#6B7280",
              "&:hover": { bgcolor: "#F3F4F6", color: "#374151" },
              transition: "all 0.15s",
            },
          }}
          data-tour="header-chat"
        >
          <HeaderChat />
        </Box>
        {/* Notifications */}
        <Box
          sx={{
            "& .MuiIconButton-root": {
              width: 34,
              height: 34,
              borderRadius: "9px",
              bgcolor: "#F9FAFB",
              border: "1px solid #F3F4F6",
              color: "#6B7280",
              "&:hover": { bgcolor: "#F3F4F6", color: "#374151" },
              transition: "all 0.15s",
            },
          }}
          data-tour="header-notif"
        >
          <HeaderNotification />
        </Box>
        {/* Language */}
        <LanguageSwitcher variant="icon" size="small" />
        {/* Divider */}
        <Box sx={{ width: "1px", height: 22, bgcolor: "#E5E7EB", mx: 0.5 }} />
        {/* User */}
        <UserAvatar />{" "}
      </Box>
    </Box>
  );
};

export default Header;
