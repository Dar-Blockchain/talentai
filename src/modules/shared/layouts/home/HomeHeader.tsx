"use client";
import React, { useMemo, useEffect, useState, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { getToken } from "@/utils/tokenUtils";
import HeaderLogo from "./HeaderLogo";
import HeaderNotification from "@/modules/notifications/shared/components/HeaderNotification";
import UserAvatar from "@/modules/shared/layouts/shared/UserAvatar";
import HamburgerButton from "./HamburgerButton";
import HeaderNavMenu from "./HeaderNavMenu";
import HeaderPrimaryActions from "./HeaderPrimaryActions";
import HeaderMessagesDropdown from "./HeaderMessagesDropdown";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import { useRouter } from "next/router";
import { io, Socket } from "socket.io-client";

const HomeHeader = () => {
  const router    = useRouter();
  const socketRef = useRef<Socket | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const isAuthRedux   = useSelector((state: RootState) => state.auth.isAuthenticated);
  const connectedUser = useSelector((state: RootState) => state.user?.connectedUser?.user);
  const profile       = useSelector((state: RootState) => state.user?.connectedUser?.profile);
  const userId        = connectedUser?._id;
  const isCandidate   = connectedUser?.role?.toLowerCase() === "candidate";

  const handleCandidateViewAll = useCallback(() => router.push("/candidate/notifications"), [router]);

  const [hasToken, setHasToken] = useState(false);
  useEffect(() => { setHasToken(!!getToken()); }, [isAuthRedux]);
  const isAuthenticated = isAuthRedux || hasToken;
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);

  const landingLikePaths = useMemo(
    () => ["/", "/home/candidate", "/candidate/home", "/terms", "/privacy"],
    []
  );

  const showHeaderNavMenu = useMemo(
    () => landingLikePaths.includes(router.pathname),
    [router.pathname, landingLikePaths]
  );

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
      <div className="fixed top-0 left-0 right-0 z-[1100]">
        <div
          className="mx-auto transition-all duration-500"
          style={{
            maxWidth:      isCompact ? "1000px" : "1440px",
            paddingLeft:   "max(24px, env(safe-area-inset-left))",
            paddingRight:  "max(24px, env(safe-area-inset-right))",
            paddingTop:    isCompact ? 12 : 6,
            paddingBottom: isCompact ? 6  : 0,
          }}
        >
          {/* Inner bar */}
          <div
            className="grid items-center transition-all duration-500"
            style={{
              gridTemplateColumns: "1fr auto",
              height:        54,
              paddingLeft:   "max(12px, 10px)",
              paddingRight:  "max(12px, 10px)",
              borderRadius:  isCompact ? "99px" : "0px",
              backgroundColor: isCompact ? "rgba(242,243,244,0.97)" : "transparent",
              backdropFilter:     isCompact ? "blur(18px)" : "none",
              WebkitBackdropFilter: isCompact ? "blur(18px)" : "none",
              border: "1px solid",
              borderColor: isCompact ? "rgba(13,148,136,0.18)" : "transparent",
              boxShadow: isCompact
                ? "0 12px 40px rgba(0,0,0,0.14), 0 4px 14px rgba(0,0,0,0.09), 0 1px 3px rgba(0,0,0,0.06)"
                : "none",
            }}
          >
            {/* LEFT — logo */}
            <div className="flex items-center">
              <HeaderLogo />
            </div>

            {/* CENTER — nav (hidden <800px) */}
            <div className="hidden [800px]:flex items-center justify-center" />

            {/* RIGHT — actions */}
            <div className="flex items-center justify-end gap-2">
              <div className="hidden [800px]:flex">
                <LanguageSwitcher variant="icon" size="small" />
              </div>

              {isAuthenticated ? (
                <>
                  <div className="hidden [800px]:flex items-center gap-1">
                    <HeaderMessagesDropdown userId={userId} unreadMessageCount={unreadMessageCount} />
                    <HeaderNotification onViewAll={isCandidate ? handleCandidateViewAll : undefined} />
                  </div>
                  <div className="w-px h-5 bg-black/10" />
                  <div className="hidden [800px]:flex">
                    <UserAvatar />
                  </div>
                </>
              ) : (
                <div className="hidden [800px]:flex">
                  <HeaderPrimaryActions inverted={!isCompact} />
                </div>
              )}
              <HamburgerButton userId={userId} unreadMessageCount={unreadMessageCount} />
            </div>
          </div>
        </div>
      </div>

      {/* Spacer */}
      <div style={{ height: "clamp(76px, 90px, 90px)" }} />
    </>
  );
};

export default HomeHeader;
