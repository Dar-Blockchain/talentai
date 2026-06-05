"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from "react-redux";
import { ChevronLeft, ChevronRight, LogOut, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/modules/shared/ui/shadcn/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/modules/shared/ui/shadcn/tooltip";
import { RootState, AppDispatch } from "@/store/store";
import { logout } from "@/store/slices/authSlice";
import { navigation, employeeNavGroups } from "@/constants/navigation";
import {
  selectEmployeePermissions,
  fetchEmployeePermissions,
} from "@/store/slices/memberSlice";
import {
  selectCombinedDetails,
  fetchCombinedSubscriptionDetails,
} from "@/store/slices/paymentSlice";
import { useChatUnreadBadges } from "@/modules/chat/shared/hooks/useChatUnreadBadges";
import { useNotifications } from "@/modules/notifications/shared/context";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
  SidebarSeparator,
  useSidebar,
} from "@/modules/shared/ui/shadcn/sidebar";

const TEAL = "#6AD39C"; // hex kept — used in ${TEAL}xx alpha patterns
const TEAL_LIGHT = "#52E899";

const GROUPS = [
  { groupKey: "main", ids: ["dashboard", "messages", "notifications"] },
  { groupKey: "jobs", ids: ["posts", "applications"] },
  { groupKey: "campaigns", ids: ["campaigns"] },
  { groupKey: "team", ids: ["employees", "departments"] },
  { groupKey: "account", ids: ["settings", "subscription"] },
];

const DashboardSidebar: React.FC = () => {
  const { t } = useTranslation("dashboard");
  const { t: tAuth } = useTranslation("auth");
  const { i18n } = useTranslation();
  const [loggingOut, setLoggingOut] = useState(false);

  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";

  const handleLogout = useCallback(async () => {
    setLoggingOut(true);
    await dispatch(logout());
    router.push("/signin");
  }, [dispatch, router]);

  const handleGoHome = useCallback(() => {
    if (router.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    router.push("/");
  }, [router]);

  const profile = useSelector((s: RootState) => s.user.connectedUser.profile);
  const user = useSelector((s: RootState) => s.user.connectedUser.user);
  const planLimits = useSelector(
    (s: RootState) => s.user.connectedUser.planLimits,
  );
  const combinedDetails = useSelector(selectCombinedDetails);
  const employeePermissions = useSelector(selectEmployeePermissions);

  const activePlanLabel = useMemo(() => {
    if (combinedDetails?.subscriptions?.length) {
      const paid = combinedDetails.subscriptions.filter(
        (s) => s.planName !== "Trial",
      );
      if (paid.length > 1)
        return t("sidebar.plan.count_plans", { count: paid.length });
      if (paid.length === 1) return paid[0].planName;
      return combinedDetails.subscriptions[0]?.planName ?? null;
    }
    return (planLimits as any)?.name ?? null;
  }, [combinedDetails, planLimits, t]);

  const isEmployee = user?.role === "Employee";

  useEffect(() => {
    if (isEmployee && !employeePermissions && user?._id)
      dispatch(fetchEmployeePermissions(user._id));
  }, [isEmployee, employeePermissions, user?._id]);

  useEffect(() => {
    if (!isEmployee && user?.role === "Company" && !combinedDetails)
      dispatch(fetchCombinedSubscriptionDetails());
  }, [isEmployee, user?.role, combinedDetails]);

  const activeEmployeeGroups = employeeNavGroups
    .map((g) => ({
      ...g,
      items: g.items.filter(
        (i) => !i.permission || !!employeePermissions?.[i.permission],
      ),
    }))
    .filter((g) => g.items.length > 0);

  const displayName = (() => {
    if (
      user?.role === "Employee" ||
      user?.role === "Admin" ||
      user?.role === "Candidate"
    ) {
      const full =
        `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim();
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
  const displayEmail =
    user?.role === "Employee" ||
    user?.role === "Admin" ||
    user?.role === "Candidate"
      ? user?.email
      : "";
  const avatarUrl = profile?.user_image
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}images/Users/${profile.user_image}`
    : null;

  const planTooltipDateLocale = i18n.language?.startsWith("fr")
    ? "fr-FR"
    : "en-US";

  const { teamChatUnread, companyMessagesUnread } = useChatUnreadBadges();
  const { unreadCount: notifUnread } = useNotifications();

  const getNavUnreadCount = (itemId: string) => {
    if (itemId === "messages")
      return isEmployee ? teamChatUnread : companyMessagesUnread;
    if (itemId === "notifications") return notifUnread;
    return 0;
  };

  const renderNavItem = (item: {
    id: string;
    icon: React.ElementType;
    label: string;
    href: string;
  }) => {
    const unreadCount = getNavUnreadCount(item.id);
    const isMessagesHub = item.id === "messages";
    const isActive = isMessagesHub
      ? router.pathname === "/messages" ||
        router.pathname.startsWith("/messages/")
      : router.pathname === item.href ||
        router.pathname.startsWith(item.href + "/");
    const label = t(`sidebar.nav.${item.id}`, { defaultValue: item.label });

    return (
      <SidebarMenuItem key={item.id} isActive={isActive}>
        <SidebarMenuButton
          asChild
          isActive={isActive}
          tooltip={label}
          data-tour={`nav-${item.id}`}
        >
          <Link href={item.href} style={{ textDecoration: "none" }}>
            <div
              className="flex items-center justify-center rounded-[8px] shrink-0"
              style={{
                width: isCollapsed ? 38 : 28,
                height: isCollapsed ? 38 : 28,
              }}
            >
              <item.icon style={{ fontSize: isCollapsed ? 18 : 16 }} />
            </div>
            {!isCollapsed && (
              <span className="text-[13px] leading-none flex-1">{label}</span>
            )}
            {!isCollapsed && unreadCount > 0 && (
              <SidebarMenuBadge>
                {unreadCount > 9 ? "9+" : unreadCount}
              </SidebarMenuBadge>
            )}
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <>
      <Sidebar>
        {/* ── Logo bar ── */}
        <SidebarHeader>
          <div
            className="relative flex items-center shrink-0"
            style={{
              height: 64,
              paddingLeft: isCollapsed ? 0 : 16,
              paddingRight: isCollapsed ? 0 : 16,
              justifyContent: isCollapsed ? "center" : "space-between",
              backgroundColor: "hsl(var(--sidebar-background))",
              borderBottom: "1px solid hsl(var(--sidebar-border))",
            }}
          >
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-gradient opacity-30 pointer-events-none" />
            {!isCollapsed && (
              <img
                src="/images/home/logoDark.svg"
                alt="TalentAI"
                style={{ height: 32, cursor: "pointer" }}
                onClick={handleGoHome}
              />
            )}
            <button
              onClick={toggleSidebar}
              className="flex items-center justify-center rounded-[7px] transition-all duration-150 text-muted-foreground hover:bg-muted hover:text-foreground"
              style={{
                width: isCollapsed ? 28 : 26,
                height: isCollapsed ? 28 : 26,
              }}
            >
              {isCollapsed ? (
                <ChevronRight className="size-4" />
              ) : (
                <ChevronLeft className="size-[14px]" />
              )}
            </button>
          </div>
        </SidebarHeader>

        {/* ── Nav ── */}
        <SidebarContent>
          {/* Company nav */}
          {!isEmployee &&
            GROUPS.map((group, gi) => {
              const items = navigation.filter((i) => group.ids.includes(i.id));
              if (!items.length) return null;
              return (
                <SidebarGroup key={group.groupKey}>
                  {gi > 0 && isCollapsed && <SidebarSeparator />}
                  <SidebarGroupLabel>
                    {t(`sidebar.groups.${group.groupKey}`)}
                  </SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {items.map((item) => renderNavItem(item))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              );
            })}

          {/* Employee nav */}
          {isEmployee &&
            activeEmployeeGroups.map((group, gi) => (
              <SidebarGroup key={group.group || gi}>
                {gi > 0 && isCollapsed && <SidebarSeparator />}
                {group.group && (
                  <SidebarGroupLabel>
                    {t(`sidebar.groups.${group.group.toLowerCase()}`, {
                      defaultValue: group.group,
                    })}
                  </SidebarGroupLabel>
                )}
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => renderNavItem(item))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
        </SidebarContent>

        {/* ── Footer / User card ── */}
        <SidebarFooter>
          <div
            className="px-1 pb-[6px] pt-[5px]"
            style={{
              borderTop: "1px solid hsl(var(--sidebar-border))",
              backgroundColor: "hsl(var(--sidebar-background))",
            }}
          >
            <div
              onClick={() => router.push("/settings")}
              className="flex items-center rounded-[9px] cursor-pointer transition-colors duration-[120ms] hover:bg-muted"
              style={{
                gap: isCollapsed ? 0 : 8,
                paddingLeft: isCollapsed ? 0 : 4,
                paddingRight: isCollapsed ? 0 : 4,
                paddingTop: 6,
                paddingBottom: 6,
                height: isCollapsed ? 42 : "auto",
                justifyContent: isCollapsed ? "center" : "flex-start",
              }}
            >
              <Avatar className="shrink-0" style={{ width: 28, height: 28 }}>
                <AvatarImage src={avatarUrl ?? undefined} />
                <AvatarFallback
                  style={{
                    backgroundColor: TEAL,
                    color: "#fff",
                    fontSize: "11px",
                    fontWeight: 700,
                  }}
                >
                  {displayInitial}
                </AvatarFallback>
              </Avatar>

              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-[6px] flex-wrap">
                    <span className="text-[12.5px] font-semibold leading-[1.35] break-words text-foreground">
                      {displayName}
                    </span>
                    {activePlanLabel && (
                      <div className="relative inline-flex shrink-0 group/plan">
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push("/company/plans");
                          }}
                          className="inline-flex items-center px-[6px] py-[1px] rounded-[4px] cursor-pointer transition-all duration-150"
                          style={{
                            backgroundColor: `${TEAL}28`,
                            border: `1px solid ${TEAL}55`,
                          }}
                          onMouseEnter={(e) => {
                            const el = e.currentTarget as HTMLDivElement;
                            el.style.backgroundColor = `${TEAL}45`;
                            el.style.borderColor = `${TEAL}99`;
                          }}
                          onMouseLeave={(e) => {
                            const el = e.currentTarget as HTMLDivElement;
                            el.style.backgroundColor = `${TEAL}28`;
                            el.style.borderColor = `${TEAL}55`;
                          }}
                        >
                          <span
                            className="text-[9px] font-bold tracking-[0.04em] leading-[1.4]"
                            style={{ color: TEAL_LIGHT }}
                          >
                            {activePlanLabel}
                          </span>
                        </div>

                        {/* Plan tooltip */}
                        <div className="absolute bottom-full left-0 z-[9999] pb-2 opacity-0 pointer-events-none group-hover/plan:opacity-100 group-hover/plan:pointer-events-auto transition-opacity duration-150">
                          <div
                            className="min-w-[200px] rounded-[10px] overflow-hidden"
                            style={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--sidebar-border))",
                              boxShadow: "0 8px 32px rgba(0,0,0,0.55)",
                            }}
                          >
                            <div className="px-[14px] pt-[10px] pb-[6px]">
                              <span className="text-[9px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                                {t("sidebar.plan.active_plans")}
                              </span>
                            </div>
                            <div className="h-px bg-sidebar-border" />
                            <div className="py-[6px]">
                              {combinedDetails?.subscriptions?.length ? (
                                combinedDetails.subscriptions
                                  .filter((s) => s.planName !== "Trial")
                                  .map((s) => {
                                    const col =
                                      (
                                        {
                                          Standard: "#6AD39C",
                                          Gold: "#BD85FF",
                                          Platinum: "#52E899",
                                          Diamond: "#D97706",
                                        } as Record<string, string>
                                      )[s.planName] ?? TEAL;
                                    const exp = new Date(
                                      s.endDate,
                                    ).toLocaleDateString(
                                      planTooltipDateLocale,
                                      {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                      },
                                    );
                                    return (
                                      <div
                                        key={s.id}
                                        className="flex items-center gap-2 px-[14px] py-[5px]"
                                      >
                                        <div
                                          className="w-[7px] h-[7px] rounded-full shrink-0"
                                          style={{ backgroundColor: col }}
                                        />
                                        <div className="flex-1 min-w-0">
                                          <p className="text-[11px] font-bold leading-[1.3] text-foreground">
                                            {s.planName}
                                          </p>
                                          <p className="text-[9.5px] leading-[1.3] text-muted-foreground">
                                            {t("sidebar.plan.expires", {
                                              date: exp,
                                            })}
                                          </p>
                                        </div>
                                      </div>
                                    );
                                  })
                              ) : (
                                <div className="px-[14px] py-[5px]">
                                  <span className="text-[11px] text-muted-foreground">
                                    {t("sidebar.plan.trial")}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="h-px bg-sidebar-border" />
                            <div className="px-[14px] py-[8px]">
                              <span
                                className="text-[10px] font-semibold"
                                style={{ color: TEAL_LIGHT }}
                              >
                                {t("sidebar.plan.view_all")}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  {displayEmail && (
                    <p className="text-[10px] leading-[1.3] truncate text-muted-foreground">
                      {displayEmail}
                    </p>
                  )}
                </div>
              )}

              {!isCollapsed && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLogout();
                  }}
                  className="flex items-center justify-center rounded-[8px] shrink-0 transition-all duration-150 text-muted-foreground hover:bg-red-500/15 hover:text-red-400"
                  style={{ width: 32, height: 32 }}
                >
                  <LogOut className="size-[18px]" />
                </button>
              )}
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>

      {/* Logout overlay */}
      {loggingOut && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/85 backdrop-blur-[6px]">
          <div className="flex flex-col items-center gap-4 bg-white rounded-[20px] px-10 py-8 shadow-[0_8px_40px_rgba(0,0,0,0.12)] border border-[#E8EAED]">
            <Loader2
              className="size-10 animate-spin"
              style={{ color: "#BD85FF" }}
            />
            <div className="text-center">
              <p className="font-bold text-base text-[#0F172A]">
                {tAuth("logout.signing_out")}
              </p>
              <p className="text-[0.8125rem] text-[#94A3B8] mt-1">
                {tAuth("logout.please_wait")}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DashboardSidebar;
