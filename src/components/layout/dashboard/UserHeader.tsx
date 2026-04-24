// src/components/dashboard/UserHeader.tsx
"use client";

import React, { useState } from "react";
import {
  Box,
  Avatar,
  Typography,
  Menu,
  MenuItem,
} from "@mui/material";
import KeyboardArrowDownOutlined from "@mui/icons-material/KeyboardArrowDownOutlined";
import { LogoutOutlined, TuneOutlined } from "@mui/icons-material";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { logout } from "@/store/slices/authSlice";

interface UserHeaderProps {
  companyName: string;
  companyInitial: string;
  avatarUrl?: string | null;
}

const TEAL = "#0D9488";

const UserHeader: React.FC<UserHeaderProps> = ({ companyName, companyInitial, avatarUrl }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const userRole = useSelector((state: RootState) => state.user.connectedUser.user?.role);
  const isEmployee = userRole === "Employee";
  const settingsPath = isEmployee ? "/employee/settings" : "/company/settings";

  return (
    <>
      <Box
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{
          display: "flex", alignItems: "center", gap: 0.75,
          cursor: "pointer",
          px: 1, py: 0.5,
          borderRadius: "10px",
          border: "1px solid transparent",
          transition: "all 0.15s",
          "&:hover": { bgcolor: "#F9FAFB", borderColor: "#E5E7EB" },
        }}
      >
        <Avatar
          src={avatarUrl ?? undefined}
          sx={{ width: 28, height: 28, fontSize: 12, bgcolor: TEAL, flexShrink: 0 }}
        >
          {companyInitial}
        </Avatar>
        <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#111827", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {companyName}
        </Typography>
        <KeyboardArrowDownOutlined sx={{
          fontSize: 15, color: "#9CA3AF", flexShrink: 0,
          transform: open ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform 0.15s",
        }} />
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: {
            minWidth: 200, borderRadius: "12px", mt: 0.75,
            border: "1px solid #E5E7EB",
            boxShadow: "0 8px 24px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)",
            p: 0.75, overflow: "visible",
          },
        }}
      >
        {/* Profile preview */}
        <Box sx={{ px: 1.5, py: 1, mb: 0.5 }}>
          <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#111827" }}>{companyName}</Typography>
          <Typography sx={{ fontSize: "10.5px", color: "#9CA3AF", mt: 0.25 }}>Company account</Typography>
        </Box>

        <Box sx={{ height: "1px", bgcolor: "#F3F4F6", mx: 0.5, mb: 0.5 }} />

        <MenuItem
          onClick={() => { setAnchorEl(null); router.push(settingsPath); }}
          sx={{ gap: 1.25, borderRadius: "8px", py: 0.9, px: 1.25, "&:hover": { bgcolor: "#F9FAFB" } }}
        >
          <Box sx={{ width: 26, height: 26, borderRadius: "7px", bgcolor: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <TuneOutlined sx={{ fontSize: 13, color: "#6B7280" }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: "12.5px", fontWeight: 600, color: "#111827", lineHeight: 1.2 }}>Settings</Typography>
            <Typography sx={{ fontSize: "10px", color: "#9CA3AF", lineHeight: 1.2 }}>Manage your account</Typography>
          </Box>
        </MenuItem>

        <Box sx={{ height: "1px", bgcolor: "#F3F4F6", mx: 0.5, my: 0.5 }} />

        <MenuItem
          onClick={async () => { setAnchorEl(null); await dispatch(logout()); router.push("/signin"); }}
          sx={{ gap: 1.25, borderRadius: "8px", py: 0.9, px: 1.25, "&:hover": { bgcolor: "#F9FAFB" } }}
        >
          <Box sx={{ width: 26, height: 26, borderRadius: "7px", bgcolor: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <LogoutOutlined sx={{ fontSize: 13, color: "#6B7280" }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: "12.5px", fontWeight: 600, color: "#374151", lineHeight: 1.2 }}>Sign out</Typography>
            <Typography sx={{ fontSize: "10px", color: "#9CA3AF", lineHeight: 1.2 }}>End your session</Typography>
          </Box>
        </MenuItem>
      </Menu>
    </>
  );
};

export default UserHeader;
