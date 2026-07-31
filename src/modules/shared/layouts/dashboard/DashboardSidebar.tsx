"use client";

import React, { useCallback } from "react";
import { X, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { usePermissionsQuery } from "@/modules/company/employees/queries";
import { useLogout } from "@/modules/auth/shared/hooks";
import { navigation, employeeNavGroups } from "./navigation";
import { selectCombinedDetails, fetchCombinedSubscriptionDetails } from "@/store/slices/paymentSlice";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { useChatUnreadBadges } from "@/modules/chat/shared/hooks/useChatUnreadBadges";
import ChatUnreadBadge from "@/modules/chat/shared/components/ChatUnreadBadge";
import { useNotifications } from "@/modules/notifications/shared/context";
import { Avatar, AvatarImage, AvatarFallback } from "@/modules/shared/ui/shadcn/avatar";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/modules/shared/ui/shadcn/tooltip";
import { cn } from "@/lib/utils";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

// Brand colors from logo
const GREEN_DARK = "#10453f";   // dark forest green (logo text)
const GREEN_MID  = "#6ad39c";   // mint green (logo circle accents)
const GREEN_VIVID = "#52e899";  // bright green (logo "ai")

const GROUPS = [
  { groupKey: "main", ids: ["dashboard", "messages", "notifications"] },
  { groupKey: "jobs", ids: ["posts", "applications"] },
  { groupKey: "campaigns", ids: ["campaigns"] },
  { groupKey: "team", ids: ["employees", "departments"] },
  { groupKey: "account", ids: ["settings", "subscription"] },
];

const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  setCollapsed,
  mobileOpen,
  onCloseMobile,
}) => {
  const { t, i18n } = useTranslation("dashboard");
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const handleLogout = useLogout("/signin");

  const handleGoHome = useCallback(() => {
    if (router.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    router.push("/");
  }, [router]);

  const profile           = useSelector((state: RootState) => state.user.connectedUser.profile);
  const user              = useSelector((state: RootState) => state.user.connectedUser.user);
  const planLimits        = useSelector((state: RootState) => state.user.connectedUser.planLimits);
  const combinedDetails   = useSelector(selectCombinedDetails);
  const { data: employeePermissions } = usePermissionsQuery(
    user?.role === "Employee" ? user?._id : undefined,
  );

  // Derive the badge label: prefer paid active plans from combined data, fall back to planLimits
  const activePlanLabel = React.useMemo(() => {
    if (combinedDetails?.subscriptions?.length) {
      const paid = combinedDetails.subscriptions.filter((s) => s.planName !== "Trial");
      if (paid.length > 1) return t("sidebar.plan.count_plans", { count: paid.length });
      if (paid.length === 1) return paid[0].planName;
      // Only trial
      return combinedDetails.subscriptions[0]?.planName ?? null;
    }
    return (planLimits as { name?: string } | null)?.name ?? null;
  }, [combinedDetails, planLimits, t]);

  const isEmployee  = user?.role === "Employee";

  // Keep plan badge up-to-date for company users
  React.useEffect(() => {
    if (!isEmployee && user?.role === "Company" && !combinedDetails) {
      dispatch(fetchCombinedSubscriptionDetails());
    }
  }, [isEmployee, user?.role, combinedDetails]);

  // Build filtered groups for employees
  const activeEmployeeGroups = employeeNavGroups.map((group) => ({
    ...group,
    items: group.items.filter(
      (item) => !item.permission || !!employeePermissions?.[item.permission]
    ),
  })).filter((group) => group.items.length > 0);

  const displayName = (() => {
    if (user?.role === "Employee" || user?.role === "Admin" || user?.role === "Candidate") {
      const full = `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim();
      return full || user?.username || "Employee";
    }
    return (
      profile?.companyDetails?.name ||
      (profile?.name as string | undefined) ||
      user?.username ||
      user?.email?.split("@")[0] ||
      "Company"
    );
  })();
  const displayInitial = displayName[0]?.toUpperCase() || "E";
  const displayEmail = user?.role === "Employee" || user?.role === "Admin" || user?.role === "Candidate"
    ? user?.email
    : "";

  const avatarUrl = profile?.user_image
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}uploads/images/${profile.user_image}`
    : null;

  const handleToggle = useCallback(() => setCollapsed((c) => !c), [setCollapsed]);

  const settingsHref = "/settings";
  const { teamChatUnread, companyMessagesUnread } = useChatUnreadBadges();
  const { unreadCount: notifUnread } = useNotifications();

  const getNavUnreadCount = (itemId: string) => {
    if (itemId === "messages")      return isEmployee ? teamChatUnread : companyMessagesUnread;
    if (itemId === "notifications") return notifUnread;
    return 0;
  };

  const renderNavItem = (item: { id: string; icon: React.ElementType; label: string; href: string }, isCollapsed: boolean) => {
    const unreadCount = getNavUnreadCount(item.id);
    const isMessagesHub = item.id === "messages";
    const isActive = isMessagesHub
      ? router.pathname === "/messages" || router.pathname.startsWith("/messages/")
      : router.pathname === item.href || router.pathname.startsWith(item.href + "/");
    const translatedLabel = t(`sidebar.nav.${item.id}`, { defaultValue: item.label });
    const btn = (
      <Link
        key={item.id}
        href={item.href}
        data-tour={`nav-${item.id}`}
        className={cn(
          "group relative flex items-center rounded-[9px] no-underline transition-all duration-100",
          isCollapsed ? "h-7 justify-center gap-0 px-0 py-0" : "gap-[5px] justify-start px-2 py-[1px]",
        )}
        style={{
          backgroundColor: isActive ? "rgba(82,232,153,0.13)" : "transparent",
          color: isActive ? GREEN_DARK : "#374151",
        }}
      >
        {isActive && (
          <span
            className="absolute left-0 top-[20%] bottom-[20%] w-[3px] rounded-r-[3px]"
            style={{ backgroundColor: GREEN_VIVID }}
          />
        )}
        <span
          className={cn(
            "nav-icon flex shrink-0 items-center justify-center rounded-lg transition-colors duration-100",
            isCollapsed ? "size-[38px]" : "size-7",
          )}
          style={{ color: isActive ? GREEN_DARK : "#6B7280" }}
        >
          <item.icon size={20} />
        </span>
        {!isCollapsed && (
          <span
            className="flex-1 text-sm leading-none"
            style={{ fontWeight: isActive ? 700 : 600, color: "inherit" }}
          >
            {translatedLabel}
          </span>
        )}
        {!isCollapsed && unreadCount > 0 && <ChatUnreadBadge count={unreadCount} />}
      </Link>
    );
    return isCollapsed ? (
      <Tooltip key={item.id}>
        <TooltipTrigger asChild><span>{btn}</span></TooltipTrigger>
        <TooltipContent side="right">{translatedLabel}</TooltipContent>
      </Tooltip>
    ) : btn;
  };

  const content = (mobile = false) => {
    const isCollapsed = collapsed && !mobile;
    const planTooltipDateLocale = i18n.language?.startsWith("fr") ? "fr-FR" : "en-US";

    return (
      <div className="flex h-full flex-col bg-white">
        {/* ── Logo bar ── */}
        <div
          className={cn(
            "flex h-16 shrink-0 items-center border-b border-gray-200 bg-[#F7FBF9]",
            isCollapsed ? "justify-center px-0" : "justify-between px-4",
          )}
        >
          {/* Logo — only visible when expanded */}
          {!isCollapsed && (
            <Image src="/logo.svg" alt="TalentAI" onClick={handleGoHome} className="h-8 w-28.75 cursor-pointer" width={115} height={32} priority />
          )}

          {/* Collapse toggle */}
          {!mobile && !isCollapsed && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleToggle}
                  className="flex size-[26px] items-center justify-center rounded-[7px] border border-gray-200 bg-gray-100 text-gray-500 transition-all duration-150 hover:bg-[rgba(106,211,156,0.10)]"
                  style={{ color: "#6B7280" }}
                >
                  <ChevronLeft size={14} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">{t("sidebar.collapse")}</TooltipContent>
            </Tooltip>
          )}

          {/* Expand float */}
          {!mobile && isCollapsed && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleToggle}
                  className="flex size-7 items-center justify-center rounded-lg border border-gray-200 bg-gray-100 text-gray-500 transition-all duration-150 hover:bg-[rgba(106,211,156,0.10)]"
                >
                  <ChevronRight size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">{t("sidebar.expand")}</TooltipContent>
            </Tooltip>
          )}

          {mobile && (
            <button onClick={onCloseMobile} className="flex size-7 items-center justify-center text-gray-500">
              <X size={17} />
            </button>
          )}
        </div>

        {/* ── Nav ── */}
        <div className="flex-1 overflow-y-auto px-2.5 py-4 [scrollbar-color:#D1D5DB_transparent] [scrollbar-width:thin]">
          {/* ── Company nav ── */}
          {!isEmployee && GROUPS.map((group, gi) => {
            const items = navigation.filter((i) => group.ids.includes(i.id));
            if (items.length === 0) return null;

            return (
              <div key={group.groupKey || gi} className="mb-3">
                {!isCollapsed && (
                  <p className={cn("px-2 pb-1 text-[9px] font-bold uppercase tracking-[0.14em] text-gray-400", gi === 0 ? "pt-0" : "pt-1")}>
                    {t(`sidebar.groups.${group.groupKey}`)}
                  </p>
                )}
                {gi > 0 && isCollapsed && (
                  <div className="mx-auto mb-3 h-px w-6 bg-gray-200" />
                )}
                <div className="flex flex-col gap-1">
                  {items.map((item) => renderNavItem(item, isCollapsed))}
                </div>
              </div>
            );
          })}

          {/* ── Employee nav ── */}
          {isEmployee && activeEmployeeGroups.map((group, gi) => (
            <div key={group.group || gi} className="mb-3">
              {group.group && !isCollapsed && (
                <p className={cn("px-2 pb-1 text-[9px] font-bold uppercase tracking-[0.14em] text-gray-400", gi === 0 ? "pt-0" : "pt-1")}>
                  {t(`sidebar.groups.${group.group.toLowerCase()}`, { defaultValue: group.group })}
                </p>
              )}
              {gi > 0 && isCollapsed && (
                <div className="mx-auto mb-3 h-px w-6 bg-gray-200" />
              )}
              <div className="flex flex-col gap-1">
                {group.items.map((item) => renderNavItem(item, isCollapsed))}
              </div>
            </div>
          ))}
        </div>

        {/* ── Footer ── */}
        <div className="shrink-0 border-t border-gray-200 bg-[#F7FBF9] px-2.5 pb-3 pt-2.5">
          <div
            onClick={() => router.push(settingsHref)}
            className={cn(
              "flex cursor-pointer items-center rounded-[9px] transition-all duration-100 hover:bg-[rgba(106,211,156,0.10)]",
              isCollapsed ? "h-[42px] justify-center gap-0 px-0 py-0" : "justify-start gap-2 px-2 py-1.5",
            )}
          >
            <Avatar className="size-7 shrink-0" style={{ backgroundColor: GREEN_DARK }}>
              {avatarUrl && <AvatarImage src={avatarUrl} />}
              <AvatarFallback className="bg-transparent text-[11px] font-bold text-white">
                {displayInitial}
              </AvatarFallback>
            </Avatar>

            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="break-words text-[12.5px] font-semibold leading-[1.35] text-gray-900">
                    {displayName}
                  </span>
                  {activePlanLabel && (
                    <div
                      onClick={(e) => { e.stopPropagation(); router.push("/company/plans"); }}
                      className="group/plan relative inline-flex shrink-0"
                    >
                      {/* Badge */}
                      <div className="inline-flex items-center rounded px-1.5 py-[1px] transition-all duration-150 hover:bg-[rgba(82,232,153,0.22)]"
                        style={{ backgroundColor: "rgba(82,232,153,0.12)", border: "1px solid rgba(82,232,153,0.35)" }}
                      >
                        <span className="text-[9px] font-bold leading-[1.4] tracking-[0.04em]" style={{ color: GREEN_DARK }}>
                          {activePlanLabel}
                        </span>
                      </div>

                      {/* Pure-CSS tooltip — pb bridges the gap so hover doesn't drop */}
                      <div className="plan-tooltip pointer-events-none absolute bottom-full left-0 z-[9999] pb-2 opacity-0 transition-opacity duration-150 group-hover/plan:pointer-events-auto group-hover/plan:opacity-100">
                        <div className="min-w-[200px] overflow-hidden rounded-[10px] border border-gray-200 bg-white shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
                          <div className="px-[14px] pb-1.5 pt-2.5">
                            <span className="text-[9px] font-bold uppercase tracking-[0.08em] text-gray-500">
                              {t("sidebar.plan.active_plans")}
                            </span>
                          </div>
                          <hr className="border-gray-200" />
                          <div className="py-1.5">
                            {combinedDetails?.subscriptions?.length
                              ? combinedDetails.subscriptions
                                  .filter((s) => s.planName !== "Trial")
                                  .map((s) => {
                                    const col = ({ Standard: "#0D9488", Gold: "#7C3AED", Platinum: "#0891B2", Diamond: "#D97706" } as Record<string, string>)[s.planName] ?? GREEN_MID;
                                    const exp = new Date(s.endDate).toLocaleDateString(planTooltipDateLocale, { month: "short", day: "numeric", year: "numeric" });
                                    return (
                                      <div key={s.id} className="flex items-center gap-2 px-[14px] py-[5px]">
                                        <span className="size-[7px] shrink-0 rounded-full" style={{ backgroundColor: col }} />
                                        <div className="min-w-0 flex-1">
                                          <p className="text-[11px] font-bold leading-[1.3] text-gray-900">{s.planName}</p>
                                          <p className="text-[9.5px] leading-[1.3] text-gray-500">
                                            {t("sidebar.plan.expires", { date: exp })}
                                          </p>
                                        </div>
                                      </div>
                                    );
                                  })
                              : (
                                <div className="px-[14px] py-[5px]">
                                  <p className="text-[11px] text-gray-500">{t("sidebar.plan.trial")}</p>
                                </div>
                              )
                            }
                          </div>
                          <hr className="border-gray-200" />
                          <div className="px-[14px] py-2">
                            <p className="text-[10px] font-semibold" style={{ color: GREEN_DARK }}>
                              {t("sidebar.plan.view_all")}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                {displayEmail && (
                  <p className="overflow-hidden text-ellipsis whitespace-nowrap text-[10px] leading-[1.3] text-gray-700">
                    {displayEmail}
                  </p>
                )}
              </div>
            )}

            {!isCollapsed && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLogout();
                    }}
                    className="flex size-8 shrink-0 items-center justify-center rounded-lg text-gray-500 transition-all duration-150 hover:bg-red-500/15 hover:text-red-400"
                  >
                    <LogOut size={18} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>{t("sidebar.sign_out")}</TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <TooltipProvider>
      {/* Permanent sidebar — hidden on mobile, always present on tablet+ */}
      <aside
        className={cn(
          "hidden shrink-0 overflow-hidden border-r border-gray-200 bg-white shadow-[2px_0_12px_rgba(0,0,0,0.06)] transition-[width] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] md:flex md:flex-col",
          collapsed ? "md:w-16" : "md:w-60",
        )}
      >
        {content(false)}
      </aside>

      {/* Overlay drawer — opens on hamburger tap for mobile + tablet */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30 md:hidden" onClick={onCloseMobile} />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-60 flex-col overflow-hidden border-r border-gray-200 bg-white shadow-xl md:hidden">
            {content(true)}
          </aside>
        </>
      )}
    </TooltipProvider>
  );
};

export default Sidebar;
