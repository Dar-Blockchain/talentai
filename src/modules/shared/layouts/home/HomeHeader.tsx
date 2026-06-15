"use client";
import React, { useMemo, useEffect, useState, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useAuthContext } from "@/modules/auth/shared/context/AuthContext";
import { getToken } from '@/modules/auth/shared/utils/token';
import HeaderLogo from "@/modules/shared/layouts/home/HeaderLogo";
import HeaderNotification from "@/modules/notifications/shared/components/HeaderNotification";
import UserAvatar from "@/modules/shared/layouts/shared/UserAvatar";
import HamburgerButton from "@/modules/shared/layouts/home/HamburgerButton";
import HeaderNavMenu from "@/modules/shared/layouts/home/HeaderNavMenu";
import HeaderPrimaryActions from "@/modules/shared/layouts/home/HeaderPrimaryActions";
import HeaderMessagesDropdown from "@/modules/shared/layouts/home/HeaderMessagesDropdown";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import { useRouter } from "next/router";
import { io, Socket } from "socket.io-client";
import { cn } from "@/lib/utils";

const Header = () => {
  const router    = useRouter();
  const socketRef = useRef<Socket | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated: isAuthContext } = useAuthContext();
  const connectedUser = useSelector((state: RootState) => state.user?.connectedUser?.user);
  const userId        = connectedUser?._id;
  const isCandidate   = connectedUser?.role?.toLowerCase() === "candidate";

  const handleCandidateViewAll = useCallback(() => router.push("/notifications"), [router]);

  const [hasToken, setHasToken] = useState(false);
  useEffect(() => {
    setHasToken(!!getToken());
  }, [isAuthContext]);
  const isAuthenticated = isAuthContext || hasToken;
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);

  const landingLikePaths = useMemo(
    () => ["/", "/terms", "/privacy"],
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
        const token = getToken();
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
    const token = getToken();
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
      {/* Fixed header */}
      <div className="fixed inset-x-0 top-0 z-[50]">
        <div
          className={cn(
            "mx-auto px-3 md:px-8",
            "transition-[max-width,padding-top,padding-bottom] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
            isCompact ? "max-w-[1000px] pt-3 pb-[18px]" : "max-w-[1440px] pt-[18px] pb-0"
          )}
        >
          {/* Inner pill / bar */}
          <div
            className={cn(
              // layout
              "grid grid-cols-[1fr_auto] [@media(min-width:800px)]:grid-cols-[auto_1fr_auto]",
              "items-center h-[54px] px-3 [@media(min-width:800px)]:px-5",
              "border",
              // smooth all animated properties
              "transition-[background-color,border-color,box-shadow,border-radius,backdrop-filter] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
              isCompact
                ? [
                    "rounded-full",
                    "bg-[rgba(242,243,244,0.97)]",
                    "backdrop-blur-[18px]",
                    "border-[rgba(13,148,136,0.18)]",
                    "shadow-[0_12px_40px_rgba(0,0,0,0.14),_0_4px_14px_rgba(0,0,0,0.09),_0_1px_3px_rgba(0,0,0,0.06)]",
                  ].join(" ")
                : "rounded-none bg-transparent backdrop-blur-none border-transparent shadow-none"
            )}
          >
            {/* LEFT — logo */}
            <div className="flex items-center">
              <HeaderLogo />
            </div>

            {/* CENTER — nav (hidden below 800px) */}
            <div className="hidden [@media(min-width:800px)]:flex items-center justify-center">
              {showHeaderNavMenu && <HeaderNavMenu inverted={!isCompact} />}
            </div>

            {/* RIGHT — actions */}
            <div className="flex items-center justify-end gap-2">
              {isAuthenticated ? (
                <div className="hidden [@media(min-width:800px)]:flex items-center gap-1.5">
                  {/* Language + notif + messages cluster */}
                  <div className="flex items-center gap-0.5 bg-gray-100/80 rounded-xl px-1 py-1">
                    <LanguageSwitcher variant="icon" size="small" />
                    <HeaderMessagesDropdown userId={userId} unreadMessageCount={unreadMessageCount} />
                    <HeaderNotification onViewAll={isCandidate ? handleCandidateViewAll : undefined} />
                  </div>

                  {/* Divider */}
                  <div className="w-px h-4 bg-gray-300/50" />

                  {/* User pill */}
                  <UserAvatar />
                </div>
              ) : (
                /* Primary actions + lang (unauthenticated) */
                <div className="hidden [@media(min-width:800px)]:flex items-center gap-2">
                  <LanguageSwitcher variant="icon" size="small" standalone />
                  <HeaderPrimaryActions inverted={!isCompact} />
                </div>
              )}

              <HamburgerButton
                userId={userId}
                unreadMessageCount={unreadMessageCount}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Spacer */}
      <div className="h-[76px] md:h-[90px]" />
    </>
  );
};

export default Header;
