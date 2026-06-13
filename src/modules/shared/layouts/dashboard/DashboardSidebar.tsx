"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Drawer,
  IconButton,
  Avatar,
  Tooltip,
  Typography,
  Divider,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CloseOutlined from "@mui/icons-material/CloseOutlined";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { useLogout } from "@/modules/auth/shared/hooks";
import { navigation, employeeNavGroups, EmployeeNavItem } from "@/constants/navigation";
import { selectEmployeePermissions, fetchEmployeePermissions } from "@/store/slices/memberSlice";
import { selectCombinedDetails, fetchCombinedSubscriptionDetails } from "@/store/slices/paymentSlice";
import { LogoutOutlined } from "@mui/icons-material";
import { useRouter } from "next/router";
import ChevronLeftOutlined from "@mui/icons-material/ChevronLeftOutlined";
import ChevronRightOutlined from "@mui/icons-material/ChevronRightOutlined";
import LogoutProgressModal from "@/components/ui/LogoutProgressModal";
import { useTranslation } from "react-i18next";
import { useChatUnreadBadges } from "@/modules/chat/shared/hooks/useChatUnreadBadges";
import ChatUnreadBadge from "@/modules/chat/shared/components/ChatUnreadBadge";
import { useNotifications } from "@/modules/notifications/shared/context";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const DRAWER_WIDTH = 240;
const COLLAPSED_WIDTH = 64;

// Brand colors from logo
const GREEN_DARK = "#10453f";   // dark forest green (logo text)
const GREEN_MID  = "#6ad39c";   // mint green (logo circle accents)
const GREEN_VIVID = "#52e899";  // bright green (logo "ai")

// Light sidebar palette
const BG      = "#ffffff";
const BG_TOP  = "#F7FBF9";
const BORDER  = "#E5E7EB";
const ICO_CLR = "#6B7280";
const TXT_CLR = "#374151";
const HOVER_BG  = "rgba(106,211,156,0.10)";
const HOVER_TXT = GREEN_DARK;
const LABEL_C   = "#9CA3AF";
const ACTIVE_BG  = "rgba(82,232,153,0.13)";
const ACTIVE_TXT = GREEN_DARK;
const ACTIVE_ICO = GREEN_DARK;

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const handleLogout = useLogout("/signin");

  const [loggingOut, setLoggingOut] = useState(false);

  const handleGoHome = useCallback(() => {
    if (router.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    router.push("/");
  }, [router]);

  const profile           = useSelector((state: RootState) => state.user.connectedUser.profile);
  const user              = useSelector((state: RootState) => state.user.connectedUser.user);
  const companyMembership = useSelector((state: RootState) => state.user.connectedUser.companyMembership);
  const planLimits        = useSelector((state: RootState) => state.user.connectedUser.planLimits);
  const combinedDetails   = useSelector(selectCombinedDetails);
  const employeePermissions = useSelector(selectEmployeePermissions);

  // Derive the badge label: prefer paid active plans from combined data, fall back to planLimits
  const activePlanLabel = React.useMemo(() => {
    if (combinedDetails?.subscriptions?.length) {
      const paid = combinedDetails.subscriptions.filter((s) => s.planName !== "Trial");
      if (paid.length > 1) return t("sidebar.plan.count_plans", { count: paid.length });
      if (paid.length === 1) return paid[0].planName;
      // Only trial
      return combinedDetails.subscriptions[0]?.planName ?? null;
    }
    return (planLimits as any)?.name ?? null;
  }, [combinedDetails, planLimits, t]);

  const isEmployee  = user?.role === "Employee";
  const companyName = companyMembership?.company?.profile?.companyDetails?.name
    || companyMembership?.company?.username
    || null;

  // Fetch permissions on reload if not yet in store
  useEffect(() => {
    if (isEmployee && !employeePermissions && user?._id) {
      dispatch(fetchEmployeePermissions(user._id));
    }
  }, [isEmployee, employeePermissions, user?._id]);

  // Keep plan badge up-to-date for company users
  useEffect(() => {
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
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}images/Users/${profile.user_image}`
    : null;

  const drawerWidth  = collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH;
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
      <Link key={item.id} href={item.href} passHref style={{ textDecoration: "none" }}>
        <Box
          data-tour={`nav-${item.id}`}
          sx={{
            display: "flex", alignItems: "center",
            gap: isCollapsed ? 0 : 1.25,
            px: isCollapsed ? 0 : 1.25,
            py: isCollapsed ? 0 : 0.875,
            height: isCollapsed ? 42 : "auto",
            borderRadius: "9px",
            justifyContent: isCollapsed ? "center" : "flex-start",
            cursor: "pointer", transition: "all 0.12s", position: "relative",
            bgcolor: isActive ? ACTIVE_BG : "transparent",
            color: isActive ? ACTIVE_TXT : TXT_CLR,
            "&:hover": {
              bgcolor: isActive ? ACTIVE_BG : HOVER_BG,
              color: isActive ? ACTIVE_TXT : HOVER_TXT,
              "& .nav-icon": { color: isActive ? ACTIVE_ICO : HOVER_TXT },
            },
          }}
        >
          {isActive && (
            <Box sx={{ position: "absolute", left: 0, top: "20%", bottom: "20%", width: 3, borderRadius: "0 3px 3px 0", bgcolor: GREEN_VIVID }} />
          )}
          <Box className="nav-icon" sx={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: isCollapsed ? 38 : 28, height: isCollapsed ? 38 : 28,
            borderRadius: "8px", flexShrink: 0,
            color: isActive ? ACTIVE_ICO : ICO_CLR, transition: "color 0.12s",
          }}>
            <item.icon sx={{ fontSize: isCollapsed ? 18 : 16 }} />
          </Box>
          {!isCollapsed && (
            <Typography sx={{ fontSize: { md: "13px", lg: "14.5px", xl: "15.5px" }, fontWeight: isActive ? 600 : 500, color: "inherit", lineHeight: 1, flex: 1 }}>
              {translatedLabel}
            </Typography>
          )}
          {!isCollapsed && unreadCount > 0 && (
            <ChatUnreadBadge count={unreadCount} />
          )}
        </Box>
      </Link>
    );
    return isCollapsed ? (
      <Tooltip key={item.id} title={translatedLabel} placement="right" arrow><span>{btn}</span></Tooltip>
    ) : btn;
  };

  const content = (mobile = false) => {
    const isCollapsed = collapsed && !mobile;
    const planTooltipDateLocale = i18n.language?.startsWith("fr") ? "fr-FR" : "en-US";

    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          bgcolor: BG,
        }}
      >
        {/* ── Logo bar ── */}
        <Box
          sx={{
            height: 64,
            px: isCollapsed ? 0 : 2,
            display: "flex",
            alignItems: "center",
            justifyContent: isCollapsed ? "center" : "space-between",
            bgcolor: BG_TOP,
            borderBottom: `1px solid ${BORDER}`,
            flexShrink: 0,
          }}
        >
          {/* Logo — only visible when expanded */}
          {!isCollapsed && (
            <Box
              component="img"
              src="/images/home/logo.svg"
              alt="TalentAI"
              onClick={handleGoHome}
              sx={{ height: 32, cursor: "pointer" }}
            />
          )}

          {/* Collapse toggle */}
          {!mobile && !isCollapsed && (
            <Tooltip title={t("sidebar.collapse")} placement="right">
              <IconButton
                onClick={handleToggle}
                size="small"
                sx={{
                  width: 26,
                  height: 26,
                  borderRadius: "7px",
                  bgcolor: "#F3F4F6",
                  color: ICO_CLR,
                  border: `1px solid ${BORDER}`,
                  "&:hover": { bgcolor: HOVER_BG, color: HOVER_TXT },
                  transition: "all 0.15s",
                }}
              >
                <ChevronLeftOutlined sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
          )}

          {/* Expand float */}
          {!mobile && isCollapsed && (
            <Tooltip title={t("sidebar.expand")} placement="right">
              <IconButton
                onClick={handleToggle}
                size="small"
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: "8px",
                  bgcolor: "#F3F4F6",
                  color: ICO_CLR,
                  border: `1px solid ${BORDER}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  "&:hover": {
                    bgcolor: HOVER_BG,
                    color: HOVER_TXT,
                  },
                  transition: "all 0.15s",
                }}
              >
                <ChevronRightOutlined sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          )}

          {mobile && (
            <IconButton
              onClick={onCloseMobile}
              size="small"
              sx={{ color: ICO_CLR }}
            >
              <CloseOutlined sx={{ fontSize: 17 }} />
            </IconButton>
          )}
        </Box>

        {/* ── Nav ── */}
        <Box sx={{
          flex: 1, overflowY: "auto", py: 2, px: 1,
          scrollbarWidth: "thin",
          scrollbarColor: `#D1D5DB transparent`,
          "&::-webkit-scrollbar": { width: 4 },
          "&::-webkit-scrollbar-track": { background: "transparent" },
          "&::-webkit-scrollbar-thumb": { background: "#D1D5DB", borderRadius: 4, "&:hover": { background: "#9CA3AF" } },
        }}>

          {/* ── Company nav ── */}
          {!isEmployee && GROUPS.map((group, gi) => {
            const items = navigation.filter((i) => group.ids.includes(i.id));
            if (items.length === 0) return null;

            return (
              <Box key={group.groupKey || gi} sx={{ mb: 1.5 }}>
                {!isCollapsed && (
                  <Typography sx={{
                    px: 1.25, pt: gi === 0 ? 0 : 0.5, pb: 0.5,
                    fontSize: "9px", fontWeight: 700, color: LABEL_C,
                    textTransform: "uppercase", letterSpacing: "0.14em",
                  }}>
                    {t(`sidebar.groups.${group.groupKey}`)}
                  </Typography>
                )}
                {gi > 0 && isCollapsed && (
                  <Box sx={{ mx: "auto", mb: 1.5, width: 24, height: "1px", bgcolor: "#E5E7EB" }} />
                )}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
                  {items.map((item) => renderNavItem(item, isCollapsed))}
                </Box>
              </Box>
            );
          })}

          {/* ── Employee nav ── */}
          {isEmployee && activeEmployeeGroups.map((group, gi) => (
            <Box key={group.group || gi} sx={{ mb: 1.5 }}>
              {group.group && !isCollapsed && (
                <Typography sx={{
                  px: 1.25, pt: gi === 0 ? 0 : 0.5, pb: 0.5,
                  fontSize: "9px", fontWeight: 700, color: LABEL_C,
                  textTransform: "uppercase", letterSpacing: "0.14em",
                }}>
                  {t(`sidebar.groups.${group.group.toLowerCase()}`, { defaultValue: group.group })}
                </Typography>
              )}
              {gi > 0 && isCollapsed && (
                <Box sx={{ mx: "auto", mb: 1.5, width: 24, height: "1px", bgcolor: "#E5E7EB" }} />
              )}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
                {group.items.map((item) => renderNavItem(item, isCollapsed))}
              </Box>
            </Box>
          ))}

        </Box>

        {/* ── Footer ── */}
        <Box
          sx={{
            px: 1,
            pb: 1.5,
            pt: 1.25,
            borderTop: `1px solid ${BORDER}`,
            bgcolor: BG_TOP,
            flexShrink: 0,
          }}
        >
          <Box
            onClick={() => router.push(settingsHref)}
            sx={{
              display: "flex", alignItems: "center",
              gap: isCollapsed ? 0 : 1,
              px: isCollapsed ? 0 : 1, py: 0.75,
              height: isCollapsed ? 42 : "auto",
              borderRadius: "9px", cursor: "pointer",
              justifyContent: isCollapsed ? "center" : "flex-start",
              transition: "all 0.12s",
              "&:hover": { bgcolor: HOVER_BG },
            }}
          >
            <Avatar
              src={avatarUrl ?? undefined}
              sx={{ bgcolor: GREEN_DARK, width: 28, height: 28, fontSize: "11px", fontWeight: 700, flexShrink: 0 }}
            >
              {displayInitial}
            </Avatar>

            {!isCollapsed && (
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap" }}>
                  <Typography sx={{ fontSize: "12.5px", fontWeight: 600, color: "#111827", lineHeight: 1.35, wordBreak: "break-word" }}>
                    {displayName}
                  </Typography>
                  {activePlanLabel && (
                    <Box
                      onClick={(e) => { e.stopPropagation(); router.push("/company/plans"); }}
                      sx={{
                        position: "relative", display: "inline-flex", flexShrink: 0,
                        "& .plan-tooltip": { opacity: 0, pointerEvents: "none", transition: "opacity 0.15s" },
                        "&:hover .plan-tooltip": { opacity: 1, pointerEvents: "auto" },
                      }}
                    >
                      {/* Badge */}
                      <Box sx={{
                        display: "inline-flex", alignItems: "center",
                        px: 0.75, py: 0.15, borderRadius: "4px",
                        bgcolor: `rgba(82,232,153,0.12)`, border: `1px solid rgba(82,232,153,0.35)`,
                        cursor: "pointer", transition: "all 0.15s",
                        "&:hover": { bgcolor: `rgba(82,232,153,0.22)`, border: `1px solid rgba(82,232,153,0.6)` },
                      }}>
                        <Typography sx={{ fontSize: "9px", fontWeight: 700, color: GREEN_DARK, letterSpacing: "0.04em", lineHeight: 1.4 }}>
                          {activePlanLabel}
                        </Typography>
                      </Box>

                      {/* Pure-CSS tooltip — pb bridges the gap so hover doesn't drop */}
                      <Box className="plan-tooltip" sx={{
                        position: "absolute", bottom: "100%", left: 0,
                        zIndex: 9999, pb: "8px",
                      }}>
                        <Box sx={{
                          minWidth: 200,
                          bgcolor: "#fff", border: `1px solid ${BORDER}`,
                          borderRadius: "10px", overflow: "hidden",
                          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                        }}>
                          <Box sx={{ px: 1.75, pt: 1.25, pb: 0.75 }}>
                            <Typography sx={{ fontSize: "9px", fontWeight: 700, color: "#6B7280", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                              {t("sidebar.plan.active_plans")}
                            </Typography>
                          </Box>
                          <Divider sx={{ borderColor: BORDER }} />
                          <Box sx={{ py: 0.75 }}>
                            {combinedDetails?.subscriptions?.length
                              ? combinedDetails.subscriptions
                                  .filter((s) => s.planName !== "Trial")
                                  .map((s) => {
                                    const col = ({ Standard: "#0D9488", Gold: "#7C3AED", Platinum: "#0891B2", Diamond: "#D97706" } as Record<string, string>)[s.planName] ?? GREEN_MID;
                                    const exp = new Date(s.endDate).toLocaleDateString(planTooltipDateLocale, { month: "short", day: "numeric", year: "numeric" });
                                    return (
                                      <Box key={s.id} sx={{ display: "flex", alignItems: "center", gap: 1, px: 1.75, py: 0.6 }}>
                                        <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: col, flexShrink: 0 }} />
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                          <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#111827", lineHeight: 1.3 }}>
                                            {s.planName}
                                          </Typography>
                                          <Typography sx={{ fontSize: "9.5px", color: "#6B7280", lineHeight: 1.3 }}>
                                            {t("sidebar.plan.expires", { date: exp })}
                                          </Typography>
                                        </Box>
                                      </Box>
                                    );
                                  })
                              : (
                                <Box sx={{ px: 1.75, py: 0.6 }}>
                                  <Typography sx={{ fontSize: "11px", color: "#6B7280" }}>{t("sidebar.plan.trial")}</Typography>
                                </Box>
                              )
                            }
                          </Box>
                          <Divider sx={{ borderColor: BORDER }} />
                          <Box sx={{ px: 1.75, py: 1 }}>
                            <Typography sx={{ fontSize: "10px", fontWeight: 600, color: GREEN_DARK }}>
                              {t("sidebar.plan.view_all")}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  )}
                </Box>
                {displayEmail && (
                  <Typography sx={{ fontSize: "10px", color: TXT_CLR, lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {displayEmail}
                  </Typography>
                )}
              </Box>
            )}

            {!isCollapsed && (
              <Tooltip title={t("sidebar.sign_out")}>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLogout();
                  }}
                  sx={{
                    color: ICO_CLR,
                    width: 32,
                    height: 32,
                    borderRadius: "8px",
                    flexShrink: 0,
                    "&:hover": {
                      bgcolor: "rgba(239,68,68,0.15)",
                      color: "#F87171",
                    },
                    transition: "all 0.15s",
                  }}
                >
                  <LogoutOutlined sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <>
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              transition: "width 0.22s cubic-bezier(0.4,0,0.2,1)",
              overflowX: "hidden",
              borderRight: `1px solid ${BORDER}`,
              boxShadow: "2px 0 12px rgba(0,0,0,0.06)",
              bgcolor: BG,
            },
          }}
        >
          {content(false)}
        </Drawer>
      )}
      {isMobile && (
        <Drawer
          open={mobileOpen}
          onClose={onCloseMobile}
          sx={{
            "& .MuiDrawer-paper": {
              width: DRAWER_WIDTH,
              overflowX: "hidden",
              borderRight: `1px solid ${BORDER}`,
              bgcolor: BG,
            },
          }}
        >
          {content(true)}
        </Drawer>
      )}
      <LogoutProgressModal open={loggingOut} />
    </>
  );
};

export default Sidebar;
