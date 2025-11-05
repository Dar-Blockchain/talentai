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
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { useDispatch } from "react-redux";
import { getMyProfile, selectProfile } from "@/store/slices/profileSlice";
import dynamic from "next/dynamic";
import { setUserType } from "@/store/slices/userSlice";
import UserAvatar from "./UserAvatar";

type NavItem = {
  label: string;
  id?: string;
  href?: string;
};

const getNavItems = (type: string): NavItem[] => {
  if (type === "company") {
    // For companies (employers)
    return [
      { label: "Features", id: "features" },
      { label: "Solutions", id: "solutions" },
      { label: "Contact", id: "contact" },
      { label: "Are You a Job Seeker?", href: "/home/candidate/" },
    ];
  }

  if (type === "jobseeker") {
    // For candidates (job seekers)
    return [
      { label: "Home", href: "/home/candidate/" },
      { label: "Find Jobs", href: "/jobs/" },
      { label: "About Us", id: "about" },
      { label: "Are You Hiring?", href: "/home/company/" },
    ];
  }

  // Default (if type not specified)
  return [
    { label: "Features", id: "features" },
    { label: "Solutions", id: "solutions" },
    { label: "Contact", id: "contact" },
  ];
};

type HeaderProps = {
  logo: string; // path to the logo image
  type: string; // "company" or "jobseeker"
  color: string; // "company" or "jobseeker"
  link: string;
};

const Header = ({ logo, type, color, link }: HeaderProps) => {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const { profile } = useSelector(selectProfile);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (type) {
      localStorage.setItem("userType", type);
      dispatch(setUserType(type as "company" | "jobseeker"));
    }
  }, [type, dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getMyProfile());
      console.log("profile", profile);
    }
  }, [isAuthenticated, dispatch]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

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
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          mb: 3,
        }}
      >
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

          return (
            <ListItem
              key={item.id || item.href}
              component={Link}
              href={item.href || `/#${item.id}`}
              onClick={handleDrawerToggle}
              sx={{
                textDecoration: "none",
                borderRadius: 2,
                mb: 1,
                "&:hover": {
                  backgroundColor: "#f9fafb",
                },
              }}
            >
              <ListItemText
                primary={item.label}
                sx={{
                  textAlign: "start",
                  "& .MuiTypography-root": {
                    fontWeight: isLast ? 600 : 500,
                    fontSize: { xs: "14px", sm: "16px" },
                    color: isLast ? lastItemColor : "#000",
                    transition: "all 0.2s",
                  },
                }}
              />
            </ListItem>
          );
        })}
      </List>

      {/* Bottom Section - Auth Buttons or UserAvatar */}
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
                boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
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
                  borderColor: "#D1D5DB",
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

  if (!mounted) {
    return null;
  }

  return (
    <>
      <AppBar
        position="static"
        elevation={0}
        sx={{
          backgroundColor: "#FDFEFE",
          color: "#000",
          boxShadow: "none",
          pt: { xs: 1, md: 2 },
          pb: { xs: 1, md: 2 }
        }}
      >
        <Box sx={{ maxWidth: 1400, mx: "auto", width: "100%", px: { xs: 2, sm: 3, md: 4 } }}>
          <Toolbar sx={{ justifyContent: "space-between", px: 0, gap: 1, minHeight: { xs: '56px', md: '64px' } }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, md: 2 } }}>
              {/* Logo on the left */}
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
                    height: { xs: 36, md: 44 },
                    width: { xs: 134, md: 162 },
                  }}
                  onClick={() =>
                    router.push(type === "company" ? "/" : "/home/candidate")
                  }
                >
                  <Box
                    component="img"
                    src={logo}
                    alt="TalentAI Logo"
                    sx={{ height: { xs: 20, md: 25 } }}
                  />
                </Box>
              </Box>

              {/* Navigation in center */}
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
                    const isSelected =
                      router.asPath === item.href ||
                      router.asPath === `/#${item.id}`;

                    // Determine color for the last item based on type
                    const lastItemColor =
                      type === "jobseeker"
                        ? "#4DD9A3"
                        : type === "company"
                        ? "#BD85FF"
                        : "#180D00";

                    return (
                      <React.Fragment key={item.id || item.href}>
                        {/* Add separator bar before the last item */}
                        {isLast && (
                          <Box
                            sx={{
                              width: "1px",
                              height: "16px",
                              bgcolor: "#E5E7EB",
                              mx: 1,
                            }}
                          />
                        )}

                        <Link href={item.href || `/#${item.id}`} passHref>
                          <Box
                            sx={{
                              cursor: "pointer",
                              fontWeight: isLast ? 600 : isSelected ? 600 : 400,
                              fontSize: "14px",
                              transition: "all 0.2s",
                              color: isLast
                                ? lastItemColor
                                : isSelected
                                ? "#180D00"
                                : "#878786",
                              "&:hover": {
                                color: isLast ? lastItemColor : "#180D00",
                                fontWeight: 600,
                              },
                            }}
                          >
                            {item.label}
                          </Box>
                        </Link>
                      </React.Fragment>
                    );
                  })}
                </Stack>
              )}
            </Box>

            {/* Action buttons on the right */}
            {!isMobile ? (
              // Show UserAvatar for authenticated users, buttons for others
              isAuthenticated ? (
                <UserAvatar />
              ) : (
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="outlined"
                    onClick={() => router.push("/signin")}
                    sx={{
                      backgroundColor: "#ffffff",
                      color: type === "jobseeker" ? "#BD85FF" : "#4DD9A3",
                      borderRadius: 999,
                      border: "none",
                      textTransform: "none",
                      px: 2,
                      py: 0.75,
                      fontSize: "14px",
                      fontWeight: 600,
                      boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
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
                    onClick={() => router.push("/demo")}
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
                      boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
                      "&:hover": {
                        backgroundColor: "#f9fafb",
                        color: "#111827",
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
                  "&:hover": {
                    backgroundColor: "#f9fafb",
                  },
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
          '& .MuiDrawer-paper': {
            width: { xs: '75%', sm: '300px' },
            maxWidth: '300px',
          }
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default dynamic(() => Promise.resolve(Header), { ssr: false });
