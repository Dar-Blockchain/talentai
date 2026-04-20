"use client";
import React, { useState, useMemo, useCallback } from "react";
import { Avatar, Box, Typography } from "@mui/material";
import KeyboardArrowDownRounded from "@mui/icons-material/KeyboardArrowDownRounded";
import UserDropdownMenu from "./UserDropdownMenu";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { logout } from "@/store/slices/authSlice";
import { useRouter } from "next/router";
import LogoutProgressModal from "@/components/ui/LogoutProgressModal";

interface UserAvatarProps {
  showDropdown?: boolean;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ showDropdown = true }) => {
  const router   = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const [anchorEl,   setAnchorEl]   = useState<null | HTMLElement>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const open = Boolean(anchorEl);

  const { user, profile } = useSelector((state: RootState) => state.user.connectedUser);

  const isAdmin   = useMemo(() => profile?.type?.toLowerCase() === "admin",   [profile?.type]);
  const isCompany = useMemo(() => profile?.type?.toLowerCase() === "company", [profile?.type]);

  const displayName = useMemo(() => {
    if (isCompany) return profile?.companyDetails?.name || profile?.userId?.username || "Company";
    const name = `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim();
    return name || user?.email?.split("@")[0] || "User";
  }, [isCompany, profile, user]);

  const shortName = useMemo(() => {
    const words = displayName.split(" ");
    return words.length >= 2 ? `${words[0]} ${words[1][0]}.` : displayName;
  }, [displayName]);

  const avatarUrl = useMemo(() => {
    const img = profile?.user_image || user?.user_image || profile?.userId?.user_image;
    return img ? `${process.env.NEXT_PUBLIC_API_BASE_URL}images/Users/${img}` : null;
  }, [profile?.user_image, profile?.userId?.user_image, user?.user_image]);

  const initials = useMemo(() => {
    if (isCompany) return (profile?.companyDetails?.name || "C")[0].toUpperCase();
    const f = profile?.firstName?.[0] || "";
    const l = profile?.lastName?.[0]  || "";
    return (f + l).toUpperCase() || (user?.email?.[0] || "U").toUpperCase();
  }, [isCompany, profile, user]);

  const handleLogout = useCallback(async () => {
    setLoggingOut(true);
    try { await dispatch(logout()).unwrap(); } catch {}
    router.push("/signin");
  }, [dispatch, router]);

  const goToDashboard = useCallback(() => {
    if (isAdmin)        router.push("/dashboard/admin");
    else if (isCompany) router.push("/company/dashboard");
    else                router.push("/dashboard/candidate");
  }, [isAdmin, isCompany, router]);

  return (
    <>
      {/* Trigger */}
      <Box
        onClick={(e) => showDropdown ? setAnchorEl(e.currentTarget) : goToDashboard()}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.75,
          pl: 0.5,
          pr: 1,
          py: 0.4,
          borderRadius: "10px",
          cursor: "pointer",
          border: "1px solid",
          borderColor: open ? "rgba(13,148,136,0.4)" : "rgba(13,148,136,0.2)",
          bgcolor: open ? "rgba(13,148,136,0.08)" : "rgba(13,148,136,0.04)",
          transition: "border-color 0.15s, background 0.15s",
          "&:hover": { borderColor: "rgba(13,148,136,0.4)", bgcolor: "rgba(13,148,136,0.08)" },
        }}
      >
        {/* Avatar */}
        <Avatar
          src={avatarUrl || undefined}
          sx={{
            width: 26,
            height: 26,
            fontSize: "10px",
            fontWeight: 700,
            bgcolor: "#0D9488",
            color: "#fff",
            borderRadius: "7px",
          }}
        >
          {!avatarUrl && initials}
        </Avatar>

        {/* Name */}
        <Typography sx={{
          fontSize: "13px",
          fontWeight: 500,
          color: "#374151",
          maxWidth: 96,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          lineHeight: 1,
          letterSpacing: "0.01em",
        }}>
          {shortName}
        </Typography>

        {/* Chevron */}
        {showDropdown && (
          <KeyboardArrowDownRounded sx={{
            fontSize: 15,
            color: "#9CA3AF",
            transition: "transform 0.2s",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            flexShrink: 0,
          }} />
        )}
      </Box>

      <UserDropdownMenu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        onLogout={handleLogout}
        displayName={displayName}
        email={user?.email}
        avatarUrl={avatarUrl}
        initials={initials}
        isCompany={isCompany}
        onDashboard={goToDashboard}
      />

      <LogoutProgressModal open={loggingOut} />
    </>
  );
};

export default UserAvatar;
