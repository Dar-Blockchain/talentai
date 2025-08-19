"use client";

import { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import {
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Box,
  IconButton,
  Badge,
  Fade,
  Grow,
} from "@mui/material";
import {
  Person as PersonIcon,
  Logout as LogoutIcon,
  Email as EmailIcon,
} from "@mui/icons-material";
import type { RootState } from "../store/store";
import Cookies from 'js-cookie';
import { useDispatch } from 'react-redux';
import { clearProfile } from '@/store/slices/profileSlice';
import { logout } from '@/store/slices/authSlice';
import { signOut } from 'next-auth/react';

export default function UserAvatar() {
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isClient, setIsClient] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  // Safe access to Redux state to prevent hydration issues
  const safeUser = isClient ? user : null;
  const safeIsAuthenticated = isClient ? isAuthenticated : false;

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setAnchorEl(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    handleMenuClose();
    router.push("/preferences");
  };

  const handleLogoutClick = async () => {
    handleMenuClose();
    try {
      // Clear the token from both localStorage and cookies
      localStorage.removeItem('api_token');
      Cookies.remove('api_token', { path: '/' });

      // Clear all other data
      localStorage.clear();

      // Clear all other cookies
      Object.keys(Cookies.get()).forEach(cookieName => {
        Cookies.remove(cookieName, { path: '/' });
      });

      // Clear Redux state
      dispatch(clearProfile());
      dispatch(logout());

      // Sign out from NextAuth
      await signOut({ redirect: false });

      // Redirect to signin page
      router.push('/signin');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Don't render anything if not authenticated or not on client
  if (!isClient || !safeIsAuthenticated || !safeUser) {
    return null;
  }

  // Get user initials for avatar
  const getUserInitials = () => {
    if (safeUser?.firstName && safeUser?.lastName) {
      return `${safeUser.firstName.charAt(0)}${safeUser.lastName.charAt(0)}`.toUpperCase();
    } else if (safeUser?.email) {
      return safeUser.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (safeUser?.firstName && safeUser?.lastName) {
      return `${safeUser.firstName} ${safeUser.lastName}`;
    }
    return safeUser?.email || "User";
  };

  // Get user role for badge color
  const getUserRole = () => {
    if (safeUser?.role === "Company") return "company";
    if (safeUser?.role === "Candidat") return "candidate";
    if (safeUser?.role === "Admin") return "admin";
    return "default";
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "company":
        return "linear-gradient(135deg, #29D291 0%, #00FF9D 100%)";
      case "candidate":
        return "linear-gradient(135deg, #8310FF 0%, #B366FF 100%)";
      case "admin":
        return "linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%)";
      default:
        return "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
    }
  };

  return (
    <Box ref={menuRef}>
      <IconButton
        onClick={handleMenuOpen}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        sx={{
          p: 0,
          position: "relative",
          "&:hover": {
            transform: "scale(1.05)",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          },
        }}
      >
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          badgeContent={
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: getRoleColor(getUserRole()),
                border: "2px solid #fff",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
              }}
            />
          }
        >
          <Avatar
            sx={{
              width: 44,
              height: 44,
              background: isHovered 
                ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                : "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
              color: "white",
              fontWeight: 700,
              fontSize: "1.1rem",
              border: "3px solid rgba(255, 255, 255, 0.8)",
              boxShadow: isHovered
                ? "0 8px 25px rgba(102, 126, 234, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.2)"
                : "0 4px 15px rgba(240, 147, 251, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              cursor: "pointer",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: "50%",
                background: "linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%)",
                opacity: 0,
                transition: "opacity 0.3s ease",
              },
              "&:hover::before": {
                opacity: 1,
              },
            }}
          >
            {getUserInitials()}
          </Avatar>
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        TransitionComponent={Grow}
        transitionDuration={200}
        PaperProps={{
          sx: {
            mt: 2,
            minWidth: 280,
            borderRadius: 3,
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15), 0 8px 25px rgba(0, 0, 0, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(20px)",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "4px",
              background: getRoleColor(getUserRole()),
            },
          },
        }}
      >
        {/* User Info Section */}
        <Box
          sx={{
            p: 3,
            textAlign: "center",
            background: "linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)",
            borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
          }}
        >
          <Avatar
            sx={{
              width: 60,
              height: 60,
              mx: "auto",
              mb: 2,
              background: getRoleColor(getUserRole()),
              fontSize: "1.5rem",
              fontWeight: 700,
              boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
            }}
          >
            {getUserInitials()}
          </Avatar>
          
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 700, 
              color: "text.primary",
              mb: 0.5,
              fontSize: "1.1rem",
            }}
          >
            {getUserDisplayName()}
          </Typography>
          
          <Typography 
            variant="body2" 
            sx={{ 
              color: "text.secondary",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 0.5,
              fontSize: "0.875rem",
            }}
          >
            <EmailIcon sx={{ fontSize: 16, color: "primary.main" }} />
            {safeUser.email}
          </Typography>
          
          <Box
            sx={{
              mt: 1.5,
              display: "inline-block",
              px: 2,
              py: 0.5,
              borderRadius: 2,
              background: getRoleColor(getUserRole()),
              color: "white",
              fontSize: "0.75rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            {safeUser.role || "User"}
          </Box>
        </Box>

        {/* Menu Items */}
        <Box sx={{ p: 1 }}>
          <MenuItem 
            onClick={handleProfileClick} 
            sx={{ 
              py: 1.5,
              px: 2,
              borderRadius: 2,
              mb: 0.5,
              transition: "all 0.2s ease",
              "&:hover": {
                background: "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)",
                transform: "translateX(4px)",
              },
            }}
          >
            <ListItemIcon>
              <PersonIcon sx={{ color: "primary.main", fontSize: 20 }} />
            </ListItemIcon>
            <ListItemText 
              primary="Profile" 
              primaryTypographyProps={{ 
                variant: "body2",
                fontWeight: 600,
                fontSize: "0.9rem",
              }} 
            />
          </MenuItem>



          <Divider sx={{ my: 1.5, opacity: 0.6 }} />

          <MenuItem 
            onClick={handleLogoutClick} 
            sx={{ 
              py: 1.5,
              px: 2,
              borderRadius: 2,
              transition: "all 0.2s ease",
              "&:hover": {
                background: "linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(229, 57, 53, 0.1) 100%)",
                transform: "translateX(4px)",
              },
            }}
          >
            <ListItemIcon>
              <LogoutIcon sx={{ color: "error.main", fontSize: 20 }} />
            </ListItemIcon>
            <ListItemText 
              primary="Logout" 
              primaryTypographyProps={{ 
                variant: "body2",
                fontWeight: 600,
                fontSize: "0.9rem",
                color: "error.main"
              }} 
            />
          </MenuItem>
        </Box>
      </Menu>
    </Box>
  );
}
