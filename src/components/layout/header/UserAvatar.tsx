"use client";
import React, { useState, useMemo, useCallback } from "react";
import { Avatar, Box, IconButton, Tooltip, Typography } from "@mui/material";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import UserDropdownMenu from "./UserDropdownMenu";
import { useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { useSelector } from "react-redux";
import { logout } from "@/store/slices/authSlice";
import UserIcon from "@/components/icons/UserIcon";
import { useRouter } from "next/router";
import LogoutProgressModal from "@/components/ui/LogoutProgressModal";

interface UserAvatarProps {
  showDropdown?: boolean;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ showDropdown = true }) => {
  const router = useRouter();

  const dispatch = useDispatch<AppDispatch>();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const open = Boolean(anchorEl);
  const { user, profile } = useSelector(
    (state: RootState) => state.user.connectedUser
  );

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

  const avatarUrl = useMemo(() => {
    // Check for user_image in profile first
    if (profile?.user_image) {
      return `${process.env.NEXT_PUBLIC_API_BASE_URL}images/Users/${profile.user_image}`;
    }
    // Then check in user object
    if (user?.user_image) {
      return `${process.env.NEXT_PUBLIC_API_BASE_URL}images/Users/${user.user_image}`;
    }
    // Check userId nested object
    if (profile?.userId?.user_image) {
      return `${process.env.NEXT_PUBLIC_API_BASE_URL}images/Users/${profile.userId.user_image}`;
    }
    return null;
  }, [profile?.user_image, profile?.userId?.user_image, user?.user_image]);

  const handleLogout = useCallback(async () => {
    setLoggingOut(true);
    try {
      await dispatch(logout()).unwrap();
    } catch (error) {
      console.error("Logout failed:", error);
    }
    router.push("/signin");
  }, [dispatch, router]);

  const goToDashboard = useCallback(() => {
    if (isAdmin) router.push("/dashboard/admin");
    else if (isCompany) router.push("/company/dashboard");
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
        <Tooltip title="My dashboard">
          <Avatar
            onClick={goToDashboard}
            src={avatarUrl || undefined}
            sx={{
              width: 30,
              height: 30,
              bgcolor: avatarUrl ? "transparent" : "rgba(238, 245, 255, 1)",
              color: "rgba(112, 144, 154, 1)",
              cursor: "pointer",
            }}
          >
            {!avatarUrl && <UserIcon />}
          </Avatar>
        </Tooltip>
      </Box>

      {/* Display Name */}
      <Tooltip title="My dashboard">
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
      </Tooltip>

      {/* Dropdown Icon */}
      {showDropdown && (
        <IconButton
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{
            color: isCompany
              ? "rgba(12, 218, 139, 1)"
              : "rgba(131, 16, 255, 1)",
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

      <LogoutProgressModal open={loggingOut} />
    </Box>
  );
};

export default UserAvatar;
