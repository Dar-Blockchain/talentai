"use client";
import React, { useMemo } from "react";
import { AppBar, Box, Toolbar
   } from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import HeaderLogo from "@/components/header/HeaderLogo";
import TokenDisplay from "@/components/header/TokenDisplay";
import HeaderNotification from "@/components/header/HeaderNotification";
import UserAvatar from "@/components/header/UserAvatar";
import HamburgerButton from "@/components/header/HamburgerButton";
import {
  appBarStyle,
  containerStyle,
  desktopMenuStyle,
  toolbarStyle,
} from "@/components/header/styles";
import HeaderNavMenu from "../header/HeaderNavMenu";
import { useRouter } from "next/router";
import HeaderPrimaryActions from "../header/HeaderPrimaryActions";

const Header = () => {
  const router = useRouter();
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );
  const { profile } = useSelector((state: RootState) => state.user.connectedUser);

  const isCompany = useMemo(
    () => profile?.type?.toLowerCase() === "company",
    [profile?.type]
  );

  const showHeaderNavMenu = useMemo(() => {
    return (
      router.pathname === "/home/company" ||
      router.pathname === "/home/candidate"
    );
  }, [router.pathname]);

    const isWorkspacePage = useMemo(() => {
    return (
      router.pathname === "/workspaces"
    );
  }, [router.pathname]);

  return (
    <AppBar position="static" elevation={0} sx={appBarStyle}>
      <Box sx={containerStyle}>
        <Toolbar sx={toolbarStyle}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {/* Logo */}
            <HeaderLogo />
            {showHeaderNavMenu && <HeaderNavMenu />}
          </Box>

          {/* DESKTOP: Desktop Menu (hidden below 750px) */}
          {isAuthenticated && (
            <Box sx={desktopMenuStyle}>
              {!showHeaderNavMenu && !isWorkspacePage && <TokenDisplay />}
              {!isCompany && !showHeaderNavMenu && !isWorkspacePage && <HeaderNotification />}
              <UserAvatar />
            </Box>
          )}
          {!isAuthenticated && (
            <Box sx={desktopMenuStyle}>
              <HeaderPrimaryActions />
            </Box>
          )}

          {/* MOBILE: Hamburger Button for Mobile */}
          <HamburgerButton />
        </Toolbar>
      </Box>
    </AppBar>
  );
};

export default Header;
