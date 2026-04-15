"use client";

import React from "react";
import {
  Box,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuOutlined from "@mui/icons-material/MenuOutlined";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useRouter } from "next/router";
import { navigation } from "@/constants/navigation";
import UserHeader from "./UserHeader";
import HeaderNotification from "@/components/layout/header/HeaderNotification";
import HeaderChat from "./HeaderChat";
import GlobalSearch from "./GlobalSearch";

interface HeaderProps {
  onOpenMobile: () => void;
  breadcrumb: string;
}

const TEAL = "#0D9488";

const Header: React.FC<HeaderProps> = ({ onOpenMobile }) => {
  const theme   = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const router  = useRouter();

  const profile = useSelector((state: RootState) => state.user.connectedUser.profile);
  const user    = useSelector((state: RootState) => state.user.connectedUser.user);

  const isEmployee  = user?.role === "Employee" || user?.role === "Admin" || user?.role === "Candidate";
  const companyName = isEmployee
    ? `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim() || user?.username || "Employee"
    : profile?.companyDetails?.name || "Company";
  const companyInitial = companyName[0]?.toUpperCase() || "C";
  const avatarUrl = profile?.user_image
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}images/Users/${profile.user_image}`
    : null;

  // Resolve current page label + icon
  const currentNav = navigation.find(
    (i) => router.pathname === i.href || router.pathname.startsWith(i.href + "/")
  );
  const PageIcon = currentNav?.icon;
  const pageLabel = currentNav?.label || "Dashboard";

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
      {/* ── Left: mobile menu + page title ── */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        {isMobile && (
          <IconButton
            onClick={onOpenMobile}
            size="small"
            sx={{
              color: "#6B7280", width: 34, height: 34, borderRadius: "9px",
              bgcolor: "#F9FAFB", border: "1px solid #F3F4F6",
              "&:hover": { bgcolor: "#F3F4F6" },
            }}
          >
            <MenuOutlined sx={{ fontSize: 18 }} />
          </IconButton>
        )}

        {/* Page title with icon */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {PageIcon && (
            <Box sx={{
              width: 30, height: 30, borderRadius: "8px",
              bgcolor: `${TEAL}10`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <PageIcon sx={{ fontSize: 15, color: TEAL }} />
            </Box>
          )}
          <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>
            {pageLabel}
          </Typography>
        </Box>
      </Box>

      {/* ── Right: search + actions + user ── */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
        <GlobalSearch />

        <Box sx={{ width: "1px", height: 22, bgcolor: "#E5E7EB", mx: 0.25 }} />

        {/* Chat */}
        <Box
          sx={{
            "& .MuiIconButton-root": {
              width: 34, height: 34, borderRadius: "9px",
              bgcolor: "#F9FAFB", border: "1px solid #F3F4F6",
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
              width: 34, height: 34, borderRadius: "9px",
              bgcolor: "#F9FAFB", border: "1px solid #F3F4F6",
              color: "#6B7280",
              "&:hover": { bgcolor: "#F3F4F6", color: "#374151" },
              transition: "all 0.15s",
            },
          }}
          data-tour="header-notif"
        >
          <HeaderNotification />
        </Box>

        {/* Divider */}
        <Box sx={{ width: "1px", height: 22, bgcolor: "#E5E7EB", mx: 0.5 }} />

        {/* User */}
        <UserHeader companyName={companyName} companyInitial={companyInitial} avatarUrl={avatarUrl} />
      </Box>
    </Box>
  );
};

export default Header;
