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
  Logout as LogoutIcon,
  Close as CloseIcon,
  QuestionAnswer as InterviewIcon,
  Psychology as SkillIcon,
} from '@mui/icons-material';

const DRAWER_WIDTH = 260;
const PRIMARY = '#8310FF';

const SidebarItem = styled(ListItemButton)(({ theme }) => ({
  borderRadius: '12px',
  margin: '2px 0',
  padding: '10px 16px',
  transition: 'all 0.2s ease',
  color: '#6c6c80',
  '& .MuiListItemIcon-root': {
    color: '#6c6c80',
    minWidth: 40,
  },
  '&.Mui-selected': {
    backgroundColor: '#f5f3ff',
    color: PRIMARY,
    borderLeft: `3px solid ${PRIMARY}`,
    '& .MuiListItemIcon-root': {
      color: PRIMARY,
    },
    '&:hover': {
      backgroundColor: '#ece6fa',
    },
  },
  '&:hover': {
    backgroundColor: '#f5f3ff',
    color: '#1a1a2e',
    '& .MuiListItemIcon-root': {
      color: PRIMARY,
    },
  },
}));

interface AdminSidebarProps {
  activeTab: number;
  onTabChange: (tab: number) => void;
  onLogout: () => void;
  drawerOpen: boolean;
  onDrawerClose: () => void;
}

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
          backgroundColor: '#ffffff',
          borderRight: '1px solid #ece6fa',
        },
      }}
    >
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, px: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <img
              src="/logo-purple.svg"
              alt="TalentAI"
              style={{ height: 32, width: 'auto' }}
            />
          </Box>
          {isMobile && (
            <IconButton onClick={onDrawerClose} size="small">
              <CloseIcon />
            </IconButton>
          )}
        </Box>

        <Divider sx={{ mb: 2, borderColor: '#ece6fa' }} />

        {/* Navigation Menu */}
        <Typography variant="caption" sx={{ px: 2, mb: 1, color: '#6c6c80', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Menu
        </Typography>
        <List sx={{ px: 0.5 }}>
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
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: activeTab === item.id ? 600 : 500 }}
              />
            </SidebarItem>
          ))}
        </List>

        {/* Spacer */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Logout */}
        <Divider sx={{ mb: 1, borderColor: '#ece6fa' }} />
        <Box sx={{ px: 0.5 }}>
          <SidebarItem onClick={onLogout}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText
              primary="Logout"
              primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }}
            />
          </SidebarItem>
        </Box>
      </Box>
    </Drawer>
  );
};

export default React.memo(AdminSidebar);
