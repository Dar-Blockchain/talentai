"use client";
import React, { useState, useCallback } from "react";
import { Box, Badge } from "@mui/material";
import MenuRounded from "@mui/icons-material/MenuRounded";
import MobileDrawer from "./MobileDrawer";

interface HamburgerButtonProps {
  userId?: string;
  unreadMessageCount?: number;
}

const HamburgerButton: React.FC<HamburgerButtonProps> = ({
  userId,
  unreadMessageCount = 0,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const toggleDrawer = useCallback(() => setMobileOpen((prev) => !prev), []);

  return (
    <>
      <Box
        onClick={toggleDrawer}
        sx={{
          display: "flex",
          "@media (min-width:800px)": { display: "none" },
          alignItems: "center",
          justifyContent: "center",
          width: 34,
          height: 34,
          borderRadius: "10px",
          border: "1px solid rgba(13,148,136,0.2)",
          bgcolor: mobileOpen ? "rgba(13,148,136,0.08)" : "rgba(13,148,136,0.04)",
          cursor: "pointer",
          transition: "border-color 0.15s, background 0.15s",
          "&:hover": { borderColor: "rgba(13,148,136,0.4)", bgcolor: "rgba(13,148,136,0.08)" },
        }}
      >
        <Badge
          badgeContent={unreadMessageCount || undefined}
          sx={{ "& .MuiBadge-badge": { bgcolor: "#EF4444", color: "#fff", fontSize: "9px", minWidth: 14, height: 14, padding: 0 } }}
        >
          <MenuRounded sx={{ fontSize: 18, color: "#0D9488" }} />
        </Badge>
      </Box>

      <MobileDrawer
        open={mobileOpen}
        onClose={toggleDrawer}
        userId={userId}
        unreadMessageCount={unreadMessageCount}
      />
    </>
  );
};

export default HamburgerButton;
