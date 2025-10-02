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
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import LogoutIcon from "@mui/icons-material/Logout";
import GoogleIcon from "@mui/icons-material/Google";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { useDispatch } from "react-redux";
import { getMyProfile, selectProfile } from "@/store/slices/profileSlice";
import dynamic from 'next/dynamic';
import { setUserType } from "@/store/slices/userSlice";
import UserAvatar from "./UserAvatar";

const navItems = [
  { label: "Features", id: "features" },
  { label: "Solutions", id: "solutions" },
  { label: "Pricing", id: "pricing" },
  { label: "Contact", id: "contact" },
];

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
  const { profile, loading, error } = useSelector(selectProfile);
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
      onClick={handleDrawerToggle}
      sx={{
        background: "#fff",
        width: "100%",
        height: "100%",
        color: "#000",
        textAlign: "center",
        p: 3,
      }}
    >
      <Box
        component="img"
        src={logo}
        alt="TalentAI Logo"
        sx={{ height: 32, mb: 2, cursor: 'pointer' }}
        onClick={() => router.push("/")}
      />
      <List>
        {navItems.map((item) => (
          <ListItem key={item.id}>
            <ListItemText
              primary={item.label}
              sx={{
                textAlign: "start",
                fontWeight: 500,
                color: "#000",
                transition: "all 0.1s",
                "&:hover": {
                  color: " #00FF9D",
                  fontWeight: "bold",
                },
              }}
            />
          </ListItem>
        ))}
        {/* Show UserAvatar in mobile drawer when authenticated */}
        {isAuthenticated && (
          <ListItem sx={{ justifyContent: "center", mt: 2 }}>
            <UserAvatar />
          </ListItem>
        )}
      </List>
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
        sx={{ backgroundColor: "transparent", color: "#000", boxShadow: 'none', pt: 2 }}
      >
        <Box sx={{ maxWidth: 1400, mx: 'auto', width: '100%' }}>
          <Toolbar sx={{ justifyContent: "space-between", px: 0, gap: 1 }}>
            {/* Logo on the left */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                bgcolor: '#000000',
                borderRadius: 5,
                px: 2,
                py: 1,
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: '#000000',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                }
              }}
              onClick={() => router.push(type === "company" ? '/' : '/home/candidate')}
            >
              <Box
                component="img"
                src="/images/home/TalentAiLogo.png"
                alt="TalentAI Logo"
                sx={{
                  height: 32,
                  width: 'auto',
                  objectFit: 'contain'
                }}
              />
            </Box>
            
            {/* Navigation in center */}
            {!isMobile && (
              <Stack direction="row" spacing={4} alignItems="center" sx={{
                px: 3,
                py: 1.5,
                borderRadius: 999,
                backgroundColor: '#ffffff',
                boxShadow: '0 4px 14px rgba(0,0,0,0.06)'
              }}>
                {navItems.map((item, index) => (
                  <React.Fragment key={item.id}>
                    <Link href={`/#${item.id}`} passHref>
                      <Box
                        sx={{
                          cursor: "pointer",
                          fontWeight: 500,
                          color: "#374151",
                          typography: "body1",
                          fontSize: '14px',
                          transition: "all 0.2s",
                          "&:hover": {
                            color: "#10B981",
                          },
                        }}
                      >
                        {item.label}
                      </Box>
                    </Link>
                    {index === 1 && (
                      <Box
                        sx={{
                          width: '1px',
                          height: '16px',
                          bgcolor: '#E5E7EB',
                          mx: 1
                        }}
                      />
                    )}
                  </React.Fragment>
                ))}
                <Typography
                  sx={{
                    cursor: 'pointer',
                    fontWeight: 500,
                    fontSize: '14px',
                    color: '#7C3AED',
                    transition: "all 0.2s",
                    "&:hover": {
                      color: '#5B21B6',
                    },
                  }}
                  onClick={() => router.push(type === "company" ? '/home/candidate' : '/')}
                >
                  {link}
                </Typography>
              </Stack>
            )}
          
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
                      backgroundColor: '#ffffff',
                      borderColor: '#10B981',
                      color: '#10B981',
                      borderRadius: 999,
                      textTransform: 'none',
                      px: 2,
                      py: 0.75,
                      fontSize: '14px',
                      fontWeight: 500,
                      boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
                      '&:hover': {
                        borderColor: '#059669',
                        color: '#059669',
                        backgroundColor: '#f0fdf4'
                      }
                    }}
                  >
                    Login
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => router.push("/demo")}
                    sx={{
                      backgroundColor: '#ffffff',
                      color: '#374151',
                      border: 'none',
                      borderRadius: 999,
                      textTransform: 'none',
                      px: 2,
                      py: 0.75,
                      fontSize: '14px',
                      fontWeight: 500,
                      boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
                      '&:hover': {
                        backgroundColor: '#f9fafb',
                        color: '#111827'
                      }
                    }}
                  >
                    Watch Demo
                  </Button>
              </Stack>
            )
          ) : (
            <IconButton color="inherit" edge="end" onClick={handleDrawerToggle}>
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
        </Box>
      </AppBar>

      <Drawer anchor="right" open={mobileOpen} onClose={handleDrawerToggle}>
        {drawer}
      </Drawer>
    </>
  );
};

export default dynamic(() => Promise.resolve(Header), { ssr: false });
