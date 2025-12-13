'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  SelectChangeEvent,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import Header from '@/components/Header';
import SimpleFooter from '@/components/SimpleFooter';

// Extracted Components
import ProfileSidebar from '@/components/profile/ProfileSidebar';
import NotificationsTab from '@/components/profile/NotificationsTab';
import PersonalInformationTab from '@/components/profile/PersonalInformationTab';
import ContactInformationTab from '@/components/profile/ContactInformationTab';

// Constants and Types
import { staticNotifications } from '@/constants/profileConstants';
import { UserProfile } from '@/types/profile';

// Redux actions
import {
  getMyProfile,
  updateProfile as updateProfileAction,
  updateCompanyProfile,
  uploadProfilePicture,
  setSaveSuccess,
  clearError
} from '@/store/slices/profileSlice';

const ProfileSettingsPage: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { profile: reduxProfile, loading, error, uploadingImage, saveSuccess } = useSelector((state: RootState) => state.profile);

  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    username: '',
    email: '',
    requiredExperienceLevel: 'Mid Level',
    targetRole: '',
    firstName: '',
    lastName: '',
    gender: 'Male',
    country: 'Tunisia',
    language: 'English',
    timezone: 'UTC+01:00',
    phone: '',
    address: '',
    linkedinUrl: '',
    githubUrl: '',
    personalWebsite: '',
    location: '',
    avatar: '',
    profileType: 'Candidate',
    companyName: '',
    name: '',
    industry: '',
    companySize: '',
    size: '',
    employmentType: 'Remote',
    requiredSkills: [],
  });

  // Handle tab parameter from URL query
  useEffect(() => {
    if (router.isReady && router.query.tab) {
      const tabParam = router.query.tab as string;
      if (['personal', 'contact', 'preferences', 'notifications'].includes(tabParam)) {
        setActiveTab(tabParam);
      }
    }
  }, [router.isReady, router.query.tab]);

  // Load user profile data from Redux
  useEffect(() => {
    if (!user) {
      router.push('/signin');
      return;
    }

    dispatch(getMyProfile());
  }, [user, router, dispatch]);

  // Update local profile state when Redux profile changes
  useEffect(() => {
    if (reduxProfile) {
      const userData = reduxProfile.userId;

      // Construct avatar URL if user_image exists
      let avatarUrl = '';
      if (reduxProfile.user_image) {
        const imageName = reduxProfile.user_image;
        avatarUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}images/Users/${imageName}`;
      } else if (userData?.user_image) {
        const imageName = userData.user_image;
        avatarUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}images/Users/${imageName}`;
      }

      setProfile({
        username: userData?.username || user.username || '',
        email: userData?.email || user.email || reduxProfile.companyDetails?.email || '',
        requiredExperienceLevel: reduxProfile.requiredExperienceLevel || reduxProfile.companyDetails?.requiredExperienceLevel || 'Mid Level',
        targetRole: reduxProfile.targetRole || '',
        firstName: reduxProfile.firstName || user.username?.split(' ')[0] || '',
        lastName: reduxProfile.lastName || user.username?.split(' ')[1] || '',
        gender: reduxProfile.gender || 'Male',
        country: reduxProfile.country || reduxProfile.companyDetails?.location || 'Tunisia',
        language: reduxProfile.language || 'English',
        timezone: reduxProfile.timezone || 'UTC+01:00',
        phone: reduxProfile.contactInformation?.phone || '',
        address: reduxProfile.contactInformation?.address || '',
        linkedinUrl: reduxProfile.contactInformation?.linkedinUrl || '',
        githubUrl: reduxProfile.contactInformation?.githubUrl || '',
        personalWebsite: reduxProfile.contactInformation?.personalWebsite || '',
        location: reduxProfile.contactInformation?.location || reduxProfile.companyDetails?.location || '',
        avatar: avatarUrl,
        profileType: (reduxProfile.type === 'Company' ? 'Company' : 'Candidate') as 'Candidate' | 'Company',
        companyName: reduxProfile.companyDetails?.name || '',
        name: reduxProfile.companyDetails?.name || '',
        industry: reduxProfile.companyDetails?.industry || '',
        companySize: reduxProfile.companyDetails?.size || '',
        size: reduxProfile.companyDetails?.size || '',
        employmentType: reduxProfile.companyDetails?.employmentType || 'Remote',
        requiredSkills: reduxProfile.companyDetails?.requiredSkills || reduxProfile.requiredSkills || [],
      });
    }
  }, [reduxProfile, user]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (saveSuccess) {
      const timer = setTimeout(() => {
        dispatch(setSaveSuccess(false));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [saveSuccess, dispatch]);

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSelectChange = (event: SelectChangeEvent<string>, field: keyof UserProfile) => {
    setProfile(prev => ({ ...prev, [field]: event.target.value }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    try {
      await dispatch(uploadProfilePicture(file)).unwrap();
      // Refresh profile data
      await dispatch(getMyProfile());
    } catch (err: any) {
      console.error('Error uploading profile picture:', err);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const updatePayload: any = {};

      // Fields for all users
      if (profile.username?.trim()) {
        updatePayload.username = profile.username.trim();
      }

      // Only include these fields for Candidates
      if (profile.profileType === 'Candidate') {
        if (profile.email?.trim()) {
          updatePayload.email = profile.email.trim();
        }
        if (profile.requiredExperienceLevel) {
          updatePayload.requiredExperienceLevel = profile.requiredExperienceLevel;
        }
        if (profile.targetRole?.trim()) {
          updatePayload.targetRole = profile.targetRole.trim();
        }
        if (profile.firstName?.trim()) {
          updatePayload.firstName = profile.firstName.trim();
        }
        if (profile.lastName?.trim()) {
          updatePayload.lastName = profile.lastName.trim();
        }
        if (profile.gender) {
          updatePayload.gender = profile.gender;
        }
        if (profile.country) {
          updatePayload.country = profile.country;
        }
        if (profile.language) {
          updatePayload.language = profile.language;
        }
        if (profile.timezone) {
          updatePayload.timezone = profile.timezone;
        }

        // Contact Information for Candidates
        if (activeTab === 'contact' || profile.phone || profile.address || profile.linkedinUrl || profile.githubUrl || profile.personalWebsite || profile.location) {
          updatePayload.contactInformation = {
            email: profile.email?.trim() || '',
            phone: profile.phone?.trim() || '',
            address: profile.address?.trim() || '',
            linkedinUrl: profile.linkedinUrl?.trim() || '',
            githubUrl: profile.githubUrl?.trim() || '',
            personalWebsite: profile.personalWebsite?.trim() || '',
            location: profile.location?.trim() || '',
          };
        }
      }

      // For Companies
      if (profile.profileType === 'Company') {
        if (activeTab === 'personal') {
          const companyPayload = {
            name: profile.name?.trim() || profile.companyName?.trim() || '',
            industry: profile.industry || '',
            size: profile.size || profile.companySize || '',
            location: profile.location?.trim() || '',
            email: profile.email?.trim() || '',
            employmentType: profile.employmentType || 'Remote',
            requiredExperienceLevel: profile.requiredExperienceLevel || 'Mid Level',
          };

          await dispatch(updateCompanyProfile(companyPayload)).unwrap();
          setIsEditing(false);
          await dispatch(getMyProfile());
          return;
        } else if (activeTab === 'contact') {
          updatePayload.contactInformation = {
            email: profile.email?.trim() || '',
            phone: profile.phone?.trim() || '',
            address: profile.address?.trim() || '',
            linkedinUrl: profile.linkedinUrl?.trim() || '',
            personalWebsite: profile.personalWebsite?.trim() || '',
            location: profile.location?.trim() || '',
          };
        }
      }

      // Check if we have at least one field to update
      if (Object.keys(updatePayload).length === 0) {
        alert('Please fill in at least one field to update');
        return;
      }

      await dispatch(updateProfileAction(updatePayload)).unwrap();
      setIsEditing(false);
      await dispatch(getMyProfile());
    } catch (err: any) {
      console.error('Error saving profile:', err);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', flexDirection: 'column' }}>
      <Header logo="/images/home/logocandidate.png" type={profile.profileType === 'Company' ? 'company' : 'candidate'} />

      <Container maxWidth="xl" sx={{ py: 4, flex: 1 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => {
            const dashboardPath = profile.profileType === 'Company'
              ? '/dashboard/company'
              : '/dashboard/candidate';
            router.push(dashboardPath);
          }}
          sx={{
            mb: 3,
            color: '#8310FF',
            textTransform: 'none',
            fontWeight: 600,
            '&:hover': {
              backgroundColor: 'rgba(131, 16, 255, 0.08)',
            },
          }}
        >
          Back to Dashboard
        </Button>

        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
          <ProfileSidebar
            activeTab={activeTab}
            profileType={profile.profileType || 'Candidate'}
            onTabChange={(tab) => setActiveTab(tab)}
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

            {activeTab === 'notifications' && (
              <NotificationsTab notifications={staticNotifications} />
            )}

            {activeTab !== 'personal' && activeTab !== 'contact' && activeTab !== 'notifications' && (
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

      <SimpleFooter />

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => dispatch(clearError())}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => dispatch(clearError())}
          severity="error"
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>

      {/* Success Snackbar */}
      <Snackbar
        open={saveSuccess}
        autoHideDuration={3000}
        onClose={() => dispatch(setSaveSuccess(false))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => dispatch(setSaveSuccess(false))}
          severity="success"
          sx={{ width: '100%' }}
        >
          Profile updated successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProfileSettingsPage;
