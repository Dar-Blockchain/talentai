import React from 'react';
import {
  Box,
  Drawer,
  List,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  ListAlt as ListAltIcon,
  Logout as LogoutIcon,
  Close as CloseIcon,
  QuestionAnswer as InterviewIcon,
  Psychology as SkillIcon,
} from '@mui/icons-material';

const DRAWER_WIDTH = 280;
const GREEN_MAIN = '#8310FF';

const SidebarItem = styled(ListItemButton)(({ theme }) => ({
  borderRadius: '12px',
  margin: '4px 0',
  padding: '12px 16px',
  transition: 'all 0.2s ease',
  '&.Mui-selected': {
    background: `linear-gradient(135deg, ${GREEN_MAIN} 0%, #6a0dad 100%)`,
    color: 'white',
    '& .MuiListItemIcon-root': {
      color: 'white',
    },
    '&:hover': {
      background: `linear-gradient(135deg, ${GREEN_MAIN} 0%, #6a0dad 100%)`,
      transform: 'translateX(4px)',
    },
  },
  '&:hover': {
    backgroundColor: 'rgba(131, 16, 255, 0.08)',
    transform: 'translateX(2px)',
  },
}));

interface AdminSidebarProps {
  activeTab: number;
  onTabChange: (tab: number) => void;
  onLogout: () => void;
  drawerOpen: boolean;
  onDrawerClose: () => void;
}

/**
 * AdminSidebar Component
 * Navigation sidebar for admin dashboard
 * Extracted from admin.tsx for better modularity
 */
const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onTabChange,
  onLogout,
  drawerOpen,
  onDrawerClose,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const menuItems = [
    { id: 0, label: 'Dashboard', icon: <DashboardIcon /> },
    { id: 1, label: 'Users', icon: <PeopleIcon /> },
    { id: 2, label: 'Post Interview', icon: <InterviewIcon /> },
    { id: 3, label: 'Skill Interview', icon: <SkillIcon /> },
  ];

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'persistent'}
      open={drawerOpen}
      onClose={onDrawerClose}
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          backgroundColor: 'white',
          borderRight: '1px solid rgba(0,0,0,0.1)',
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: GREEN_MAIN }}>
            TalentAI Admin
          </Typography>
          {isMobile && (
            <IconButton onClick={onDrawerClose}>
              <CloseIcon />
            </IconButton>
          )}
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Navigation Menu */}
        <List>
          {menuItems.map((item) => (
            <SidebarItem
              key={item.id}
              selected={activeTab === item.id}
              onClick={() => {
                onTabChange(item.id);
                if (isMobile) onDrawerClose();
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </SidebarItem>
          ))}
        </List>

        <Divider sx={{ my: 2 }} />

        {/* Logout */}
        <SidebarItem onClick={onLogout}>
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </SidebarItem>
      </Box>
    </Drawer>
  );
};

export default React.memo(AdminSidebar);
