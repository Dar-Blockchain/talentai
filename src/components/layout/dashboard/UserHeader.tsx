// src/components/dashboard/UserHeader.tsx
"use client";

import React, { useState } from "react";
import {
  Box,
  Avatar,
  Typography,
  Menu,
  MenuItem,
  Divider,
} from "@mui/material";
import KeyboardArrowDownOutlined from "@mui/icons-material/KeyboardArrowDownOutlined";
import { LogoutOutlined, SettingsOutlined } from "@mui/icons-material";
import { useRouter } from "next/router";

interface UserHeaderProps {
  companyName: string;
  companyInitial: string;
}

const UserHeader: React.FC<UserHeaderProps> = ({ companyName, companyInitial }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const router = useRouter();

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          cursor: "pointer",
          padding: "4px 8px",
          borderRadius: 2,
        }}
        onClick={handleOpenMenu}
      >
        <Avatar
          sx={{
            width: 30,
            height: 30,
            fontSize: 14,
            bgcolor: "#0D9488",
          }}
        >
          {companyInitial}
        </Avatar>
        <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#111827" }}>
          {companyName}
        </Typography>
        <KeyboardArrowDownOutlined sx={{ fontSize: 20, color: "#6B7280" }} />
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: { minWidth: 180, borderRadius: 2, mt: 1 },
        }}
      >
        <MenuItem
          onClick={() => {
            handleCloseMenu();
            router.push("/company/settings");
          }}
          sx={{ fontSize: 14 }}
        >
          <SettingsOutlined sx={{ mr: 1, fontSize: 16 }} />
          Settings
        </MenuItem>
        <Divider />
        <MenuItem
          sx={{fontSize: 14}}
          onClick={() => {
            console.log("Logout clicked");
            handleCloseMenu();
          }}
        >
          <LogoutOutlined sx={{ mr: 1, fontSize: 16 }} />
          Logout
        </MenuItem>
      </Menu>
    </>
  );
};

export default UserHeader;