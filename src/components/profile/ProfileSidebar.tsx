import React from 'react';
import { Box, Card, CardContent, Typography, Divider, Button } from '@mui/material';
import {
  Person as PersonIcon,
  ContactMail as ContactMailIcon,
  Description as DescriptionIcon,
  Work as WorkIcon,
  Notifications as NotificationsIcon,
  Payment as PaymentIcon,
  HelpOutline as HelpIcon,
  Visibility as VisibilityIcon,
  Group as GroupIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/router';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface ProfileSidebarProps {
  activeTab: string;
  profileType: 'Candidate' | 'Company';
  onTabChange: (tab: string) => void;
  userId?: string;
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ activeTab, profileType, onTabChange, userId }) => {
  const router = useRouter();

  const candidateMenuItems: MenuItem[] = [
    { id: 'personal', label: 'Personal Information', icon: <PersonIcon /> },
    { id: 'contact', label: 'Contact Information', icon: <ContactMailIcon /> },
    // { id: 'resume', label: 'Resume & Documents', icon: <DescriptionIcon /> },
    // { id: 'preferences', label: 'Job Preferences', icon: <WorkIcon /> },
    { id: 'notifications', label: 'Notifications', icon: <NotificationsIcon /> },
    { id: 'visibility', label: 'Public Profile', icon: <VisibilityIcon /> },
    // { id: 'billing', label: 'Billing & Subscriptions', icon: <PaymentIcon /> },
  ];

  const companyMenuItems: MenuItem[] = [
    { id: 'personal', label: 'Company Information', icon: <PersonIcon /> },
    { id: 'contact', label: 'Contact Information', icon: <ContactMailIcon /> },
    { id: 'team', label: 'Team Members', icon: <GroupIcon /> },
    // { id: 'visibility', label: 'Public Profile', icon: <VisibilityIcon /> },
    // { id: 'billing', label: 'Billing & Subscriptions', icon: <PaymentIcon /> },
  ];

  const menuItems = profileType === 'Company' ? companyMenuItems : candidateMenuItems;

  const handleTabClick = (itemId: string) => {
    onTabChange(itemId);
    // Get the current route path
    const currentPath = router.pathname;
    router.push(`${currentPath}?tab=${itemId}`, undefined, { shallow: true });
  };

  return (
    <Card
      sx={{
        width: { xs: '100%', md: 280 },
        height: '100%',
        borderRadius: 3,
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        position: { xs: 'relative', md: 'sticky' },
        top: 20,
      }}
    >
      <CardContent sx={{ p: 0, height: '100%' }}>
        {menuItems.map((item) => (
          <Box
            key={item.id}
            onClick={() => handleTabClick(item.id)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              p: 2.5,
              cursor: 'pointer',
              borderLeft: activeTab === item.id ? '4px solid #8310FF' : '4px solid transparent',
              backgroundColor: activeTab === item.id ? 'rgba(131, 16, 255, 0.08)' : 'transparent',
              color: activeTab === item.id ? '#8310FF' : '#6b7280',
              fontWeight: activeTab === item.id ? 600 : 400,
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: 'rgba(131, 16, 255, 0.04)',
                color: '#8310FF',
              },
            }}
          >
            {item.icon}
            <Typography variant="body2" sx={{ fontSize: '0.9rem', fontWeight: 'inherit' }}>
              {item.label}
            </Typography>
          </Box>
        ))}
      </CardContent>
    </Card>
  );
};

export default React.memo(ProfileSidebar);
