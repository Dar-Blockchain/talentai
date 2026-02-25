// src/components/dashboard/Header.tsx
"use client";

import React from "react";
import { Box, Typography, IconButton, InputBase, Avatar, Badge, useMediaQuery, useTheme } from "@mui/material";
import MenuOutlined from "@mui/icons-material/MenuOutlined";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import NotificationsOutlined from "@mui/icons-material/NotificationsOutlined";
import KeyboardArrowDownOutlined from "@mui/icons-material/KeyboardArrowDownOutlined";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import UserHeader from "./UserHeader";
import ChatOutlined from "@mui/icons-material/ChatOutlined";
interface HeaderProps {
  onOpenMobile: () => void;
  breadcrumb: string;
}

const Header: React.FC<HeaderProps> = ({ onOpenMobile, breadcrumb }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const profile = useSelector((state: RootState) => state.user.connectedUser.profile);
  const companyName = profile?.companyDetails?.name || "Company";
  const companyInitial = companyName[0] || "C";
  const unreadCount = 1;
  const totalUnreadMessages = 1;

  return (
    <Box
      sx={{
        height: 64,
        bgcolor: "#fff",
        borderBottom: "1px solid #E5E7EB",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: { xs: 2, md: 4 },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        {isMobile && (
          <IconButton onClick={onOpenMobile}>
            <MenuOutlined />
          </IconButton>
        )}
<Box
              sx={{
                display: { xs: "none", lg: "flex" },
                alignItems: "center",
                bgcolor: "#F9FAFB",
                border: "1px solid #E5E7EB",
                borderRadius: 2,
                px: 1.5,
                py: 0.5,
                width: 440,
                minWidth: 240
              }}
            >
              <SearchOutlined sx={{ color: "#9CA3AF", fontSize: 18, mr: 1 }} />
              <InputBase placeholder="Search anything..." sx={{ fontSize: "13px", flex: 1 }} />
            </Box>      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>


            <IconButton
              sx={{ color: "#6B7280" }}
            >
              <Badge
                badgeContent={unreadCount > 9 ? "9+" : unreadCount || undefined}
                sx={{ "& .MuiBadge-badge": { bgcolor: "#EF4444", color: "#fff", fontSize: "10px", fontWeight: 700, minWidth: 18, height: 18 } }}
              >
                <NotificationsOutlined sx={{ fontSize: 20 }} />
              </Badge>
            </IconButton>

                        {/* Chat icon */}
            <IconButton
              sx={{ color: "#6B7280" }}
            >
              <Badge
                badgeContent={totalUnreadMessages > 9 ? "9+" : totalUnreadMessages || undefined}
                sx={{ "& .MuiBadge-badge": { bgcolor: "#EF4444", color: "#fff", fontSize: "10px", fontWeight: 700, minWidth: 18, height: 18 } }}
              >
                <ChatOutlined sx={{ fontSize: 20 }} />
              </Badge>
            </IconButton>

        <UserHeader companyName={companyName} companyInitial={companyInitial} />
      </Box>
    </Box>
  );
};

export default Header;