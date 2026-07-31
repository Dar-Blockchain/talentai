"use client";
import React, { useCallback, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useAuthContext } from "@/modules/auth/shared/context/AuthContext";
import { useLogout } from "@/modules/auth/shared/hooks";
import { useRouter } from "next/router";
import HeaderLogo from "./HeaderLogo";
import HeaderNavMenu from "./HeaderNavMenu";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { useTranslation } from "react-i18next";
import { getCandidateChatBasePath } from "@/modules/chat/candidate-chat/utils/routes";
import {
  LayoutDashboard, MessageSquare, Bell, LogOut,
  Settings, X, ChevronRight, ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/modules/shared/ui/shadcn/avatar";

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
  active?: boolean;
  onClick: () => void;
}> = ({ icon, label, badge, danger, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "group flex items-center gap-2.5 w-full text-left",
      "px-2 py-[9px] rounded-[10px] cursor-pointer",
      "transition-all duration-150",
      danger
        ? "hover:bg-destructive/5"
        : active
          ? "bg-primary/[0.07]"
          : "hover:bg-primary/[0.07]"
    )}
  >
    <span
      className={cn(
        "w-8 h-8 rounded-[9px] flex-shrink-0",
        "flex items-center justify-center border transition-colors duration-150",
        "[&>svg]:w-[15px] [&>svg]:h-[15px]",
        danger
          ? "bg-destructive/[0.08] border-destructive/20 [&>svg]:text-destructive"
          : active
            ? "bg-gray-200 border-gray-300 [&>svg]:text-gray-700"
            : "bg-gray-100 border-gray-200 [&>svg]:text-gray-400 group-hover:bg-gray-200 group-hover:border-gray-300 group-hover:[&>svg]:text-gray-600"
      )}
    >
      {icon}
    </span>

    <span className={cn(
      "font-sans text-[13.5px] flex-1",
      danger    ? "font-medium text-destructive" :
      active    ? "font-semibold text-primary"   :
                  "font-medium text-gray-700"
    )}>
      {label}
    </span>

    {!!badge ? (
      <span className="min-w-[18px] h-[18px] rounded-full px-0.5 bg-destructive flex items-center justify-center text-white text-[10px] font-bold leading-none">
        {badge > 9 ? "9+" : badge}
      </span>
    ) : !danger && (
      <ChevronRight className={cn(
        "w-3.5 h-3.5 flex-shrink-0 transition-all duration-150",
        active ? "text-primary/50" : "text-gray-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5"
      )} />
    )}
  </button>
);

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="px-2 pt-0.5 pb-1.5 text-[10px] font-extrabold text-gray-400 uppercase tracking-[1.2px] select-none">
    {children}
  </p>
);

const MobileDrawer: React.FC<MobileDrawerProps> = ({ open, onClose, unreadMessageCount = 0 }) => {
  const { t } = useTranslation("common");
  const router   = useRouter();
  const { isAuthenticated } = useAuthContext();
  const doLogout = useLogout("/signin");
  const { user, profile } = useSelector((state: RootState) => state.user.connectedUser);

  const isCompany = profile?.type === "Company" || profile?.type === "Employee";
  const isAdmin   = profile?.type?.toLowerCase() === "admin";

  const displayName = (() => {
    if (isCompany) return profile?.companyDetails?.name || profile?.userId?.username || "Company";
    const n = `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim();
    return n || user?.email?.split("@")[0] || "User";
  })();

  const initials = (() => {
    if (isCompany) return (profile?.companyDetails?.name || "C")[0].toUpperCase();
    return (
      ((profile?.firstName?.[0] || "") + (profile?.lastName?.[0] || "")).toUpperCase() ||
      (user?.email?.[0] || "U").toUpperCase()
    );
  })();

  const avatarUrl = (() => {
    const img = profile?.user_image || user?.user_image || profile?.userId?.user_image;
    return img ? `${process.env.NEXT_PUBLIC_API_BASE_URL}uploads/images/${img}` : null;
  })();

  // Role badge meta
  const roleMeta = isAdmin
    ? { label: "Admin",     bg: "bg-amber-50",   border: "border-amber-200",  dot: "bg-amber-400",  text: "text-amber-700"  }
    : isCompany
      ? { label: "Company",   bg: "bg-violet-50",  border: "border-violet-200", dot: "bg-violet-400", text: "text-violet-700" }
      : { label: "Candidate", bg: "bg-primary/[0.08]", border: "border-primary/20", dot: "bg-primary",    text: "text-primary"    };

  // Active route detection
  const p = router.pathname;
  const isActiveDashboard     = p.includes("dashboard");
  const isActiveMessages      = p.includes("chat") || p.includes("message");
  const isActiveNotifications = p === "/notifications";
  const isActiveSettings      = p === "/settings";

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const go = (path: string) => { router.push(path); onClose(); };

  const handleLogout = useCallback(() => {
    onClose();
    doLogout();
  }, [doLogout, onClose]);

  const goDashboard = () => {
    if (isAdmin)        go("/admin/dashboard");
    else if (isCompany) go("/company/dashboard");
    else                go("/candidate/dashboard");
  };

  useEffect(() => {
    if (!open) return;
    document.documentElement.style.overflow = "hidden";
    return () => { document.documentElement.style.overflow = ""; };
  }, [open]);

  if (!mounted) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-[9998] bg-black/50 backdrop-blur-[2px]",
          "transition-opacity duration-300",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        className={cn(
          "fixed top-0 right-0 bottom-0 z-[9999]",
          "w-[280px] flex flex-col",
          "bg-gray-50 shadow-[-12px_0_40px_rgba(0,0,0,0.12)]",
          "border-l border-primary/10",
          "transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* ── Header bar ── */}
        <div className="flex items-center justify-between px-4 py-[14px] border-b border-primary/10 bg-white/90 backdrop-blur-[12px]">
          <HeaderLogo />
          <button
            type="button"
            onClick={onClose}
            className="w-[30px] h-[30px] rounded-[8px] border border-primary/20 bg-primary/5 flex items-center justify-center cursor-pointer hover:bg-primary/10 transition-colors"
          >
            <X className="w-4 h-4 text-primary" />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-2.5 py-3 flex flex-col">
          {isAuthenticated ? (
            <>
              {/* ── User hero card ── */}
              <div className="relative mb-3 overflow-hidden rounded-2xl border border-primary/10">
                {/* Gradient fill */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.09] via-primary/[0.04] to-transparent pointer-events-none" />
                {/* Dot mesh */}
                <div
                  className="absolute inset-0 pointer-events-none opacity-40"
                  style={{
                    backgroundImage: "radial-gradient(circle, rgba(106,211,156,0.25) 1px, transparent 1px)",
                    backgroundSize: "14px 14px",
                  }}
                />

                <div className="relative p-3 flex items-center gap-3">
                  {/* Avatar + online dot */}
                  <div className="relative flex-shrink-0">
                    <Avatar className="w-12 h-12 rounded-xl ring-2 ring-white shadow-md">
                      <AvatarImage src={avatarUrl || undefined} alt={displayName} className="object-cover" />
                      <AvatarFallback className="rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground text-[14px] font-black">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute -bottom-0.5 -right-0.5 w-[11px] h-[11px] rounded-full bg-green-400 border-2 border-white shadow-sm" />
                  </div>

                  {/* Name / email / role */}
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-[14px] text-gray-900 truncate leading-snug">
                      {displayName}
                    </p>
                    {user?.email && (
                      <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
                    )}
                    <div className={cn(
                      "inline-flex items-center gap-1 mt-1.5 rounded-full px-2 py-[3px] border",
                      roleMeta.bg, roleMeta.border
                    )}>
                      <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", roleMeta.dot)} />
                      <span className={cn("text-[10px] font-bold leading-none", roleMeta.text)}>
                        {roleMeta.label}
                      </span>
                    </div>
                  </div>

                  {/* Dashboard quick-jump */}
                  <button
                    type="button"
                    onClick={goDashboard}
                    title="Go to dashboard"
                    className="group/qd flex-shrink-0 w-8 h-8 rounded-xl bg-white border border-primary/20 shadow-sm flex items-center justify-center hover:bg-primary hover:border-primary transition-all duration-150"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5 text-primary group-hover/qd:text-white transition-colors duration-150" />
                  </button>
                </div>
              </div>

              {/* ── Explore ── */}
              <SectionLabel>Explore</SectionLabel>
              <div className="mb-1">
                <HeaderNavMenu direction="column" />
              </div>

              <hr className="my-2 border-gray-200" />

              {/* ── Account ── */}
              <SectionLabel>Account</SectionLabel>
              <div>
                <Row
                  icon={<LayoutDashboard />}
                  label={t("header.dashboard")}
                  active={isActiveDashboard}
                  onClick={goDashboard}
                />
                <Row
                  icon={<MessageSquare />}
                  label={t("header.messages")}
                  badge={unreadMessageCount}
                  active={isActiveMessages}
                  onClick={() => go(getCandidateChatBasePath(user?.role))}
                />
                <Row
                  icon={<Bell />}
                  label={t("header.notifications")}
                  active={isActiveNotifications}
                  onClick={() => go("/notifications")}
                />
                <Row
                  icon={<Settings />}
                  label={t("header.settings")}
                  active={isActiveSettings}
                  onClick={() => go("/settings")}
                />
              </div>

              {/* ── Logout — pinned at bottom ── */}
              <div className="mt-auto pt-2">
                <hr className="mb-2 border-gray-200" />
                <Row icon={<LogOut />} label={t("header.logout")} danger onClick={handleLogout} />
              </div>
            </>
          ) : (
            <>
              <div className="mb-2">
                <HeaderNavMenu direction="column" />
              </div>

              <hr className="my-2 border-primary/10" />

              <div className="flex flex-col gap-2 px-0.5 mt-1">
                <Button
                  variant="outline"
                  onClick={() => go("/signin")}
                  className="py-[9px] h-auto rounded-[10px] border-primary/25 bg-primary/5 font-sans text-sm font-medium text-gray-700 hover:bg-primary/10 w-full"
                >
                  {t("header.login")}
                </Button>
                <Button
                  variant="default"
                  onClick={() => go("/signin")}
                  className="py-[9px] h-auto rounded-[10px] font-sans text-sm font-bold shadow-brand hover:brightness-105 w-full"
                >
                  {t("header.signup")}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

    </>,
    document.body
  );
};

export default MobileDrawer;
