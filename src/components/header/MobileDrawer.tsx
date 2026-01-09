"use client";
import React, { useCallback, useMemo } from "react";
import { Drawer, Box, Divider, Button } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import TokenDisplay from "./TokenDisplay";
import { logout } from "@/store/slices/authSlice";
import { useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { selectProfile } from "@/store/slices/profileSlice";
import { useDispatch } from "react-redux";
import HeaderLogo from "./HeaderLogo";
import UserAvatar from "./UserAvatar";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import HeaderNavMenu from "./HeaderNavMenu";
import { useRouter } from "next/router";

interface LogoutButtonProps {
  onClick: () => void;
  isLoading: boolean;
  fullWidth?: boolean;
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({
  onClick,
  isLoading,
  fullWidth = false,
}) => (
  <Button
    fullWidth={fullWidth}
    variant="contained"
    disabled={isLoading}
    startIcon={
      <LogoutIcon
        sx={{ color: fullWidth ? undefined : "rgba(200, 65, 75, 1)" }}
      />
    }
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
    Logout
  </Button>
);

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
}

const MobileDrawer: React.FC<MobileDrawerProps> = ({ open, onClose }) => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );

  const user = useSelector((state: RootState) => state.auth.user);

  const userType =
    user?.role?.toLowerCase() ||
    localStorage.getItem("userType") ||
    "candidate";

  const handleLogout = useCallback(async () => {
    try {
      await dispatch(logout()).unwrap();
      onClose();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }, [dispatch, onClose]);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 260,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          p: 2,
          "@media (min-width:750px)": { display: "none" },
        },
      }}
    >
      {isAuthenticated && (
        <>
          <Box>
            <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
              <HeaderLogo />
            </Box>

            {/* User Info */}
            <Box sx={{ mb: 1 }}>
              <UserAvatar showDropdown={false} />
            </Box>
            {/* Tokens */}
            <TokenDisplay />
          </Box>

          {/* Logout */}
          <LogoutButton onClick={handleLogout} isLoading={false} fullWidth />
        </>
      )}

      {!isAuthenticated && (
        <>
          <Box>
            <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
              <HeaderLogo />
            </Box>
            <HeaderNavMenu direction="column" />
          </Box>
          <Button
            variant="outlined"
            onClick={() => router.push("/signin")}
            sx={{
              backgroundColor: userType === "candidate" ? "#BD85FF" : "#4DD9A3",
              color: "#ffffff",
              border: "none",
              borderRadius: 999,
              textTransform: "none",
              px: 2,
              py: 0.75,
              fontSize: "14px",
              fontWeight: 600,
              "&:hover": {
                color: "white",
                backgroundColor:
                  userType === "candidate" ? "#BD85FF" : "#4DD9A3",
              },
            }}
          >
            Login
          </Button>
        </>
      )}
    </Drawer>
  );
};

export default MobileDrawer;
