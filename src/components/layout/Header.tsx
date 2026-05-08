"use client";
import React, { useMemo, useEffect, useState, useRef } from "react";
import { Box } from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import HeaderLogo from "@/components/layout/header/HeaderLogo";
import HeaderNotification from "@/components/layout/header/HeaderNotification";
import UserAvatar from "@/components/layout/header/UserAvatar";
import HamburgerButton from "@/components/layout/header/HamburgerButton";
import HeaderNavMenu from "@/components/layout/header/HeaderNavMenu";
import HeaderPrimaryActions from "@/components/layout/header/HeaderPrimaryActions";
import HeaderMessagesDropdown from "@/components/layout/header/HeaderMessagesDropdown";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import { useRouter } from "next/router";
import { io, Socket } from "socket.io-client";

const Header = () => {
  const router    = useRouter();
  const socketRef = useRef<Socket | null>(null);
  const [scrolled, setScrolled] = useState(false);

  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const connectedUser   = useSelector((state: RootState) => state.user?.connectedUser?.user);
  const profile         = useSelector((state: RootState) => state.user?.connectedUser?.profile);
  const userId          = connectedUser?._id;
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);

  const landingLikePaths = useMemo(
    () => ["/", "/home/candidate", "/candidate/home", "/terms", "/privacy"],
    []
  );

  const showHeaderNavMenu = useMemo(() => (
    landingLikePaths.includes(router.pathname)
  ), [router.pathname, landingLikePaths]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    (async () => {
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
      } catch { /* silent */ }
    })();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!userId || !isAuthenticated) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    const socket = io(
      `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "")}/chat`,
      { auth: { userId, token }, transports: ["websocket", "polling"] }
    );
    socketRef.current = socket;
    socket.on("message_notification", () => setUnreadMessageCount((p) => p + 1));
    return () => { socket.disconnect(); };
  }, [userId, isAuthenticated]);

  const isLandingPage = landingLikePaths.includes(router.pathname);
  const isCompact     = scrolled || !isLandingPage;

  return (
    <>
      <Box sx={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1100 }}>
        <Box sx={{
          maxWidth: isCompact ? "1000px" : "1440px",
          mx: "auto",
          px: { xs: 1.5, md: 4 },
          pt: isCompact ? 3 : 1.5,
          pb: isCompact ? 1.5 : 0,
          transition: "max-width 0.5s cubic-bezier(0.22,1,0.36,1), padding-top 0.4s ease, padding-bottom 0.4s ease",
        }}>
          {/* Inner bar */}
          <Box sx={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            "@media (min-width:800px)": { gridTemplateColumns: "auto 1fr auto" },
            alignItems: "center",
            height: 54,
            px: { xs: 1.5, md: 2.5 },
            borderRadius: isCompact ? "99px" : "0px",
            bgcolor: isCompact ? "rgba(242,243,244,0.97)" : "transparent",
            backdropFilter: isCompact ? "blur(18px)" : "none",
            WebkitBackdropFilter: isCompact ? "blur(18px)" : "none",
            border: "1px solid",
            borderColor: isCompact ? "rgba(13,148,136,0.18)" : "transparent",
            boxShadow: isCompact
              ? "0 12px 40px rgba(0,0,0,0.14), 0 4px 14px rgba(0,0,0,0.09), 0 1px 3px rgba(0,0,0,0.06)"
              : "none",
            transition: [
              "background-color 0.4s ease",
              "border-color 0.4s ease",
              "box-shadow 0.4s ease",
              "border-radius 0.5s cubic-bezier(0.22,1,0.36,1)",
            ].join(", "),
          }}>

            {/* LEFT — logo */}
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <HeaderLogo />
            </Box>

            {/* CENTER — nav (hidden <800px) */}
            <Box sx={{ display: "none", "@media (min-width:800px)": { display: "flex" }, alignItems: "center", justifyContent: "center" }}>
              {showHeaderNavMenu && <HeaderNavMenu inverted={!isCompact} />}
            </Box>

            {/* RIGHT — actions */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 1 }}>
              {/* Language switcher — always visible on desktop */}
              <Box sx={{ display: "none", "@media (min-width:800px)": { display: "flex" } }}>
                <LanguageSwitcher variant="icon" size="small" />
              </Box>

              {isAuthenticated ? (
                <>
                  {/* Icon group (hidden <800px) */}
                  <Box sx={{
                    display: "none",
                    "@media (min-width:800px)": { display: "flex" },
                    alignItems: "center",
                    gap: 0.5,
                  }}>
                    <HeaderMessagesDropdown userId={userId} unreadMessageCount={unreadMessageCount} />
                    <HeaderNotification />
                  </Box>

                  {/* Divider */}
                  <Box sx={{ width: "1px", height: 20, bgcolor: "rgba(0,0,0,0.10)" }} />

                  {/* User pill (hidden <800px) */}
                  <Box sx={{ display: "none", "@media (min-width:800px)": { display: "flex" } }}>
                    <UserAvatar />
                  </Box>
                </>
              ) : (
                /* Primary actions (hidden <800px) */
                <Box sx={{ display: "none", "@media (min-width:800px)": { display: "flex" } }}>
                  <HeaderPrimaryActions inverted={!isCompact} />
                </Box>
              )}
              <HamburgerButton
                userId={userId}
                unreadMessageCount={unreadMessageCount}
              />
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Spacer so page content starts below the fixed header */}
      <Box sx={{ height: { xs: 76, md: 90 } }} />
    </>
  );
};

export default Header;
