"use client";
import React, { useMemo, useEffect, useState, useRef } from "react";
import { AppBar, Box, Toolbar } from "@mui/material";
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
import HeaderNavMenu from "@/components/header/HeaderNavMenu";
import HeaderPrimaryActions from "@/components/header/HeaderPrimaryActions";
import HeaderMessagesDropdown from "@/components/header/HeaderMessagesDropdown";
import { useRouter } from "next/router";
import { io, Socket } from "socket.io-client";

const Header = () => {
  const router = useRouter();
  const socketRef = useRef<Socket | null>(null);

  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );
  // Get the user object (contains the actual user ID for WebSocket)
  const connectedUser = useSelector(
    (state: RootState) => state.user?.connectedUser?.user
  );
  const profile = useSelector(
    (state: RootState) => state.user?.connectedUser?.profile
  );
  // User ID for WebSocket should be the user._id, not profile._id
  const userId = connectedUser?._id;

  const [unreadMessageCount, setUnreadMessageCount] = useState(0);

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
    return router.pathname === "/workspaces";
  }, [router.pathname]);

  /* ===============================
     FETCH UNREAD MESSAGE COUNT
  ================================ */
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchUnread = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}chat/conversations/unread-count`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.ok) {
          const data = await res.json();
          setUnreadMessageCount(data.data?.totalUnread || 0);
        }
      } catch (err) {
        console.error("Failed to fetch unread messages", err);
      }
    };

    fetchUnread();
  }, [isAuthenticated]);

  /* ===============================
     SOCKET.IO – HEADER LEVEL ONLY
  ================================ */
  useEffect(() => {
    if (!userId || !isAuthenticated) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    console.log("🔌 Header: Connecting to chat WebSocket with userId:", userId);

    const socket = io(
      `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "")}/chat`,
      {
        auth: { userId, token },
        transports: ["websocket", "polling"],
      }
    );

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("✅ Header: WebSocket connected, socket id:", socket.id);
    });

    socket.on("connect_error", (error) => {
      console.error("❌ Header: WebSocket connection error:", error);
    });

    socket.on("message_notification", (data) => {
      console.log("📩 Header: Received message notification:", data);
      setUnreadMessageCount((prev) => prev + 1);
    });

    return () => {
      console.log("🔌 Header: Disconnecting WebSocket");
      socket.disconnect();
    };
  }, [userId, isAuthenticated]);

  return (
    <AppBar position="static" elevation={0} sx={appBarStyle}>
      <Box sx={containerStyle}>
        <Toolbar sx={toolbarStyle}>
          {/* LEFT */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <HeaderLogo />
            {showHeaderNavMenu && <HeaderNavMenu />}
          </Box>

          {/* RIGHT – AUTHENTICATED */}
          {isAuthenticated && (
            <Box sx={desktopMenuStyle}>
              {!showHeaderNavMenu && !isWorkspacePage && <TokenDisplay />}

              {/* Messages Dropdown */}
              {!showHeaderNavMenu && !isWorkspacePage && (
                <HeaderMessagesDropdown
                  userId={userId}
                  unreadMessageCount={unreadMessageCount}
                />
              )}
              {!isCompany && !showHeaderNavMenu && !isWorkspacePage && (
                <HeaderNotification />
              )}

              <UserAvatar />
            </Box>
          )}

          {/* RIGHT – NOT AUTHENTICATED */}
          {!isAuthenticated && (
            <Box sx={desktopMenuStyle}>
              <HeaderPrimaryActions />
            </Box>
          )}

          {/* MOBILE */}
          <HamburgerButton />
        </Toolbar>
      </Box>
    </AppBar>
  );
};

export default Header;
