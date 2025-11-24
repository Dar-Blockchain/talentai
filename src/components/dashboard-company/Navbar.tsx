import React, { useState } from 'react';
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
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import GoogleIcon from '@mui/icons-material/Google';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import { useRouter } from 'next/router';
import Cookies from "js-cookie";
import {
  clearProfile,
} from "@/store/slices/profileSlice";
import { logout, setLoggingOut } from "@/store/slices/authSlice";
import { resetRedirectState } from "@/utils/authRedirect";
import { signOut } from "next-auth/react";

interface NavbarProps {
  profile: any;
}

const Navbar: React.FC<NavbarProps> = ({ profile }) => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Debug profile data
  console.log('Navbar profile:', profile);
  const handleLogout = async () => {
    handleClose();
    try {
      console.log("Starting logout process...");

      // Set logout flag to prevent axios interceptors from triggering redirects
      setLoggingOut(true);
      resetRedirectState();

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

      // Use replace instead of href to prevent returnUrl from being added
      // replace() removes current page from history, preventing back button issues
      window.location.replace("/signin");
    } catch (error) {
      console.error("Logout failed:", error);
      // Even on error, redirect to signin
      setLoggingOut(true);
      resetRedirectState();
      window.location.replace("/signin");
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              cursor: 'pointer',
              padding: '8px 12px',
              borderRadius: '8px',
              transition: 'background-color 0.2s',
              '&:hover': {
                backgroundColor: '#f5f5f5'
              }
            }}
            onClick={handleClick}
          >
            {/* Company Avatar */}
            <Avatar
              src={
                profile?.user_image || profile?.userId?.user_image
                  ? `${process.env.NEXT_PUBLIC_API_BASE_URL}images/Users/${profile?.user_image || profile?.userId?.user_image}`
                  : undefined
              }
              alt={profile?.username || profile?.companyName || 'Company'}
              sx={{
                width: 40,
                height: 40,
                backgroundColor: '#E3F2FD',
                color: '#1976D2',
                fontWeight: 500,
                fontSize: '1rem'
              }}
            >
              {(profile?.username || profile?.companyName || profile?.name || profile?.userId?.username || 'C').charAt(0)?.toUpperCase()}
            </Avatar>

            {/* Company Name */}
            <Typography
              sx={{
                fontWeight: 500,
                fontSize: '1rem',
                color: '#000000',
                fontFamily: 'Arial, sans-serif'
              }}
            >
              {profile?.username || profile?.companyName || profile?.name || profile?.userId?.username || 'Company Name'}
            </Typography>

            {/* Dropdown Arrow */}
            <Box
              sx={{
                width: 20,
                height: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#8310FF',
                transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s'
              }}
            >
              <Typography sx={{ fontSize: '0.875rem' }}>▼</Typography>
            </Box>
          </Box>

          {/* Dropdown Menu */}
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            PaperProps={{
              elevation: 3,
              sx: {
                mt: 1,
                minWidth: 200,
                borderRadius: 2,
                border: '1px solid #e0e0e0',
                '& .MuiMenuItem-root': {
                  px: 2,
                  py: 1.5,
                  fontSize: '0.875rem',
                  '&:hover': {
                    backgroundColor: '#f5f5f5'
                  }
                }
              }
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={() => { handleClose(); router.push('/dashboard/company'); }}>
              <ListItemIcon>
                <PersonIcon sx={{ fontSize: '1.2rem', color: '#666' }} />
              </ListItemIcon>
              <ListItemText>Profile</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => { handleClose(); router.push('/settings/profile'); }}>
              <ListItemIcon>
                <SettingsIcon sx={{ fontSize: '1.2rem', color: '#666' }} />
              </ListItemIcon>
              <ListItemText>Settings</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleLogout} sx={{ color: '#d32f2f' }}>
              <ListItemIcon>
                <LogoutIcon sx={{ fontSize: '1.2rem', color: '#d32f2f' }} />
              </ListItemIcon>
              <ListItemText>Logout</ListItemText>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
