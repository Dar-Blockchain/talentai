import React, { useEffect, useState } from "react";
import {
  AppBar,
  Box,
  Button,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Toolbar,
  useMediaQuery,
  useTheme,
  Stack,
  Typography,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  Avatar,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import Badge from "@mui/material/Badge";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import {
  clearProfile,
  getMyProfile,
  selectProfile,
} from "@/store/slices/profileSlice";
import dynamic from "next/dynamic";
import { setUserType } from "@/store/slices/userSlice";
import UserAvatar from "../UserAvatar";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import { logout } from "@/store/slices/authSlice";
import Cookies from "js-cookie";
import { signOut } from "next-auth/react";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useNotifications } from "@/contexts/NotificationContext";
import NotificationDropdown from "../NotificationDropdown";

type NavItem = {
  label: string;
  id?: string;
  href?: string;
};
function stringToColor(string: string) {
  let hash = 0;
  let i;

  /* eslint-disable no-bitwise */
  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = "#";

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  /* eslint-enable no-bitwise */

  return color;
}

function stringAvatar(name: string) {
  const parts = name.trim().split(" ");
  const firstInitial = parts[0]?.[0]?.toUpperCase() ?? "";
  const secondInitial = parts[1]?.[0]?.toUpperCase() ?? "";

  return {
    sx: {
      bgcolor: stringToColor(name),
    },
    children: `${firstInitial}${secondInitial}`,
  };
}

const getNavItems = (type: string): NavItem[] => {
  if (type === "company") {
    return [
      { label: "Features", id: "features" },
      { label: "How It Works", id: "howitworks" },
      { label: "Are You a Job Seeker?", href: "/home/candidate/" },
    ];
  }
  if (type === "jobseeker") {
    return [
      { label: "Find Jobs", href: "/jobs/" },
      { label: "How It Works", id: "howitworks" },
      { label: "Are You Hiring?", href: "/home/company/" },
    ];
  }
  return [
    { label: "Features", id: "features" },
    { label: "Solutions", id: "solutions" },
    { label: "Contact", id: "contact" },
  ];
};

type HeaderProps = {
  logo: string;
  type: string;
  color?: string;
  link?: string;
};

const Header = ({ logo, type }: HeaderProps) => {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const { profile } = useSelector(selectProfile);
  const [mounted, setMounted] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState<null | HTMLElement>(null);
  const notificationOpen = Boolean(notificationAnchorEl);

  // Notification context - wrapped in try/catch for when provider not available
  let unreadCount = 0;
  let notificationsList: any[] = [];
  let markAsRead = (id: string) => { };
  let markAllAsRead = () => { };
  let archive = (id: string) => { };
  try {
    const notifications = useNotifications();
    unreadCount = notifications.unreadCount;
    notificationsList = notifications.notifications;
    markAsRead = notifications.markAsRead;
    markAllAsRead = notifications.markAllAsRead;
    archive = notifications.archive;
  } catch (e) {
    // NotificationProvider not available
  }

  const handleNotificationClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleViewAllNotifications = () => {
    setNotificationAnchorEl(null);
    router.push('/settings/profile?tab=notifications');
  };

  const handleLogout = async () => {
    try {
      // Clear Redux state FIRST to prevent components from trying to fetch
      dispatch(clearProfile());
      dispatch(logout());

      // Then clear the token and storage
      localStorage.removeItem("api_token");
      Cookies.remove("api_token", { path: "/" });
      localStorage.clear();

      // Clear all other cookies
      Object.keys(Cookies.get()).forEach((cookieName) => {
        Cookies.remove(cookieName, { path: "/" });
      });

      // Sign out from NextAuth (don't await to make redirect faster)
      signOut({ redirect: false }).catch(console.error);

      // Redirect immediately (don't wait for async operations)
      window.location.href = "/signin";
    } catch (error) {
      console.error("Logout failed:", error);
      // Even on error, redirect to signin
      window.location.href = "/signin";
    }
  };
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (type) {
      localStorage.setItem("userType", type);
      dispatch(setUserType(type as "company" | "jobseeker"));
    }
  }, [type, dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getMyProfile());
    }
  }, [isAuthenticated, dispatch]);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const handleNavClick = (item: NavItem) => {
    if (item.id) {
      const element = document.getElementById(item.id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      } else if (router.pathname.includes("/home")) {
        router.push(`#${item.id}`);
      }
    } else if (item.href) {
      router.push(item.href);
    }
    if (isMobile) handleDrawerToggle();
  };

  const isActive = (item: NavItem) => {
    if (item.href) {
      return router.pathname === item.href;
    }
    if (item.id && typeof window !== "undefined") {
      return window.location.hash === `#${item.id}`;
    }
    return false;
  };

  if (!mounted) return null;

  const drawer = (
    <Box
      sx={{
        background: "#fff",
        width: "100%",
        height: "100%",
        color: "#000",
        textAlign: "center",
        p: { xs: 2, sm: 3 },
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Logo */}
      <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
        <Box
          sx={{
            backgroundColor: "white",
            borderRadius: "50px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            height: { xs: 40, sm: 48 },
            width: { xs: 138, sm: 166 },
            boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
          }}
        >
          <Box
            sx={{
              backgroundColor: "#141415",
              borderRadius: "50px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              height: { xs: 36, sm: 44 },
              width: { xs: 134, sm: 162 },
            }}
            onClick={() => {
              router.push(type === "company" ? "/" : "/home/candidate");
              handleDrawerToggle();
            }}
          >
            <Box
              component="img"
              src={logo}
              alt="TalentAI Logo"
              sx={{ height: { xs: 20, sm: 25 } }}
            />
          </Box>
        </Box>
      </Box>

      {/* Navigation Links */}
      <List sx={{ flex: 1 }}>
        {getNavItems(type).map((item, index) => {
          const isLast = index === getNavItems(type).length - 1;
          const lastItemColor =
            type === "jobseeker"
              ? "#4DD9A3"
              : type === "company"
                ? "#BD85FF"
                : "#180D00";
          const active = isActive(item);

          return (
            <ListItem
              key={item.id || item.href}
              onClick={() => handleNavClick(item)}
              sx={{
                textDecoration: "none",
                borderRadius: 2,
                mb: 1,
                cursor: "pointer",
                "&:hover": { backgroundColor: "#f9fafb" },
              }}
            >
              <ListItemText
                primary={item.label}
                sx={{
                  textAlign: "start",
                  "& .MuiTypography-root": {
                    fontWeight: active ? 700 : isLast ? 600 : 500,
                    fontSize: { xs: "14px", sm: "16px" },
                    color: active ? "#000" : isLast ? lastItemColor : "#000",
                    transition: "all 0.2s",
                  },
                }}
              />
            </ListItem>
          );
        })}
      </List>

      {/* Auth Section */}
      <Box sx={{ mt: "auto", pt: 2, borderTop: "1px solid #E5E7EB" }}>
        {isAuthenticated ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
            <UserAvatar />
          </Box>
        ) : (
          <Stack spacing={2}>
            <Button
              variant="contained"
              onClick={() => {
                router.push("/signin");
                handleDrawerToggle();
              }}
              sx={{
                backgroundColor: type === "jobseeker" ? "#BD85FF" : "#4DD9A3",
                color: "#ffffff",
                borderRadius: 999,
                textTransform: "none",
                py: 1.5,
                fontSize: { xs: "14px", sm: "16px" },
                fontWeight: 600,
                "&:hover": {
                  backgroundColor: type === "jobseeker" ? "#9c5fd4" : "#3bc98a",
                },
              }}
            >
              Login
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                router.push("/demo");
                handleDrawerToggle();
              }}
              sx={{
                color: "#383A3D",
                borderColor: "#E5E7EB",
                borderRadius: 999,
                textTransform: "none",
                py: 1.5,
                fontSize: { xs: "14px", sm: "16px" },
                fontWeight: 600,
                "&:hover": {
                  backgroundColor: "#f9fafb",
                },
              }}
            >
              {type === "jobseeker" ? "Sign-up" : "Watch Demo"}
            </Button>
          </Stack>
        )}
      </Box>
    </Box>
  );

  return (
    <>
      <AppBar
        position="static"
        elevation={0}
        sx={{
          backgroundColor: type === "company" ? "#eff0f0" : "#FDFEFE",
          color: "#000",
          boxShadow: "none",
          pt: { xs: 1, md: 2 },
          pb: { xs: 1, md: 2 },
        }}
      >
        <Box
          sx={{
            maxWidth: 1400,
            mx: "auto",
            width: "100%",
            px: { xs: 2, sm: 3, md: 4 },
          }}
        >
          <Toolbar
            sx={{
              justifyContent: "space-between",
              px: 0,
              gap: 1,
              minHeight: { xs: "56px", md: "64px" },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              {/* Logo */}
              <Box
                sx={{
                  backgroundColor: "white",
                  borderRadius: "50px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: { xs: 40, md: 48 },
                  width: { xs: 138, md: 166 },
                  boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
                  cursor: "pointer",
                }}
                onClick={() =>
                  router.push(type === "company" ? "/" : "/home/candidate")
                }
              >
                <Box
                  sx={{
                    backgroundColor: "#141415",
                    borderRadius: "50px",
                    height: { xs: 36, md: 44 },
                    width: { xs: 134, md: 162 },
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Box
                    component="img"
                    src={logo}
                    alt="TalentAI Logo"
                    sx={{ height: { xs: 20, md: 25 } }}
                  />
                </Box>
              </Box>

              {/* Desktop Navigation */}
              {!isMobile && (
                <Stack
                  direction="row"
                  spacing={4}
                  alignItems="center"
                  sx={{
                    px: 3,
                    py: 1.5,
                    borderRadius: 999,
                    backgroundColor: "#ffffff",
                    boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
                  }}
                >
                  {getNavItems(type).map((item, index) => {
                    const isLast = index === getNavItems(type).length - 1;
                    const lastItemColor =
                      type === "jobseeker"
                        ? "#4DD9A3"
                        : type === "company"
                          ? "#BD85FF"
                          : "#180D00";
                    const active = isActive(item);

                    return (
                      <Box
                        key={item.id || item.href}
                        onClick={() => handleNavClick(item)}
                        sx={{
                          cursor: "pointer",
                          fontWeight: active ? 700 : isLast ? 600 : 500,
                          fontSize: "14px",
                          color: active
                            ? "#000"
                            : isLast
                              ? lastItemColor
                              : "#878786",
                          transition: "all 0.2s",
                          "&:hover": {
                            color: active
                              ? "#000"
                              : isLast
                                ? lastItemColor
                                : "#180D00",
                            fontWeight: 600,
                          },
                        }}
                      >
                        {item.label}
                      </Box>
                    );
                  })}
                </Stack>
              )}
            </Box>

            {/* Right Actions */}
            {!isMobile ? (
              isAuthenticated && profile ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  {/* Notification Bell - Only for Candidates */}
                  {profile.type === "Candidate" && (
                    <>
                      <IconButton
                        onClick={handleNotificationClick}
                        sx={{
                          color: '#000',
                          '&:hover': {
                            backgroundColor: '#f5f5f5',
                          },
                        }}
                      >
                        <Badge
                          badgeContent={unreadCount}
                          color="error"
                          sx={{
                            '& .MuiBadge-badge': {
                              backgroundColor: '#f5576c',
                              color: 'white',
                              fontWeight: 700,
                              fontSize: '0.75rem',
                            },
                          }}
                        >
                          <NotificationsIcon />
                        </Badge>
                      </IconButton>

                      {/* Notification Dropdown */}
                      <NotificationDropdown
                        anchorEl={notificationAnchorEl}
                        open={notificationOpen}
                        onClose={handleNotificationClose}
                        notifications={notificationsList}
                        onMarkAsRead={markAsRead}
                        onMarkAllAsRead={markAllAsRead}
                        onViewAll={handleViewAllNotifications}
                        onArchive={archive}
                      />
                    </>
                  )}

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      cursor: "pointer",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      transition: "background-color 0.2s",
                      "&:hover": {
                        backgroundColor: "#f5f5f5",
                      },
                    }}
                    onClick={handleClick}
                  >
                    {/* User Avatar */}
                    <Avatar
                      src={
                        profile?.user_image || profile?.userId?.user_image
                          ? `${process.env.NEXT_PUBLIC_API_BASE_URL}images/Users/${profile?.user_image || profile?.userId?.user_image}`
                          : undefined
                      }
                      {...stringAvatar(profile?.userId?.username || "User")}
                    />

                    {/* User Name */}
                    <Typography
                      sx={{
                        fontWeight: 500,
                        fontSize: "1rem",
                        color: "#000000",
                        fontFamily: "Arial, sans-serif",
                      }}
                    >
                      {profile?.userId?.username || "User"}
                    </Typography>

                    {/* Dropdown Arrow */}
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "black",
                        transform: open ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.2s ease-in-out",
                      }}
                    >
                      <KeyboardArrowDownIcon fontSize="small" />
                    </Box>
                  </Box>

                  {/* Dropdown Menu */}
                  <Menu
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    PaperProps={{
                      elevation: 0,
                      sx: {
                        mt: 1.5,
                        minWidth: 270,
                        borderRadius: 3,
                        border: "1px solid rgba(0,0,0,0.05)",
                        backdropFilter: "blur(14px)",
                        background: "rgba(255, 255, 255, 0.9)",
                        boxShadow:
                          "0px 6px 18px rgba(0,0,0,0.08), 0px 12px 28px rgba(0,0,0,0.06)",
                        overflow: "hidden",
                        transition: "all 0.3s ease",
                        animation: "fadeIn 0.25s ease-in-out",
                        "@keyframes fadeIn": {
                          from: { opacity: 0, transform: "translateY(-6px)" },
                          to: { opacity: 1, transform: "translateY(0)" },
                        },
                        '& .MuiList-root': {
                          padding: 0, // ✅ Removes default menu padding
                        },
                        "& .MuiMenuItem-root": {
                          px: 2.5,
                          my: 1,
                          py: 1.4,
                          fontSize: "0.95rem",
                          fontWeight: 500,
                          color: "#1f2937",
                          borderRadius: 2,
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          transition: "all 0.25s ease",
                          "& svg": {
                            fontSize: "1.3rem",
                            color: "#6b7280",
                            transition: "color 0.2s ease, transform 0.2s ease",
                          },
                          "&:hover": {
                            background:
                              "linear-gradient(90deg, rgba(240,240,255,0.9) 0%, rgba(225,225,255,0.8) 100%)",
                            transform: "translateX(4px)",
                            "& svg": {
                              color: "#4F46E5",
                              transform: "scale(1.1)",
                            },
                          },
                        },
                      },
                    }}
                    transformOrigin={{ horizontal: "right", vertical: "top" }}
                    anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                  >
                    {/* Header */}
                    <Box
                      sx={{
                        px: 2.2,
                        py: 1.8,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        borderBottom: "1px solid rgba(0,0,0,0.05)",
                        background: "linear-gradient(135deg, #f9fafb 0%, #eef2ff 100%)",
                      }}
                    >
                      <Box sx={{ display: "flex", flexDirection: "column" }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 700,
                            fontSize: "0.95rem",
                            color: "#111827",
                            letterSpacing: "0.3px",
                          }}
                        >
                          {profile?.type === "Candidate"
                            ? "Candidate Account"
                            : "Company Account"}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#6b7280",
                            fontSize: "0.78rem",
                            mt: 0.3,
                          }}
                        >
                          Manage your profile and preferences
                        </Typography>
                      </Box>

                      {/* Profile Badge */}
                      <Box
                        sx={{
                          ml: 2,
                          px: 1.6,
                          py: 0.6,
                          borderRadius: "20px",
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          letterSpacing: "0.4px",
                          textTransform: "uppercase",
                          backgroundColor:
                            profile?.type !== "Candidate"
                              ? "rgba(139, 92, 246, 0.12)"
                              : "rgba(16, 185, 129, 0.12)",
                          color: profile?.type !== "Candidate" ? "#7C3AED" : "#059669",
                          boxShadow:
                            profile?.type !== "Candidate"
                              ? "0 0 4px rgba(124,58,237,0.2)"
                              : "0 0 4px rgba(5,150,105,0.2)",
                        }}
                      >
                        {profile?.type}
                      </Box>
                    </Box>

                    {/* Profile */}
                    <MenuItem
                      onClick={() =>
                        type === "company"
                          ? router.push("/dashboard/company")
                          : router.push("/dashboard/candidate")
                      }
                    >
                      <PersonIcon />
                      <ListItemText
                        primary="Profile"
                        primaryTypographyProps={{
                          fontWeight: 600,
                          fontSize: "0.93rem",
                        }}
                      />
                    </MenuItem>

                    {/* Divider */}
                    <Divider sx={{ my: 0.5, borderColor: "rgba(0,0,0,0.05)" }} />

                    {/* Logout */}
                    <MenuItem
                      onClick={handleLogout}
                      sx={{
                        color: "#b91c1c",
                        "& svg": { color: "#b91c1c !important" },
                        "&:hover": {
                          background:
                            "linear-gradient(90deg, rgba(254,226,226,0.7) 0%, rgba(254,202,202,0.4) 100%)",
                          transform: "translateX(4px)",
                        },
                      }}
                    >
                      <LogoutIcon />
                      <ListItemText
                        primary="Logout"
                        primaryTypographyProps={{
                          fontWeight: 700,
                          fontSize: "0.92rem",
                        }}
                      />
                    </MenuItem>
                  </Menu>


                </Box>
              ) : (
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="outlined"
                    onClick={() => router.push("/signin")}
                    sx={{
                      backgroundColor: "#ffffff",
                      color: type === "jobseeker" ? "#BD85FF" : "#4DD9A3",
                      border: "none",
                      borderRadius: 999,
                      textTransform: "none",
                      px: 2,
                      py: 0.75,
                      fontSize: "14px",
                      fontWeight: 600,
                      "&:hover": {
                        color: "white",
                        backgroundColor:
                          type === "jobseeker" ? "#BD85FF" : "#4DD9A3",
                      },
                    }}
                  >
                    Login
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => type === "jobseeker" ? router.push('/signin') : window.open('https://www.youtube.com/watch?v=_wGI7HxQQHU', '_blank')}
                    sx={{
                      backgroundColor: "#ffffff",
                      color: "#383A3D",
                      border: "none",
                      borderRadius: 999,
                      textTransform: "none",
                      px: 2,
                      py: 0.75,
                      fontSize: "14px",
                      fontWeight: 600,
                      "&:hover": {
                        backgroundColor: "#f9fafb",
                      },
                    }}
                  >
                    {type === "jobseeker" ? "Sign-up" : "Watch Demo"}
                  </Button>
                </Stack>
              )
            ) : (
              <IconButton
                color="inherit"
                edge="end"
                onClick={handleDrawerToggle}
                sx={{
                  backgroundColor: "#ffffff",
                  borderRadius: "50%",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
                  width: { xs: 40, sm: 48 },
                  height: { xs: 40, sm: 48 },
                }}
              >
                <MenuIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
              </IconButton>
            )}
          </Toolbar>
        </Box>
      </AppBar>

      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        sx={{
          "& .MuiDrawer-paper": {
            width: { xs: "75%", sm: "300px" },
            maxWidth: "300px",
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default dynamic(() => Promise.resolve(Header), { ssr: false });
