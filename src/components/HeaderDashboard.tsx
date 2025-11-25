"use client";
import React, { useEffect, useState } from "react";
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
  Skeleton,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { useRouter } from "next/router";
import { clearProfile } from "@/store/slices/profileSlice";
import { logout } from "@/store/slices/authSlice";
import Cookies from "js-cookie";
import { signOut } from "next-auth/react";
import Image from "next/image";
import {
  fetchTokenBalance,
  selectTokenBalance,
  selectTokenLoading,
} from "@/store/slices/tokenSlice";
import TokenPurchaseModal from "./token-purchase/TokenPurchaseModal";

function stringToColor(string: string) {
  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = "#";
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  return color;
}

function stringAvatar(name: string) {
  const parts = name.trim().toUpperCase().split(" ");
  return {
    sx: { bgcolor: stringToColor(name) },
    children: `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`,
  };
}
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
const HeaderDashboard = () => {
  const router = useRouter();

  const dispatch = useDispatch<AppDispatch>();
  const tokenBalance = useSelector(selectTokenBalance);
  const tokenLoading = useSelector(selectTokenLoading);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  // Fetch token balance on component mount and when returning from payment
  useEffect(() => {
    dispatch(fetchTokenBalance());
  }, [dispatch]);
  useEffect(() => {
    const { refreshBalance } = router.query;
    if (refreshBalance === "true") {
      dispatch(fetchTokenBalance());
      // Clean up the query parameter
      router.replace("/dashboard/company", undefined, { shallow: true });
    }
  }, [router.query, dispatch, router]);

  const { profile } = useSelector((state: RootState) => state.profile);
  const userType = profile?.type;

  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleDrawer = () => setMobileOpen(!mobileOpen);

  const handleLogout = async () => {
    dispatch(clearProfile());
    dispatch(logout());
    localStorage.clear();
    Object.keys(Cookies.get()).forEach((c) => Cookies.remove(c));
    signOut({ redirect: false });
    window.location.href = "/signin";
  };

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
              px: 0,
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
                  onClick={() => {
                    router.push(
                      userType === "company" ? "/" : "/home/candidate"
                    );
                  }}
                >
                  <Box
                    component="img"
                    src={
                      userType === "Candidate"
                        ? "/images/home/logocandidate.png"
                        : "/images/home/logocompany.png"
                    }
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
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "white",
                  borderRadius: "25px",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
                  p: "0 12px",
                  height: 40,
                  gap: 1,
                }}
              >
                <Image
                  src="/icons/token.svg"
                  alt="token"
                  width={20}
                  height={20}
                />
                {tokenLoading ? (
                  <Box sx={{ display: "flex", gap: 0.6, alignItems: "center" }}>
                    <Box sx={pulseDot} />
                    <Box sx={{ ...pulseDot, animationDelay: "0.2s" }} />
                    <Box sx={{ ...pulseDot, animationDelay: "0.4s" }} />
                  </Box>
                ) : (
                  <Typography
                    sx={{
                      fontFamily: "Poppins",
                      fontWeight: 500,
                      fontSize: "14px",
                      color: "rgba(222, 147, 0, 1)",
                    }}
                  >
                    {tokenBalance} tokens
                  </Typography>
                )}

                <IconButton
                  onClick={handleOpenModal}
                  sx={{
                    ml: 1,
                    width: 22,
                    height: 22,
                    backgroundColor: "white",
                    border: "0.5px solid rgba(14, 194, 125, 0.27)",
                    borderRadius: "16px",
                    boxShadow: "0px 0px 10.7px 1px rgba(41, 210, 145, 0.17)",
                  }}
                >
                  <Image
                    src="/icons/plus.svg"
                    alt="plus"
                    width={12}
                    height={12}
                  />
                </IconButton>
              </Box>

              {/* Avatar */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "white",
                  borderRadius: "25px",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
                  height: 40,
                  p: "0 10px",
                  gap: 1.5,
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
                  {profile?.companyDetails?.name || profile?.userId?.username}
                </Typography>
              </Box>

              {/* Logout */}
              <Button
                variant="contained"
                startIcon={
                  <LogoutIcon sx={{ color: "rgba(200, 65, 75, 1)" }} />
                }
                sx={{
                  height: 40,
                  backgroundColor: "white",
                  color: "rgba(200, 65, 75, 1)",
                  borderRadius: "25px",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
                  textTransform: "none",
                  "&:hover": {
                    boxShadow: "0 4px 14px rgba(0,0,0,0.02)",
                    backgroundColor: "rgba(200, 65, 75, 0.08)",
                  },
                }}
                onClick={handleLogout}
              >
                Logout
              </Button>
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
            {...stringAvatar(profile?.userId?.username || "User")}
            sx={{ width: 40, height: 40 }}
          />
          <Typography sx={{ fontSize: 16, fontWeight: 600 }}>
            {profile?.userId?.username}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Tokens */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Image src="/icons/token.svg" width={22} height={22} alt="token" />
          {tokenLoading ? (
            <Box sx={{ display: "flex", gap: 0.6, alignItems: "center" }}>
              <Box sx={pulseDot} />
              <Box sx={{ ...pulseDot, animationDelay: "0.2s" }} />
              <Box sx={{ ...pulseDot, animationDelay: "0.4s" }} />
            </Box>
          ) : (
            <Typography sx={{ color: "rgba(222,147,0,1)", fontWeight: 500 }}>
              {tokenBalance} tokens
            </Typography>
          )}

          <IconButton
            onClick={handleOpenModal}
            sx={{
              width: 26,
              height: 26,
              marginLeft: "auto",
              backgroundColor: "white",
              border: "0.5px solid rgba(14, 194, 125, 0.27)",
              borderRadius: "16px",
              boxShadow: "0px 0px 10.7px 1px rgba(41, 210, 145, 0.17)",
            }}
          >
            <Image src="/icons/plus.svg" alt="plus" width={14} height={14} />
          </IconButton>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Logout */}
        <Button
          fullWidth
          variant="contained"
          startIcon={<LogoutIcon />}
          sx={{
            backgroundColor: "white",
            color: "rgba(200, 65, 75, 1)",
            border: "0.25px solid rgba(200, 65, 75, 0.3)",
            borderRadius: "25px",
            boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
            textTransform: "none",
            "&:hover": {
              boxShadow: "0 4px 14px rgba(0,0,0,0.02)",
              backgroundColor: "rgba(200, 65, 75, 0.08)",
            },
            py: 1,
          }}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Drawer>
      <TokenPurchaseModal open={isModalOpen} handleClose={handleCloseModal} />
    </>
  );
};

export default HeaderDashboard;
