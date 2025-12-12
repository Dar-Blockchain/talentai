"use client";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Avatar,
  Button,
  IconButton,
  Drawer,
  Divider,
  Tooltip,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { useRouter } from "next/router";
import Image from "next/image";
import {
  fetchTokenBalance,
  selectTokenBalance,
  selectTokenLoading,
} from "@/store/slices/tokenSlice";
import TokenPurchaseModal from "./token-purchase/TokenPurchaseModal";
import { formatNumber, stringAvatar } from "@/utils/functions";
import { openModal } from "@/store/slices/tokenPurchaseSlice";
import { logout } from "@/store/slices/authSlice";

// Styles
const pulseDot = {
  width: 4,
  height: 4,
  borderRadius: "50%",
  backgroundColor: "#DE9300",
  animation: "pulseDot 1s infinite ease-in-out",
  "@keyframes pulseDot": {
    "0%": { transform: "scale(1)", opacity: 0.4 },
    "50%": { transform: "scale(1.6)", opacity: 1 },
    "100%": { transform: "scale(1)", opacity: 0.4 },
  },
};

// Reusable Components
const LoadingDots = () => (
  <Box sx={{ display: "flex", gap: 0.6, alignItems: "center" }}>
    <Box sx={pulseDot} />
    <Box sx={{ ...pulseDot, animationDelay: "0.2s" }} />
    <Box sx={{ ...pulseDot, animationDelay: "0.4s" }} />
  </Box>
);

interface TokenDisplayProps {
  balance: number;
  loading: boolean;
  isCompany: boolean;
  onPurchase: () => void;
  compact?: boolean;
}

const TokenDisplay: React.FC<TokenDisplayProps> = ({
  balance,
  loading,
  isCompany,
  onPurchase,
  compact = false,
}) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      backgroundColor: compact ? "transparent" : "white",
      borderRadius: compact ? 0 : "25px",
      boxShadow: compact ? "none" : "0 4px 14px rgba(0,0,0,0.06)",
      p: compact ? 0 : "0 12px",
      height: compact ? "auto" : 40,
      gap: 1.5,
    }}
  >
    <Image src="/icons/token.svg" alt="token" width={compact ? 22 : 20} height={compact ? 22 : 20} />
    {loading ? (
      <LoadingDots />
    ) : (
      <Typography
        sx={{
          fontFamily: "Poppins",
          fontWeight: 500,
          fontSize: "14px",
          color: "rgba(222, 147, 0, 1)",
        }}
      >
        {formatNumber(balance)} tokens
      </Typography>
    )}
    {isCompany && (
      <Tooltip title="Purchase Tokens">
        <IconButton
          onClick={onPurchase}
          sx={{
            ml: compact ? "auto" : 1,
            width: compact ? 26 : 22,
            height: compact ? 26 : 22,
            backgroundColor: "white",
            border: "0.5px solid rgba(14, 194, 125, 0.27)",
            borderRadius: "16px",
            boxShadow: "0px 0px 10.7px 1px rgba(41, 210, 145, 0.17)",
          }}
        >
          <Image src="/icons/plus.svg" alt="plus" width={compact ? 14 : 12} height={compact ? 14 : 12} />
        </IconButton>
      </Tooltip>
    )}
  </Box>
);

interface LogoutButtonProps {
  onClick: () => void;
  isLoading: boolean;
  fullWidth?: boolean;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ onClick, isLoading, fullWidth = false }) => (
  <Button
    fullWidth={fullWidth}
    variant="contained"
    disabled={isLoading}
    startIcon={<LogoutIcon sx={{ color: fullWidth ? undefined : "rgba(200, 65, 75, 1)" }} />}
    sx={{
      height: fullWidth ? "auto" : 40,
      backgroundColor: "white",
      color: "rgba(200, 65, 75, 1)",
      border: fullWidth ? "0.25px solid rgba(200, 65, 75, 0.3)" : undefined,
      borderRadius: "25px",
      boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
      textTransform: "none",
      "&:hover": {
        boxShadow: "0 4px 14px rgba(0,0,0,0.02)",
        backgroundColor: "rgba(200, 65, 75, 0.08)",
      },
      "&:disabled": {
        backgroundColor: "rgba(200, 65, 75, 0.1)",
        color: "rgba(200, 65, 75, 0.5)",
      },
      py: fullWidth ? 1 : undefined,
    }}
    onClick={onClick}
  >
    {isLoading ? "Logging out..." : "Logout"}
  </Button>
);

const HeaderDashboard = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  // Selectors
  const tokenBalance = useSelector(selectTokenBalance);
  const tokenLoading = useSelector(selectTokenLoading);
  const { profile } = useSelector((state: RootState) => state.auth);
  const { isLoading: isLoggingOut } = useSelector((state: RootState) => state.auth);

  // Local state
  const [mobileOpen, setMobileOpen] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  // Memoized values
  const isCompany = useMemo(() => profile?.type?.toLowerCase() === "company", [profile?.type]);
  const displayName = useMemo(() => {
    if (isCompany) {
      return profile?.companyDetails?.name || profile?.userId?.username;
    }
    return `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim();
  }, [isCompany, profile]);

  const logoSrc = useMemo(
    () => profile?.type === "Candidate"
      ? "/images/home/logocandidate.png"
      : "/images/home/logocompany.png",
    [profile?.type]
  );

  const homeRoute = useMemo(() => isCompany ? "/" : "/home/candidate", [isCompany]);

  // Callbacks
  const handleOpenModal = useCallback(() => dispatch(openModal()), [dispatch]);
  const toggleDrawer = useCallback(() => setMobileOpen((prev) => !prev), []);

  const handleLogout = useCallback(async () => {
    try {
      await dispatch(logout()).unwrap();
      window.location.replace("/");
    } catch (error) {
      console.error("Logout failed:", error);
      window.location.replace("/");
    }
  }, [dispatch]);

  const navigateToProfile = useCallback(() => router.push("/settings/profile"), [router]);
  const navigateToHome = useCallback(() => router.push(homeRoute), [router, homeRoute]);

  // Effects
  useEffect(() => {
    setToken(localStorage.getItem("api_token"));
  }, []);

  useEffect(() => {
    if (token) {
      dispatch(fetchTokenBalance());
    }
  }, [dispatch, token]);

  useEffect(() => {
    if (router.query.refreshBalance === "true" && token) {
      dispatch(fetchTokenBalance());
    }
  }, [router.query.refreshBalance, token, dispatch]);

  useEffect(() => {console.log(profile,'profile')}, [profile])

  return (
    <>
      <AppBar
        position="static"
        elevation={0}
        sx={{
          backgroundColor: "transparent",
          boxShadow: "none",
          height: "50px",
          my: 2,
        }}
      >
        <Box sx={{ maxWidth: 1400, mx: "auto", width: "100%", height: "100%" }}>
          <Toolbar
            sx={{
              justifyContent: "space-between",
              height: "50px",
              minHeight: "50px!important",
              paddingLeft: '0!important', 
              paddingRight: '0!important'
            }}
          >
            {/* Logo */}
            <Box sx={{ display: "flex", alignItems: "center", height: "50px" }}>
              <Box
                sx={{
                  backgroundColor: "white",
                  borderRadius: "50px",
                  height: 40,
                  width: 138,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
                }}
              >
                <Box
                  sx={{
                    backgroundColor: "#141415",
                    borderRadius: "50px",
                    width: 134,
                    height: 36,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                  onClick={navigateToHome}
                >
                  <Box
                    component="img"
                    src={logoSrc}
                    alt="Logo"
                    style={{ height: 24 }}
                  />
                </Box>
              </Box>
            </Box>

            {/* Desktop  (HIDDEN BELOW 750px) */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                height: "50px",
                "@media (max-width:750px)": {
                  display: "none",
                },
              }}
            >
              {/* Token Box */}
              <TokenDisplay
                balance={tokenBalance}
                loading={tokenLoading}
                isCompany={isCompany}
                onPurchase={handleOpenModal}
              />

              {/* Avatar */}
              <Box
                onClick={navigateToProfile}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "white",
                  borderRadius: "25px",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
                  height: 40,
                  p: "0 10px",
                  gap: 1.5,
                  cursor: "pointer",
                }}
              >
                <Avatar
                  {...stringAvatar(
                    profile?.companyDetails?.name ||
                      profile?.userId?.username ||
                      "User"
                  )}
                  sx={{
                    width: 30,
                    height: 30,
                    bgcolor: "#f3f4f6",
                    color: "#111827",
                    fontSize: 14,
                    fontWeight: 600,
                    border: "2px solid #e5e7eb",
                  }}
                />
                <Typography
                  sx={{
                    fontFamily: "Poppins",
                    fontWeight: 500,
                    fontSize: "14px",
                    color: "rgba(56, 58, 61, 1)",
                  }}
                >
                  {displayName}
                </Typography>
              </Box>

              {/* Logout */}
              <LogoutButton onClick={handleLogout} isLoading={isLoggingOut} />
            </Box>

            {/* HAMBURGER (VISIBLE ONLY BELOW 750px) */}
            <IconButton
              sx={{
                display: "none",
                "@media (max-width:750px)": {
                  display: "flex",
                },
              }}
              onClick={toggleDrawer}
            >
              <MenuIcon sx={{ color: "#000", fontSize: 26 }} />
            </IconButton>
          </Toolbar>
        </Box>
      </AppBar>

      {/* MOBILE DRAWER */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={toggleDrawer}
        PaperProps={{
          sx: {
            width: 260,
            p: 2,
            "@media (min-width:750px)": { display: "none" },
          },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <Avatar
            {...stringAvatar(displayName || "User")}
            sx={{ width: 40, height: 40 }}
          />
          <Typography sx={{ fontSize: 16, fontWeight: 600 }}>
            {displayName}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Tokens */}
        <TokenDisplay
          balance={tokenBalance}
          loading={tokenLoading}
          isCompany={isCompany}
          onPurchase={handleOpenModal}
          compact
        />

        <Divider sx={{ my: 2 }} />

        {/* Logout */}
        <LogoutButton onClick={handleLogout} isLoading={isLoggingOut} fullWidth />
      </Drawer>
      <TokenPurchaseModal />
    </>
  );
};

export default HeaderDashboard;
