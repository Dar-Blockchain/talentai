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
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box
            component="img"
            src={type === "company" ? "/logo.svg" : "/logo-purple.svg"}
            alt="TalentAI Logo"
            sx={{ height: 32, cursor: 'pointer' }}
            onClick={() => router.push(type === "company" ? '/' : '/home/candidate')}
          />
          
          {!isMobile && (
            <Stack direction="row" spacing={4} alignItems="center" sx={{
              px: 2,
              py: 1,
              borderRadius: 999,
              backgroundColor: '#ffffff',
              boxShadow: '0 4px 14px rgba(0,0,0,0.06)'
            }}>
              {navItems.map((item) => (
                <Link href={`/#${item.id}`} key={item.id} passHref>
                  <Box
                    sx={{
                      cursor: "pointer",
                      fontWeight: 500,
                      color: "#000",
                      typography: "body1",
                      borderBottom: "2px solid transparent",
                      transition: "all 0.1s",
                      "&:hover": {
                        borderBottom: "4px solid #00FF9D",
                        fontWeight: "bold",
                      },
                    }}
                  >
                    {item.label}
                  </Box>
                </Link>
              ))}
            </Stack>
          )}
          
          <Typography
            sx={{
              cursor: 'pointer',
              fontFamily: 'Poppins',
              fontWeight: 500,
              fontSize: '14px',
              color: '#7C3AED',
              background: '#ffffff',
              borderRadius: 999,
              px: 2,
              py: 0.75,
              boxShadow: '0 4px 14px rgba(0,0,0,0.06)'
            }}
            onClick={() => router.push(type === "company" ? '/home/candidate' : '/')}
          >
            {link}
          </Typography>
          
          {!isMobile ? (
            // Show UserAvatar for authenticated users, Get Started button for others
            isAuthenticated ? (
              <UserAvatar />
            ) : (
              <Stack direction="row" spacing={2}>
                <Button
                  variant="outlined"
                  onClick={() => router.push("/signin")}
                  sx={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e5e7eb',
                    color: '#111827',
                    borderRadius: 999,
                    textTransform: 'none',
                    px: 2,
                    py: 0.75,
                    boxShadow: '0 4px 14px rgba(0,0,0,0.06)'
                  }}
                >
                  Login
                </Button>
                <Button
                  variant="contained"
                  onClick={() => router.push("/demo")}
                  sx={{
                    backgroundColor: '#ffffff',
                    color: '#111827',
                    borderRadius: 999,
                    textTransform: 'none',
                    px: 2,
                    py: 0.75,
                    boxShadow: '0 4px 14px rgba(0,0,0,0.06)'
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
      </AppBar>

      <Drawer anchor="right" open={mobileOpen} onClose={handleDrawerToggle}>
        {drawer}
      </Drawer>
    </>
  );
};

export default dynamic(() => Promise.resolve(Header), { ssr: false });
