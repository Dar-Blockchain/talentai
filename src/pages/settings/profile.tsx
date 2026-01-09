'use client';
import React, { useState, useCallback } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import axios from 'axios';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

// Extracted Components
import ProfileSidebar from '@/components/profile/ProfileSidebar';
import NotificationsTab from '@/components/profile/NotificationsTab';
import PersonalInformationTab from '@/components/profile/PersonalInformationTab';
import ContactInformationTab from '@/components/profile/ContactInformationTab';
import TeamMembersTab from '@/components/profile/TeamMembersTab';
import ProfileVisibilityTab from '@/components/profile/ProfileVisibilityTab';
import SnackbarNotifications from '@/components/profile/SnackbarNotifications';
import BackToDashboardButton from '@/components/profile/BackToDashboardButton';

// Custom Hook
import { useProfileManagement } from '@/hooks/useProfileManagement';

const ProfileSettingsPage: React.FC = () => {
  const {
    activeTab,
    isEditing,
    profile,
    loading,
    error,
    uploadingImage,
    saveSuccess,
    userId,
    setActiveTab,
    setIsEditing,
    handleInputChange,
    handleSelectChange,
    handleImageUpload,
    handleSaveProfile,
    handleDismissError,
    handleDismissSuccess,
  } = useProfileManagement();

  const { profile: reduxProfile } = useSelector((state: RootState) => state.profile);
  const [isPublicProfile, setIsPublicProfile] = useState(reduxProfile?.isPublicProfile || false);

  // Update local state when redux profile changes
  React.useEffect(() => {
    if (reduxProfile?.isPublicProfile !== undefined) {
      setIsPublicProfile(reduxProfile.isPublicProfile);
    }
  }, [reduxProfile?.isPublicProfile]);

  // Handle visibility toggle
  const handleToggleVisibility = useCallback(async (newVisibility: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}profiles/updateProfileVisibility`,
        { isPublicProfile: newVisibility },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setIsPublicProfile(newVisibility);
      } else {
        throw new Error(response.data.message || 'Failed to update visibility');
      }
    } catch (err: any) {
      console.error('Error updating visibility:', err);
      throw new Error(err.response?.data?.message || 'Failed to update profile visibility');
    }
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <Container maxWidth="xl" sx={{ py: 4, flex: 1 }}>
        <BackToDashboardButton profileType={profile.profileType || 'Candidate'} />

        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
          <ProfileSidebar
            activeTab={activeTab}
            profileType={profile.profileType || 'Candidate'}
            onTabChange={(tab) => setActiveTab(tab)}
            userId={userId}
          />

          <Box sx={{ flex: 1 }}>
            {activeTab === 'personal' && (
              <PersonalInformationTab
                profile={profile}
                isEditing={isEditing}
                loading={loading}
                saveSuccess={saveSuccess}
                error={error || null}
                uploadingImage={uploadingImage}
                onInputChange={handleInputChange}
                onSelectChange={handleSelectChange}
                onImageUpload={handleImageUpload}
                onSave={handleSaveProfile}
                onCancel={() => setIsEditing(false)}
                onEditToggle={() => setIsEditing(!isEditing)}
              />
            )}

            {activeTab === 'contact' && (
              <ContactInformationTab
                profile={profile}
                isEditing={isEditing}
                loading={loading}
                onInputChange={handleInputChange}
                onSave={handleSaveProfile}
                onCancel={() => setIsEditing(false)}
                onEditToggle={() => setIsEditing(!isEditing)}
              />
            )}

            {activeTab === 'notifications' && profile.profileType !== 'Company' && (
              <NotificationsTab />
            )}

            {activeTab === 'team' && profile.profileType === 'Company' && (
              <TeamMembersTab />
            )}

            {activeTab === 'visibility' && (
              <ProfileVisibilityTab
                userId={userId}
                isPublicProfile={isPublicProfile}
                onToggleVisibility={handleToggleVisibility}
              />
            )}

            {activeTab !== 'personal' && activeTab !== 'contact' && activeTab !== 'notifications' && activeTab !== 'team' && activeTab !== 'visibility' && (
              <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)', mb: 3 }}>
                <CardContent sx={{ p: 6, textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ color: '#6b7280', mb: 2 }}>
                    {activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace(/([A-Z])/g, ' $1')}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                    This section is coming soon...
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Box>
        </Box>
      </Container>

      <Footer />

      <SnackbarNotifications
        error={error || null}
        saveSuccess={saveSuccess}
        onDismissError={handleDismissError}
        onDismissSuccess={handleDismissSuccess}
      />
    </Box>
  );
};

export default ProfileSettingsPage;
