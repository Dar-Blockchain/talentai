import React from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Avatar,
  IconButton,
  Button,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';

interface DashboardNavbarProps {
  profile: any;
  onLogout: () => void;
  isMobile: boolean;
}

const DashboardNavbar: React.FC<DashboardNavbarProps> = ({ 
  profile, 
  onLogout, 
  isMobile 
}) => {
  const GREEN_MAIN = "#7C4DFF";

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        bgcolor: "rgba(255,255,255,0.7)",
        color: "#191919",
        boxShadow: "0 4px 24px 0 rgba(124,77,255,0.10)",
        mb: 3,
        borderRadius: 3,
        backdropFilter: "blur(16px)",
        width: 'unset',
        mx: { xs: 1, sm: 4 },
        mt: 2,
        px: { xs: 1, sm: 3 },
        py: 1,
      }}
      role="banner"
      aria-label="Dashboard navigation"
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          minHeight: { xs: 56, sm: 72 },
          px: '0 !important',
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            component="img"
            src="/logo.svg"
            alt="TalentAI Logo"
            sx={{ 
              height: { xs: 28, sm: 32 }, 
              mr: 1, 
              cursor: "pointer", 
              transition: "transform 0.2s", 
              '&:hover': { transform: 'scale(1.07)' } 
            }}
            onClick={() => window.location.href = "/"}
          />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              fontFamily: 'Quicksand, Arial Rounded MT Bold, Arial, sans-serif',
              color: GREEN_MAIN,
              textShadow: "0 2px 8px #7C4DFF11",
              display: { xs: "none", sm: "block" },
            }}
          >
            Candidate Dashboard
          </Typography>
        </Box>
        
        {profile && (
          <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, sm: 2 } }}>
            <Avatar
              sx={{
                bgcolor: "linear-gradient(135deg, #7C4DFF 60%, #00B8D4 100%)",
                color: "#fff",
                width: 44,
                height: 44,
                fontWeight: 700,
                fontSize: 22,
                boxShadow: "0 2px 8px #7C4DFF22",
                border: "2px solid #fff",
              }}
            >
              {profile.userId?.username?.[0] || profile.userId?.email?.[0] || "U"}
            </Avatar>
            
            {!isMobile && (
              <>
                <Box sx={{ textAlign: "right", minWidth: 120 }}>
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      fontWeight: 700, 
                      color: "#222", 
                      fontSize: 17, 
                      lineHeight: 1.1 
                    }}
                  >
                    {profile.userId?.username || "User"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: 13 }}>
                    {profile.userId?.email}
                  </Typography>
                </Box>
                <Box sx={{ mx: 1, height: 36, borderLeft: "1.5px solid #E0E0E0" }} />
              </>
            )}
            
            {isMobile ? (
              <IconButton 
                onClick={onLogout}
                sx={{
                  background: "linear-gradient(90deg, #7C4DFF 0%, #00B8D4 100%)",
                  color: "#fff",
                  width: 44, 
                  height: 44,
                  '&:hover': {
                    background: "linear-gradient(90deg, #00B8D4 0%, #7C4DFF 100%)",
                  }
                }}
              >
                <LogoutIcon />
              </IconButton>
            ) : (
              <Button
                variant="contained"
                startIcon={<LogoutIcon />}
                sx={{
                  background: "linear-gradient(90deg, #7C4DFF 0%, #00B8D4 100%)",
                  color: "#fff",
                  fontWeight: 700,
                  borderRadius: 2,
                  px: 3,
                  py: 1.2,
                  boxShadow: "0 2px 8px #00B8D422",
                  textTransform: "none",
                  fontSize: 16,
                  letterSpacing: 0.2,
                  transition: "background 0.2s, box-shadow 0.2s",
                  '&:hover': {
                    background: "linear-gradient(90deg, #00B8D4 0%, #7C4DFF 100%)",
                    boxShadow: "0 4px 16px #00B8D433",
                  },
                }}
                onClick={onLogout}
              >
                Logout
              </Button>
            )}
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default DashboardNavbar;
