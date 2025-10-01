import React from 'react';
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Avatar,
  IconButton,
  Button,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import GoogleIcon from '@mui/icons-material/Google';
import { useRouter } from 'next/router';
import Cookies from "js-cookie";
import {
  clearProfile,
} from "@/store/slices/profileSlice";
import { logout } from "@/store/slices/authSlice";
import { signOut } from "next-auth/react";

interface NavbarProps {
  profile: any;
}

const Navbar: React.FC<NavbarProps> = ({ profile }) => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const handleLogout = async () => {
    try {
      // First clear the token from both localStorage and cookies
      localStorage.removeItem("api_token");
      Cookies.remove("api_token", { path: "/" });

      // Then clear all other data
      localStorage.clear();

      // Clear all other cookies
      Object.keys(Cookies.get()).forEach((cookieName) => {
        Cookies.remove(cookieName, { path: "/" });
      });

      // Clear Redux state
      dispatch(clearProfile());
      dispatch(logout());

      // Sign out from NextAuth
      await signOut({ redirect: false });

      // Redirect to signin page
      router.push("/signin");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        bgcolor: 'white',
        color: '#000',
        boxShadow: 'none',
        mb: 2,
        borderRadius: 0,
        width: '100%',
        mx: 0,
        mt: 0,
        px: 2,
        py: 1,
      }}
    >
      <Toolbar
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          minHeight: 48,
          px: '0 !important',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              bgcolor: '#000000',
              borderRadius: 2,
              px: 2,
              py: 1,
              transition: 'all 0.2s',
              '&:hover': {
                bgcolor: '#000000',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
              }
            }}
            onClick={() => router.push('/')}
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
        </Box>
        {profile && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<GoogleIcon sx={{ color: '#4285f4' }} />}
              sx={{
                backgroundColor: '#ffffff',
                borderColor: '#e5e7eb',
                color: '#374151',
                borderRadius: 2,
                textTransform: 'none',
                px: 2,
                py: 1,
                fontSize: '0.875rem',
                fontWeight: 500,
                '&:hover': {
                  borderColor: '#d1d5db',
                  backgroundColor: '#f9fafb'
                }
              }}
            >
              {profile.userId?.username || 'Company Name'}
            </Button>
            <Button
              variant="outlined"
              startIcon={<LogoutIcon sx={{ color: '#ef4444' }} />}
              onClick={handleLogout}
              sx={{
                backgroundColor: '#ffffff',
                borderColor: '#ef4444',
                color: '#ef4444',
                borderRadius: 2,
                textTransform: 'none',
                px: 2,
                py: 1,
                fontSize: '0.875rem',
                fontWeight: 500,
                '&:hover': {
                  borderColor: '#dc2626',
                  backgroundColor: '#fef2f2'
                }
              }}
            >
              Logout
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
