"use client";
import React, { useState, useMemo, useCallback } from "react";
import { Avatar, Box, IconButton, Typography } from "@mui/material";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import UserDropdownMenu from "./UserDropdownMenu";
import { useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { useSelector } from "react-redux";
import { logout } from "@/store/slices/authSlice";
import UserIcon from "@/components/icons/UserIcon";
import { useRouter } from "next/router";

interface UserAvatarProps {
  showDropdown?: boolean;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ showDropdown = true }) => {
  const router = useRouter();

  const dispatch = useDispatch<AppDispatch>();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const { user, profile } = useSelector((state: RootState) => state.user.connectedUser);

  const isAdmin = useMemo(
    () => profile?.type?.toLowerCase() === "admin",
    [profile?.type]
  );

  const isCompany = useMemo(
    () => profile?.type?.toLowerCase() === "company",
    [profile?.type]
  );

  const displayName = useMemo(() => {
    if (isCompany) {
      return profile?.companyDetails?.name || profile?.userId?.username;
    }
    return `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim();
  }, [isCompany, profile]);

  const handleLogout = useCallback(async () => {
    try {
      await dispatch(logout()).unwrap();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }, [dispatch]);

  const goToDashboard = useCallback(() => {
    if (isAdmin) router.push("/dashboard/admin");
    else if (isCompany) router.push("/dashboard/company");
    else router.push("/dashboard/candidate");
  }, [isAdmin, isCompany, router]);

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      {/* Avatar */}
      <Box
        sx={{
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(255, 255, 255, 1)",
          boxShadow: "0px 0px 18.1px 0px rgba(0, 0, 0, 0.05)",
        }}
      >
        <Avatar
          onClick={goToDashboard}
          sx={{
            width: 30,
            height: 30,
            bgcolor: "rgba(238, 245, 255, 1)",
            color: "rgba(112, 144, 154, 1)",
            cursor: "pointer",
          }}
        >
          <UserIcon />
        </Avatar>
      </Box>

      {/* Display Name */}
      <Typography
        onClick={goToDashboard}
        sx={{
          fontFamily: "Poppins",
          fontWeight: 400,
          fontSize: "14px",
          color: "rgba(0, 0, 0, 1)",
          cursor: "pointer",
        }}
      >
        {displayName}
      </Typography>

      {/* Dropdown Icon */}
      {showDropdown && (
        <IconButton
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{
            color: isCompany ? "rgba(12, 218, 139, 1)":"rgba(131, 16, 255, 1)",
            transition: "transform 0.2s ease",
            p: 0,
            "&:hover": {
              background: "transparent",
              transform: "scale(1.4)",
            },
          }}
        >
          <ExpandMoreRoundedIcon />
        </IconButton>
      )}

      {/* Dropdown Menu */}
      <UserDropdownMenu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        onLogout={handleLogout}
      />
    </Box>
  );
};

export default UserAvatar;
