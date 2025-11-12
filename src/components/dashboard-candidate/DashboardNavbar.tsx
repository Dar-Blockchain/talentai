import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Avatar,
  IconButton,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import { useRouter } from 'next/router';

interface DashboardNavbarProps {
  profile: any;
  onLogout: () => void;
  onEditProfile: () => void;
  isMobile: boolean;
}

const DashboardNavbar: React.FC<DashboardNavbarProps> = ({
  profile,
  onLogout,
  onEditProfile,
  isMobile
}) => {
  const GREEN_MAIN = "#7C4DFF";
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    onLogout();
  };

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        backgroundColor: "#ffffff",
        color: "#000000",
        boxShadow: 'none',
        borderBottom: '1px solid #f0f0f0',
        mb: 3,
        borderRadius: 0,
        width: '95%',
        mx: 'auto',
        mt: 0,
        px: 0,
        py: 0,
      }}
      role="banner"
      aria-label="Dashboard navigation"
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          minHeight: '64px',
          px: { xs: 2, md: 3 },
          py: 1,
        }}
      >
        {/* Logo on the left - TALENT AI */}
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
            '&:hover': {
              transform: 'translateY(-1px)',
              opacity: 0.8
            }
          }}
          onClick={() => router.push('/home/candidate')}
        >
          <img
            src="/images/jobseeker_landing/TalentAiPurple.png"
            alt="TalentAi"
            style={{ height: '32px', width: 'auto' }}
          />
        </Box>

        {/* User Profile Section on the right */}
        {profile && (
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
              {/* User Avatar */}
              <Avatar
                src={
                  profile?.user_image || profile?.userId?.user_image
                    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}images/Users/${profile?.user_image || profile?.userId?.user_image}`
                    : undefined
                }
                alt={profile?.userId?.username || 'User'}
                sx={{
                  width: 40,
                  height: 40,
                  backgroundColor: '#E3F2FD',
                  color: '#1976D2',
                  fontWeight: 500,
                  fontSize: '1rem'
                }}
              >
                {profile?.userId?.username?.charAt(0)?.toUpperCase() || 'U'}
              </Avatar>

              {/* User Name */}
              <Typography
                sx={{
                  fontWeight: 500,
                  fontSize: '1rem',
                  color: '#000000',
                  fontFamily: 'Arial, sans-serif'
                }}
              >
                {profile.userId?.username || 'John'}
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
              <MenuItem onClick={handleClose}>
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
        )}
      </Toolbar>
    </AppBar>
  );
};

export default DashboardNavbar;
