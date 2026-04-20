"use client";
import React, { useCallback, useState } from "react";
import { Drawer, Box, Typography, Divider, Avatar } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { logout } from "@/store/slices/authSlice";
import { useRouter } from "next/router";
import HeaderLogo from "./HeaderLogo";
import HeaderNavMenu from "./HeaderNavMenu";
import LogoutProgressModal from "@/components/ui/LogoutProgressModal";
import DashboardOutlined   from "@mui/icons-material/DashboardOutlined";
import ChatBubbleOutlineOutlined from "@mui/icons-material/ChatBubbleOutlineOutlined";
import NotificationsOutlined from "@mui/icons-material/NotificationsOutlined";
import LogoutOutlined from "@mui/icons-material/LogoutOutlined";
import PersonOutlined from "@mui/icons-material/PersonOutlined";
import SettingsOutlined from "@mui/icons-material/SettingsOutlined";

const ACCENT    = "#0D9488";
const ACCENT_BG = "rgba(13,148,136,0.07)";

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  userId?: string;
  unreadMessageCount?: number;
}

const Row: React.FC<{
  icon: React.ReactNode;
  label: string;
  badge?: number;
  danger?: boolean;
  onClick: () => void;
}> = ({ icon, label, badge, danger, onClick }) => (
  <Box
    onClick={onClick}
    sx={{
      display: "flex", alignItems: "center", gap: 1.5,
      px: 1.5, py: 1.1, borderRadius: "10px", cursor: "pointer",
      transition: "background 0.15s",
      "&:hover": { bgcolor: danger ? "rgba(239,68,68,0.06)" : ACCENT_BG },
    }}
  >
    <Box sx={{
      width: 32, height: 32, borderRadius: "9px", flexShrink: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      bgcolor: danger ? "rgba(239,68,68,0.08)" : ACCENT_BG,
      border: "1px solid",
      borderColor: danger ? "rgba(239,68,68,0.18)" : "rgba(13,148,136,0.15)",
      "& svg": { fontSize: 16, color: danger ? "#EF4444" : ACCENT },
    }}>
      {icon}
    </Box>
    <Typography sx={{
      fontFamily: "Poppins", fontSize: "14px", fontWeight: 500,
      color: danger ? "#EF4444" : "#374151", flex: 1,
    }}>
      {label}
    </Typography>
    {!!badge && (
      <Box sx={{
        minWidth: 18, height: 18, borderRadius: "9px", px: 0.5,
        bgcolor: "#EF4444", display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Typography sx={{ fontSize: "10px", fontWeight: 700, color: "#fff", lineHeight: 1 }}>
          {badge > 9 ? "9+" : badge}
        </Typography>
      </Box>
    )}
  </Box>
);

const MobileDrawer: React.FC<MobileDrawerProps> = ({ open, onClose, userId, unreadMessageCount = 0 }) => {
  const router   = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const { user, profile } = useSelector((state: RootState) => state.user.connectedUser);

  const isCompany = profile?.type?.toLowerCase() === "company";
  const isAdmin   = profile?.type?.toLowerCase() === "admin";

  const displayName = (() => {
    if (isCompany) return profile?.companyDetails?.name || profile?.userId?.username || "Company";
    const n = `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim();
    return n || user?.email?.split("@")[0] || "User";
  })();

  const initials = (() => {
    if (isCompany) return (profile?.companyDetails?.name || "C")[0].toUpperCase();
    return ((profile?.firstName?.[0] || "") + (profile?.lastName?.[0] || "")).toUpperCase() || (user?.email?.[0] || "U").toUpperCase();
  })();

  const avatarUrl = (() => {
    const img = profile?.user_image || user?.user_image || profile?.userId?.user_image;
    return img ? `${process.env.NEXT_PUBLIC_API_BASE_URL}images/Users/${img}` : null;
  })();

  const [loggingOut, setLoggingOut] = useState(false);

  const go = (path: string) => { router.push(path); onClose(); };

  const handleLogout = useCallback(async () => {
    setLoggingOut(true);
    try { await dispatch(logout()).unwrap(); } catch {}
    onClose();
    router.push("/signin");
  }, [dispatch, onClose, router]);

  const goDashboard = () => {
    if (isAdmin)        go("/dashboard/admin");
    else if (isCompany) go("/company/dashboard");
    else                go("/dashboard/candidate");
  };

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            width: 280,
            bgcolor: "#F2F3F4",
            border: "none",
            boxShadow: "-8px 0 32px rgba(0,0,0,0.10)",
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        {/* Header */}
        <Box sx={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          px: 2, py: 1.75,
          borderBottom: "1px solid rgba(13,148,136,0.10)",
          bgcolor: "rgba(242,243,244,0.97)",
          backdropFilter: "blur(12px)",
        }}>
          <HeaderLogo />
          <Box
            onClick={onClose}
            sx={{
              width: 30, height: 30, borderRadius: "8px",
              border: "1px solid rgba(13,148,136,0.2)",
              bgcolor: "rgba(13,148,136,0.04)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", fontSize: "16px", color: "#6B7280",
              "&:hover": { bgcolor: "rgba(13,148,136,0.08)" },
            }}
          >
            ✕
          </Box>
        </Box>

        {/* Body */}
        <Box sx={{ flex: 1, overflowY: "auto", px: 1.5, py: 2 }}>

          {isAuthenticated ? (
            <>
              {/* User card */}
              <Box sx={{
                display: "flex", alignItems: "center", gap: 1.5,
                px: 1.5, py: 1.5, mb: 1.5,
                bgcolor: "#fff", borderRadius: "12px",
                border: "1px solid rgba(13,148,136,0.12)",
              }}>
                <Avatar
                  src={avatarUrl || undefined}
                  sx={{
                    width: 38, height: 38, fontSize: "13px", fontWeight: 700,
                    bgcolor: ACCENT, color: "#fff", borderRadius: "10px", flexShrink: 0,
                  }}
                >
                  {!avatarUrl && initials}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{
                    fontFamily: "Poppins", fontWeight: 700, fontSize: "13.5px", color: "#111827",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {displayName}
                  </Typography>
                  {user?.email && (
                    <Typography sx={{
                      fontFamily: "Poppins", fontSize: "11px", color: "#9CA3AF",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {user.email}
                    </Typography>
                  )}
                </Box>
              </Box>

              {/* Nav */}
              <Box sx={{ mb: 1 }}>
                <HeaderNavMenu direction="column" />
              </Box>

              <Divider sx={{ my: 1, borderColor: "rgba(13,148,136,0.08)" }} />

              {/* Actions */}
              <Box>
                <Row icon={<DashboardOutlined />}  label="Dashboard"   onClick={goDashboard} />
                {!isCompany && (
                  <Row icon={<PersonOutlined />} label="View Profile"
                    onClick={() => go("/profile/candidate/" + user?._id)} />
                )}
                <Row icon={<ChatBubbleOutlineOutlined />} label="Messages"
                  badge={unreadMessageCount} onClick={() => go("/chat")} />
                <Row icon={<NotificationsOutlined />} label="Notifications"
                  onClick={() => go(isCompany ? "/company/notifications" : "/company/notifications")} />
                <Row icon={<SettingsOutlined />} label="Settings"
                  onClick={() => go(isCompany ? "/company/settings" : "/profile/candidate/settings")} />
              </Box>

              <Divider sx={{ my: 1, borderColor: "rgba(13,148,136,0.08)" }} />

              <Row icon={<LogoutOutlined />} label="Log out" danger onClick={handleLogout} />
            </>
          ) : (
            <>
              {/* Nav for unauthenticated */}
              <Box sx={{ mb: 2 }}>
                <HeaderNavMenu direction="column" />
              </Box>

              <Divider sx={{ my: 1.5, borderColor: "rgba(13,148,136,0.08)" }} />

              {/* Auth buttons */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1, px: 0.5, mt: 1 }}>
                <Box
                  onClick={() => go("/signin")}
                  sx={{
                    py: 1.1, borderRadius: "10px", textAlign: "center", cursor: "pointer",
                    border: "1px solid rgba(13,148,136,0.2)", bgcolor: "rgba(13,148,136,0.04)",
                    fontFamily: "Poppins", fontSize: "14px", fontWeight: 500, color: "#374151",
                    "&:hover": { bgcolor: "rgba(13,148,136,0.08)" },
                  }}
                >
                  Log in
                </Box>
                <Box
                  onClick={() => go("/signin")}
                  sx={{
                    py: 1.1, borderRadius: "10px", textAlign: "center", cursor: "pointer",
                    bgcolor: ACCENT, fontFamily: "Poppins", fontSize: "14px",
                    fontWeight: 700, color: "#fff",
                    boxShadow: `0 4px 14px rgba(13,148,136,0.35)`,
                    "&:hover": { opacity: 0.92 },
                  }}
                >
                  Sign up free
                </Box>
              </Box>
            </>
          )}
        </Box>
      </Drawer>

      <LogoutProgressModal open={loggingOut} />
    </>
  );
};

export default MobileDrawer;
