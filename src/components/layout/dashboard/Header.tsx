"use client";

import React from "react";
import {
  Box,
  IconButton,
  InputBase,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuOutlined from "@mui/icons-material/MenuOutlined";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import UserHeader from "./UserHeader";
import HeaderNotification from "@/components/layout/header/HeaderNotification";
import HeaderChat from "./HeaderChat";

interface HeaderProps {
  onOpenMobile: () => void;
  breadcrumb: string;
}

const Header: React.FC<HeaderProps> = ({ onOpenMobile }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const profile = useSelector((state: RootState) => state.user.connectedUser.profile);
  const user = useSelector((state: RootState) => state.user.connectedUser.user);
  const userType = useSelector((state: RootState) => state.user.userType);

  const displayName = (() => {
    if (user?.role === "Employee" || user?.role === "Admin" || user?.role === "Candidate" ) {
      const full = `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim();
      return full || user?.username;
    }
    return profile?.companyDetails?.name || "Company";
  })();
  const displayInitial = displayName[0]?.toUpperCase() || "E";

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
        {/* <Box
          sx={{
            display: { xs: "none", lg: "flex" },
            alignItems: "center",
            bgcolor: "#F9FAFB",
            border: "1px solid #E5E7EB",
            borderRadius: 2,
            px: 1.5,
            py: 0.5,
            width: 440,
            minWidth: 240,
          }}
        >
          <SearchOutlined sx={{ color: "#9CA3AF", fontSize: 18, mr: 1 }} />
          <InputBase placeholder="Search anything..." sx={{ fontSize: "13px", flex: 1 }} />
        </Box> */}
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <HeaderChat />
        <HeaderNotification />
        <UserHeader companyName={displayName} companyInitial={displayInitial} />
      </Box>
    </Box>
    
  );
};

export default Header;
