"use client";
import React, { useCallback, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { X, LayoutDashboard, MessageCircle, Bell, LogOut, User, Settings, type LucideIcon } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/modules/shared/ui/shadcn/avatar";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { logout } from "@/store/slices/authSlice";
import { useRouter } from "next/router";
import HeaderLogo from "./HeaderLogo";
import HeaderNavMenu from "./HeaderNavMenu";
import { useTranslation } from "react-i18next";
import LogoutProgressModal from "@/components/ui/LogoutProgressModal";
import { getCandidateChatBasePath } from "@/modules/chat/candidate-chat/utils/routes";

interface MobileDrawerProps {
  open:                boolean;
  onClose:             () => void;
  userId?:             string;
  unreadMessageCount?: number;
}

const TEAL    = "#0D9488";
const TEAL_BG = "rgba(13,148,136,0.07)";

const Row: React.FC<{
  Icon:    LucideIcon;
  label:   string;
  badge?:  number;
  danger?: boolean;
  onClick: () => void;
}> = ({ Icon, label, badge, danger, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 w-full px-3 py-[9px] rounded-[10px] cursor-pointer transition-colors text-left",
      danger ? "hover:bg-red-50/60" : "hover:bg-teal-600/5"
    )}
  >
    <div
      className="size-8 rounded-[9px] flex items-center justify-center shrink-0 border"
      style={{
        background:  danger ? "rgba(239,68,68,0.08)" : TEAL_BG,
        borderColor: danger ? "rgba(239,68,68,0.18)" : "rgba(13,148,136,0.15)",
      }}
    >
      <Icon size={16} style={{ color: danger ? "#EF4444" : TEAL }} />
    </div>
    <span className={cn("font-medium text-[14px] flex-1", danger ? "text-red-500" : "text-gray-700")}>
      {label}
    </span>
    {!!badge && (
      <span className="min-w-[18px] h-[18px] rounded-full px-1 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
        {badge > 9 ? "9+" : badge}
      </span>
    )}
  </button>
);

const MobileDrawer: React.FC<MobileDrawerProps> = ({ open, onClose, userId, unreadMessageCount = 0 }) => {
  const { t }    = useTranslation("common");
  const router   = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const isAuthenticated   = useSelector((s: RootState) => s.auth.isAuthenticated);
  const { user, profile } = useSelector((s: RootState) => s.user.connectedUser);

  const isCompany = profile?.type === "Company" || profile?.type === "Employee";
  const isAdmin   = profile?.type?.toLowerCase() === "admin";

  const displayName = (() => {
    if (isCompany) return profile?.companyDetails?.name || (profile as any)?.userId?.username || "Company";
    const n = `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim();
    return n || user?.email?.split("@")[0] || "User";
  })();

  const initials = (() => {
    if (isCompany) return (profile?.companyDetails?.name || "C")[0].toUpperCase();
    return ((profile?.firstName?.[0] || "") + (profile?.lastName?.[0] || "")).toUpperCase() || (user?.email?.[0] || "U").toUpperCase();
  })();

  const avatarUrl = (() => {
    const img = profile?.user_image || user?.user_image || (profile as any)?.userId?.user_image;
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

  /* lock body scroll while open */
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-[1200] bg-black/20 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Slide-from-right panel */}
      <div
        className={cn(
          "fixed top-0 right-0 z-[1201] h-full w-[280px] flex flex-col transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
        style={{ background: "#F2F3F4", boxShadow: "-8px 0 32px rgba(0,0,0,0.10)" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3.5 border-b"
          style={{ borderColor: "rgba(13,148,136,0.10)", background: "rgba(242,243,244,0.97)", backdropFilter: "blur(12px)" }}
        >
          <HeaderLogo />
          <button
            onClick={onClose}
            className="size-[30px] rounded-[8px] border flex items-center justify-center text-gray-500 transition-colors cursor-pointer"
            style={{ borderColor: "rgba(13,148,136,0.2)", background: "rgba(13,148,136,0.04)" }}
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {isAuthenticated ? (
            <>
              {/* User card */}
              <div
                className="flex items-center gap-3 px-3 py-3 mb-3 bg-white rounded-[12px] border"
                style={{ borderColor: "rgba(13,148,136,0.12)" }}
              >
                <Avatar className="size-[38px] rounded-[10px] shrink-0">
                  <AvatarImage src={avatarUrl || undefined} />
                  <AvatarFallback className="text-[13px] font-bold text-white rounded-[10px]" style={{ background: TEAL }}>
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-bold text-[13.5px] text-gray-900 truncate">{displayName}</p>
                  {user?.email && <p className="text-[11px] text-gray-400 truncate">{user.email}</p>}
                </div>
              </div>

              <div className="mb-1"><HeaderNavMenu direction="column" /></div>

              <hr className="my-2 border-t" style={{ borderColor: "rgba(13,148,136,0.08)" }} />

              <div className="space-y-0.5">
                <Row
                  Icon={LayoutDashboard}
                  label={t("header.dashboard")}
                  onClick={() => isAdmin ? go("/admin/dashboard") : isCompany ? go("/company/dashboard") : go("/candidate/dashboard")}
                />
                {!isCompany && (
                  <Row Icon={User} label={t("header.view_profile")} onClick={() => go("/candidate/profile/" + user?._id)} />
                )}
                <Row Icon={MessageCircle} label={t("header.messages")} badge={unreadMessageCount} onClick={() => go(getCandidateChatBasePath(user?.role))} />
                <Row Icon={Bell} label={t("header.notifications")} onClick={() => go("/notifications")} />
                <Row Icon={Settings} label={t("header.settings")} onClick={() => go("/settings")} />
              </div>

              <hr className="my-2 border-t" style={{ borderColor: "rgba(13,148,136,0.08)" }} />
              <Row Icon={LogOut} label={t("header.logout")} danger onClick={handleLogout} />
            </>
          ) : (
            <>
              <div className="mb-4"><HeaderNavMenu direction="column" /></div>

              <hr className="my-3 border-t" style={{ borderColor: "rgba(13,148,136,0.08)" }} />

              <div className="flex flex-col gap-2 px-0.5 mt-2">
                <button
                  onClick={() => go("/signin")}
                  className="py-[9px] rounded-[10px] text-center cursor-pointer border text-[14px] font-medium text-gray-700 transition-colors"
                  style={{ borderColor: "rgba(13,148,136,0.2)", background: "rgba(13,148,136,0.04)" }}
                >
                  {t("header.login")}
                </button>
                <button
                  onClick={() => go("/signin")}
                  className="py-[9px] rounded-[10px] text-center cursor-pointer text-[14px] font-bold text-white transition-opacity hover:opacity-90"
                  style={{ background: TEAL, boxShadow: "0 4px 14px rgba(13,148,136,0.35)" }}
                >
                  {t("header.signup")}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <LogoutProgressModal open={loggingOut} />
    </>
  );
};

export default MobileDrawer;
