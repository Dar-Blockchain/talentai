import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import BusinessIcon from '@mui/icons-material/Business';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import { motion } from 'framer-motion';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface CompanyHeaderProps {
  companyName: string;
  companyLogo?: string;
  onLogout: () => void;
  onMenuClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  anchorEl: HTMLElement | null;
  onMenuClose: () => void;
}

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: 'linear-gradient(135deg, #8310FF 0%, #02E2FF 100%)',
  backdropFilter: 'blur(10px)',
  borderBottom: '1px solid rgba(255,255,255,0.1)',
  boxShadow: '0 4px 20px rgba(131, 16, 255, 0.3)',
}));

const CompanyLogo = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  cursor: 'pointer',
  transition: 'transform 0.2s ease',
  '&:hover': {
    transform: 'scale(1.05)',
  },
}));

const HeaderButton = styled(Button)(({ theme }) => ({
  color: 'white',
  borderColor: 'rgba(255, 255, 255, 0.3)',
  borderRadius: '12px',
  textTransform: 'none',
  fontWeight: 600,
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: 'white',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    transform: 'translateY(-2px)',
  },
}));

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * CompanyHeader Component
 * 
 * Displays the top navigation bar with company branding, user menu, and logout functionality
 */
const CompanyHeader: React.FC<CompanyHeaderProps> = ({
  companyName,
  companyLogo,
  onLogout,
  onMenuClick,
  anchorEl,
  onMenuClose,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <StyledAppBar position="static" elevation={0}>
      <Toolbar sx={{ 
        justifyContent: 'space-between',
        py: { xs: 1, md: 2 },
        px: { xs: 2, md: 3 }
      }}>
        {/* Company Branding */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <CompanyLogo>
            {companyLogo ? (
              <Avatar
                src={companyLogo}
                alt={companyName}
                sx={{ width: 40, height: 40 }}
              />
            ) : (
              <BusinessIcon sx={{ fontSize: 32, color: 'white' }} />
            )}
            <Typography
              variant={isMobile ? 'h6' : 'h5'}
              sx={{
                fontWeight: 700,
                color: 'white',
                display: { xs: 'none', sm: 'block' }
              }}
            >
              {companyName}
            </Typography>
          </CompanyLogo>
        </motion.div>

        {/* Right Side Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Mobile Menu Button */}
          {isMobile && (
            <IconButton
              onClick={onMenuClick}
              sx={{ color: 'white' }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Desktop Actions */}
          {!isMobile && (
            <>
              <HeaderButton variant="outlined" size="small">
                Dashboard
              </HeaderButton>
              <HeaderButton variant="outlined" size="small">
                Jobs
              </HeaderButton>
              <HeaderButton variant="outlined" size="small">
                Candidates
              </HeaderButton>
            </>
          )}

          {/* User Menu */}
          <Box sx={{ position: 'relative' }}>
            <IconButton
              onClick={onMenuClick}
              sx={{ color: 'white' }}
            >
              <Avatar
                sx={{ 
                  width: 36, 
                  height: 36,
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  border: '2px solid rgba(255, 255, 255, 0.3)'
                }}
              >
                <BusinessIcon />
              </Avatar>
            </IconButton>
          </Box>
        </Box>

        {/* Mobile Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={onMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          PaperProps={{
            sx: {
              mt: 1,
              minWidth: 200,
              borderRadius: 2,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            }
          }}
        >
          <MenuItem onClick={onMenuClose}>
            <BusinessIcon sx={{ mr: 2, color: '#8310FF' }} />
            Company Profile
          </MenuItem>
          <MenuItem onClick={onMenuClose}>
            <WorkIcon sx={{ mr: 2, color: '#8310FF' }} />
            My Jobs
          </MenuItem>
          <MenuItem onClick={onMenuClose}>
            <PersonSearchIcon sx={{ mr: 2, color: '#8310FF' }} />
            Find Candidates
          </MenuItem>
          <MenuItem onClick={onLogout} sx={{ color: '#d32f2f' }}>
            <LogoutIcon sx={{ mr: 2 }} />
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </StyledAppBar>
  );
};

export default CompanyHeader;

