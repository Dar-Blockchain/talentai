"use client";

import { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import Box from "@mui/material/Box";
import {
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
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
  const pathname = usePathname();
  
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
    const isHomePage = pathname === "/";
    
    if (isHomePage) {
      // Home page color scheme - enhanced green palette with complementary accents
      switch (role) {
        case "company":
          return "linear-gradient(135deg, #4ddaa4 0%, #00ff9d 30%, #2fd495 60%, #00e6b3 100%)";
        case "candidate":
          return "linear-gradient(135deg, #4ddaa4 0%, #00ff9d 25%, #2fd495 50%, #00e6b3 75%, #4ddaa4 100%)";
        case "admin":
          return "linear-gradient(135deg, #2fd495 0%, #00ff9d 30%, #4ddaa4 60%, #00e6b3 100%)";
        default:
          return "linear-gradient(135deg, #4ddaa4 0%, #00ff9d 25%, #2fd495 50%, #00e6b3 75%, #4ddaa4 100%)";
      }
    } else {
      // Jobseeker landing page - current enhanced colors
      switch (role) {
        case "company":
          return "linear-gradient(135deg, #00D4AA 0%, #00F5A3 50%, #00D4FF 100%)";
        case "candidate":
          return "linear-gradient(135deg, #8B5CF6 0%, #A855F7 50%, #C084FC 100%)";
        case "admin":
          return "linear-gradient(135deg, #EF4444 0%, #F87171 50%, #FCA5A5 100%)";
        default:
          return "linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A855F7 100%)";
      }
    }
  };

  const getRoleShadow = (role: string) => {
    const isHomePage = pathname === "/";
    
    if (isHomePage) {
      // Home page shadows - enhanced green palette with depth
      switch (role) {
        case "company":
          return "0 8px 32px rgba(77, 218, 164, 0.4), 0 4px 16px rgba(0, 255, 157, 0.3), 0 2px 8px rgba(47, 212, 149, 0.2)";
        case "candidate":
          return "0 8px 32px rgba(77, 218, 164, 0.4), 0 4px 16px rgba(0, 255, 157, 0.3), 0 2px 8px rgba(47, 212, 149, 0.2)";
        case "admin":
          return "0 8px 32px rgba(77, 218, 164, 0.4), 0 4px 16px rgba(0, 255, 157, 0.3), 0 2px 8px rgba(47, 212, 149, 0.2)";
        default:
          return "0 8px 32px rgba(77, 218, 164, 0.4), 0 4px 16px rgba(0, 255, 157, 0.3), 0 2px 8px rgba(47, 212, 149, 0.2)";
      }
    } else {
      // Jobseeker landing page shadows - current enhanced shadows
      switch (role) {
        case "company":
          return "0 8px 32px rgba(0, 212, 170, 0.4), 0 4px 16px rgba(0, 245, 163, 0.3)";
        case "candidate":
          return "0 8px 32px rgba(139, 92, 246, 0.4), 0 4px 16px rgba(168, 85, 247, 0.3)";
        case "admin":
          return "0 8px 32px rgba(239, 68, 68, 0.4), 0 4px 16px rgba(248, 113, 113, 0.3)";
        default:
          return "0 8px 32px rgba(99, 102, 241, 0.4), 0 4px 16px rgba(139, 92, 246, 0.3)";
      }
    }
  };

  const getRoleGlow = (role: string) => {
    const isHomePage = pathname === "/";
    
    if (isHomePage) {
      // Home page glow - enhanced green palette with multi-layered glow
      switch (role) {
        case "company":
          return "0 0 20px rgba(77, 218, 164, 0.7), 0 0 40px rgba(0, 255, 157, 0.5), 0 0 60px rgba(47, 212, 149, 0.3)";
        case "candidate":
          return "0 0 20px rgba(77, 218, 164, 0.7), 0 0 40px rgba(0, 255, 157, 0.5), 0 0 60px rgba(47, 212, 149, 0.3)";
        case "admin":
          return "0 0 20px rgba(77, 218, 164, 0.7), 0 0 40px rgba(0, 255, 157, 0.5), 0 0 60px rgba(47, 212, 149, 0.3)";
        default:
          return "0 0 20px rgba(77, 218, 164, 0.7), 0 0 40px rgba(0, 255, 157, 0.5), 0 0 60px rgba(47, 212, 149, 0.3)";
      }
    } else {
      // Jobseeker landing page glow - current enhanced glows
      switch (role) {
        case "company":
          return "0 0 20px rgba(0, 212, 170, 0.6), 0 0 40px rgba(0, 245, 163, 0.4)";
        case "candidate":
          return "0 0 20px rgba(139, 92, 246, 0.6), 0 0 40px rgba(168, 85, 247, 0.4)";
        case "admin":
          return "0 0 20px rgba(239, 68, 68, 0.6), 0 0 40px rgba(248, 113, 113, 0.4)";
        default:
          return "0 0 20px rgba(99, 102, 241, 0.6), 0 0 40px rgba(139, 102, 246, 0.4)";
      }
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
                 width: 18,
                 height: 18,
                 borderRadius: "50%",
                 background: getRoleColor(getUserRole()),
                 border: "3px solid #ffffff",
                 boxShadow: `0 4px 16px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.4), ${getRoleGlow(getUserRole())}`,
                 position: "relative",
                 "&::after": {
                   content: '""',
                   position: "absolute",
                   top: "50%",
                   left: "50%",
                   width: "6px",
                   height: "6px",
                   borderRadius: "50%",
                   background: "rgba(255, 255, 255, 0.8)",
                   transform: "translate(-50%, -50%)",
                   boxShadow: "0 0 8px rgba(255, 255, 255, 0.6)",
                 },
               }}
             />
           }
         >
           <Avatar
             sx={{
               width: 48,
               height: 48,
              background: isHovered 
                ? (pathname === "/" 
                    ? "linear-gradient(135deg, #4ddaa4 0%, #00ff9d 25%, #2fd495 50%, #00e6b3 75%, #4ddaa4 100%)"
                    : "linear-gradient(135deg, #FF6B9D 0%, #C44569 50%, #F8BBD9 100%)")
                : (pathname === "/" 
                    ? "linear-gradient(135deg, #4ddaa4 0%, #00ff9d 30%, #2fd495 60%, #00e6b3 100%)"
                    : "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)"),
               color: "white",
               fontWeight: 800,
               fontSize: "1.2rem",
               border: "4px solid rgba(255, 255, 255, 0.95)",
              boxShadow: isHovered
                ? (pathname === "/" 
                    ? "0 12px 40px rgba(77, 218, 164, 0.6), 0 6px 20px rgba(0, 255, 157, 0.4), 0 0 0 2px rgba(255, 255, 255, 0.4), inset 0 2px 0 rgba(255, 255, 255, 0.3)"
                    : "0 12px 40px rgba(255, 107, 157, 0.6), 0 0 0 2px rgba(255, 255, 255, 0.4), inset 0 2px 0 rgba(255, 255, 255, 0.3)")
                : (pathname === "/" 
                    ? "0 8px 25px rgba(77, 218, 164, 0.5), 0 4px 12px rgba(0, 255, 157, 0.3), 0 0 0 2px rgba(255, 255, 255, 0.3), inset 0 2px 0 rgba(255, 255, 255, 0.2)"
                    : "0 8px 25px rgba(102, 126, 234, 0.5), 0 0 0 2px rgba(255, 255, 255, 0.3), inset 0 2px 0 rgba(255, 255, 255, 0.2)"),
               transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
               cursor: "pointer",
               position: "relative",
               overflow: "hidden",
               "&::before": {
                 content: '""',
                 position: "absolute",
                 top: 0,
                 left: 0,
                 right: 0,
                 bottom: 0,
                 borderRadius: "50%",
                 background: "linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.3) 50%, transparent 70%)",
                 opacity: 0,
                 transition: "opacity 0.4s ease",
                 transform: "rotate(45deg)",
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
            minWidth: 320,
            borderRadius: 4,
            boxShadow: "0 25px 80px rgba(0, 0, 0, 0.2), 0 12px 40px rgba(0, 0, 0, 0.15)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            background: "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.95) 100%)",
            backdropFilter: "blur(25px)",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "6px",
              background: getRoleColor(getUserRole()),
              boxShadow: getRoleShadow(getUserRole()),
            },
          },
        }}
      >
        {/* User Info Section */}
        <Box
          sx={{
            p: 4,
            textAlign: "center",
            background: "linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%)",
            borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
            position: "relative",
            "&::after": {
              content: '""',
              position: "absolute",
              bottom: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: "60%",
              height: "1px",
              background: "linear-gradient(90deg, transparent 0%, rgba(102, 126, 234, 0.3) 50%, transparent 100%)",
            },
          }}
        >
          <Avatar
            sx={{
              width: 72,
              height: 72,
              mx: "auto",
              mb: 3,
              background: getRoleColor(getUserRole()),
              fontSize: "1.8rem",
              fontWeight: 800,
              boxShadow: getRoleShadow(getUserRole()),
              border: "4px solid rgba(255, 255, 255, 0.9)",
              position: "relative",
              "&::before": {
                content: '""',
                position: "absolute",
                top: -2,
                left: -2,
                right: -2,
                bottom: -2,
                borderRadius: "50%",
                background: "linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.2) 50%, transparent 70%)",
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
          
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 800, 
              color: "#1F2937",
              mb: 1,
              fontSize: "1.25rem",
              textShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
            }}
          >
            {getUserDisplayName()}
          </Typography>
          
          <Typography 
            variant="body2" 
            sx={{ 
              color: "#6B7280",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              fontSize: "0.9rem",
              mb: 2,
            }}
          >
            <EmailIcon sx={{ 
              fontSize: 18, 
              color: "#6366F1",
              filter: "drop-shadow(0 1px 2px rgba(99, 102, 241, 0.3))"
            }} />
            {safeUser.email}
          </Typography>
          
          <Box
            sx={{
              display: "inline-block",
              px: 3,
              py: 1,
              borderRadius: 3,
              background: getRoleColor(getUserRole()),
              color: "white",
              fontSize: "0.8rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "1px",
              boxShadow: getRoleShadow(getUserRole()),
              border: "1px solid rgba(255, 255, 255, 0.3)",
              position: "relative",
              overflow: "hidden",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: "-100%",
                width: "100%",
                height: "100%",
                background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)",
                transition: "left 0.5s ease",
              },
              "&:hover::before": {
                left: "100%",
              },
            }}
          >
            {safeUser.role || "User"}
          </Box>
        </Box>

        {/* Menu Items */}
        <Box sx={{ p: 2 }}>
          <MenuItem 
            onClick={handleProfileClick} 
            sx={{ 
              py: 2,
              px: 3,
              borderRadius: 3,
              mb: 1,
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              background: "rgba(99, 102, 241, 0.02)",
              border: "1px solid rgba(99, 102, 241, 0.1)",
              "&:hover": {
                background: "linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.12) 100%)",
                transform: "translateX(6px) scale(1.02)",
                borderColor: "rgba(99, 102, 241, 0.3)",
                boxShadow: "0 8px 25px rgba(99, 102, 241, 0.15)",
              },
            }}
          >
            <ListItemIcon>
              <PersonIcon sx={{ 
                color: "#6366F1", 
                fontSize: 22,
                filter: "drop-shadow(0 1px 2px rgba(99, 102, 241, 0.3))"
              }} />
            </ListItemIcon>
            <ListItemText 
              primary="Profile" 
              primaryTypographyProps={{ 
                variant: "body2",
                fontWeight: 700,
                fontSize: "0.95rem",
                color: "#374151",
              }} 
            />
          </MenuItem>



          <Divider sx={{ 
            my: 2, 
            opacity: 0.4,
            background: "linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.2), transparent)",
            height: "1px",
          }} />

          <MenuItem 
            onClick={handleLogoutClick} 
            sx={{ 
              py: 2,
              px: 3,
              borderRadius: 3,
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              background: "rgba(239, 68, 68, 0.02)",
              border: "1px solid rgba(239, 68, 68, 0.1)",
              "&:hover": {
                background: "linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(248, 113, 113, 0.12) 100%)",
                transform: "translateX(6px) scale(1.02)",
                borderColor: "rgba(239, 68, 68, 0.3)",
                boxShadow: "0 8px 25px rgba(239, 68, 68, 0.15)",
              },
            }}
          >
            <ListItemIcon>
              <LogoutIcon sx={{ 
                color: "#EF4444", 
                fontSize: 22,
                filter: "drop-shadow(0 1px 2px rgba(239, 68, 68, 0.3))"
              }} />
            </ListItemIcon>
            <ListItemText 
              primary="Logout" 
              primaryTypographyProps={{ 
                variant: "body2",
                fontWeight: 700,
                fontSize: "0.95rem",
                color: "#DC2626"
              }} 
            />
          </MenuItem>

        </Box>
      </Menu>
    </Box>
  );
}
