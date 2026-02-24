// src/components/dashboard/Header.tsx
"use client";

import React from "react";
import { Box, Typography, IconButton, InputBase, Avatar, useMediaQuery, useTheme } from "@mui/material";
import MenuOutlined from "@mui/icons-material/MenuOutlined";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import NotificationsOutlined from "@mui/icons-material/NotificationsOutlined";
import KeyboardArrowDownOutlined from "@mui/icons-material/KeyboardArrowDownOutlined";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import UserHeader from "./UserHeader";

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
        <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{breadcrumb}</Typography>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Box
          sx={{
            display: { xs: "none", lg: "flex" },
            alignItems: "center",
            border: "1px solid #E5E7EB",
            borderRadius: 2,
            px: 1.5,
          }}
        >
          <SearchOutlined sx={{ fontSize: 18, mr: 1 }} />
          <InputBase placeholder="Search..." sx={{ fontSize: 13 }} />
        </Box>

        <IconButton>
          <NotificationsOutlined />
        </IconButton>

        <UserHeader companyName={companyName} companyInitial={companyInitial} />
      </Box>
    </Box>
  );
};

export default Header;