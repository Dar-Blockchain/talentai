'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  SelectChangeEvent,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { signOut } from 'next-auth/react';
import { clearProfile } from '@/store/slices/profileSlice';
import { logout, setLoggingOut } from '@/store/slices/authSlice';
import { resetRedirectState } from '@/utils/authRedirect';
import Cookies from 'js-cookie';
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

const ProfileSettingsPage: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Handle tab parameter from URL query
  useEffect(() => {
    if (router.isReady && router.query.tab) {
      const tabParam = router.query.tab as string;
      if (['personal', 'contact', 'preferences', 'notifications'].includes(tabParam)) {
        setActiveTab(tabParam);
      }
    }
  }, [router.isReady, router.query.tab]);

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
    // Company fields
    companyName: '',
    name: '',
    industry: '',
    companySize: '',
    size: '',
    employmentType: 'Remote',
    requiredSkills: [],
  });

  // Load user profile data
  const fetchProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('api_token');
      if (!token) {
        router.push('/signin');
        return;
      }

      // Fetch profile data
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}profiles/getMyProfile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();

        // Extract data from nested userId object if available
        const userData = data.userId || data;

        // Construct avatar URL if user_image exists
        let avatarUrl = '';
        if (data.user_image || userData.user_image) {
          const imageName = data.user_image || userData.user_image;
          avatarUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}images/Users/${imageName}`;
        } else {
          avatarUrl = data.avatar || userData.avatar || '';
        }

        setProfile({
          username: userData.username || user.username || '',
          email: userData.email || user.email || data.companyDetails?.email || '',
          requiredExperienceLevel: data.requiredExperienceLevel || data.companyDetails?.requiredExperienceLevel || 'Mid Level',
          targetRole: data.targetRole || '',
          firstName: data.firstName  || user.username?.split(' ')[0] || '',
          lastName: data.lastName  || user.username?.split(' ')[1] || '',
          gender: data.gender || userData.gender || 'Male',
          country: data.country || data.companyDetails?.location || userData.country || 'Tunisia',
          language: data.language || userData.language || 'English',
          timezone: data.timezone || userData.timezone || 'UTC+01:00',
          // Contact Information
          phone: data.contactInformation?.phone || '',
          address: data.contactInformation?.address || '',
          linkedinUrl: data.contactInformation?.linkedinUrl || '',
          githubUrl: data.contactInformation?.githubUrl || '',
          personalWebsite: data.contactInformation?.personalWebsite || '',
          location: data.contactInformation?.location || data.companyDetails?.location || '',
          avatar: avatarUrl,
          profileType: data.type || 'Candidate',
          // Company-specific fields
          companyName: data.companyDetails?.name || '',
          name: data.companyDetails?.name || '',
          industry: data.companyDetails?.industry || '',
          companySize: data.companyDetails?.size || '',
          size: data.companyDetails?.size || '',
          employmentType: data.companyDetails?.employmentType || 'Remote',
          requiredSkills: data.companyDetails?.requiredSkills || data.requiredSkills || [],
        });

        console.log('✅ Profile data loaded:', {
          profileType: data.type,
          username: userData.username,
          email: userData.email,
          requiredExperienceLevel: data.requiredExperienceLevel,
          targetRole: data.targetRole,
          hasCompanyDetails: !!data.companyDetails,
          skills: data.skills?.length || 0,
          softSkills: data.softSkills?.length || 0,
          avatarUrl: avatarUrl,
        });
      } else {
        console.error('Failed to load profile:', response.status);
        setError('Failed to load profile data');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('An error occurred while loading your profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      router.push('/signin');
      return;
    }

    fetchProfile();
  }, [user, router]);

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
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    setUploadingImage(true);
    setError(null);

    try {
      const token = localStorage.getItem('api_token');
      if (!token) {
        router.push('/signin');
        return;
      }

      const formData = new FormData();
      formData.append('user_image', file);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}profiles/Update_Profile_Picture`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Profile picture updated:', data);

        // Refresh profile data to get the updated image
        setUploadingImage(false);
        await fetchProfile();

        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to upload image' }));
        console.error('Failed to upload profile picture:', errorData);
        setError(errorData.message || 'Failed to upload profile picture. Please try again.');
      }
    } catch (err: any) {
      console.error('Error uploading profile picture:', err);
      setError(err.message || 'An error occurred while uploading your profile picture.');
      setUploadingImage(false);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('api_token');
      if (!token) {
        router.push('/signin');
        return;
      }

      // Build update payload with all editable fields
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

      // For Companies - Handle company profile and contact information separately
      if (profile.profileType === 'Company') {
        if (activeTab === 'personal') {
          // Use createOrUpdateCompanyProfile endpoint for company information
          const companyPayload = {
            name: profile.name?.trim() || profile.companyName?.trim() || '',
            industry: profile.industry || '',
            size: profile.size || profile.companySize || '',
            location: profile.location?.trim() || '',
            email: profile.email?.trim() || '',
            employmentType: profile.employmentType || 'Remote',
            requiredExperienceLevel: profile.requiredExperienceLevel || 'Mid Level',
          };

          console.log('Updating company profile with payload:', companyPayload);

          const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}profiles/createOrUpdateCompanyProfile`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(companyPayload),
          });

          if (response.ok) {
            const data = await response.json();
            console.log('✅ Company profile updated successfully:', data);
            setSaveSuccess(true);
            setIsEditing(false);
            setTimeout(() => setSaveSuccess(false), 3000);
            // Refresh profile data
            await fetchProfile();
          } else {
            const errorData = await response.json().catch(() => ({ message: 'Failed to update company profile' }));
            console.error('Failed to update company profile:', errorData);
            setError(errorData.message || 'Failed to update company profile. Please try again.');
          }
          setLoading(false);
          return;
        } else if (activeTab === 'contact') {
          // Contact Information for Companies (no GitHub field)
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
        setError('Please fill in at least one field to update');
        setLoading(false);
        return;
      }

      console.log('Updating profile with payload:', updatePayload);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}profiles/updateProfile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatePayload),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Profile updated successfully:', data);
        setSaveSuccess(true);
        setIsEditing(false);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to update profile' }));
        console.error('Failed to update profile:', errorData);
        setError(errorData.message || 'Failed to update profile. Please try again.');
      }
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'An error occurred while updating your profile.');
    } finally {
      setLoading(false);
    }
  };


  // Menu items now handled by ProfileSidebar component

  if (!user) {
    return null;
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      backgroundColor: '#F8F9FA',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Header logo="/images/home/logocandidate.png"
        type="jobseeker"
        color="#8310FF"
        link="Are you hiring?" />

      <Container maxWidth="xl" sx={{ py: 4, flex: 1 }}>
        {/* Back to Dashboard Button */}
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
          {/* Sidebar - Using ProfileSidebar Component */}
          <ProfileSidebar
            activeTab={activeTab}
            profileType={profile.profileType || 'Candidate'}
            onTabChange={(tab) => setActiveTab(tab)}
          />

          {/* Main Content */}
          <Box sx={{ flex: 1 }}>
            {/* Personal Information Tab - Using PersonalInformationTab Component */}
            {activeTab === 'personal' && (
              <PersonalInformationTab
                profile={profile}
                isEditing={isEditing}
                loading={loading}
                saveSuccess={saveSuccess}
                error={error}
                uploadingImage={uploadingImage}
                onInputChange={handleInputChange}
                onSelectChange={handleSelectChange}
                onImageUpload={handleImageUpload}
                onSave={handleSaveProfile}
                onCancel={() => setIsEditing(false)}
                onEditToggle={() => setIsEditing(!isEditing)}
              />
            )}

            {/* Contact Information Tab - Using ContactInformationTab Component */}
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

            {/* Notifications Tab - Using NotificationsTab Component */}
            {activeTab === 'notifications' && (
              <NotificationsTab notifications={staticNotifications} />
            )}

            {/* Placeholder for other tabs */}
            {activeTab !== 'personal' && activeTab !== 'contact' && activeTab !== 'notifications' && (
              <Card sx={{
                borderRadius: 3,
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                mb: 3,
              }}>
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
    </Box>
  );
};

export default ProfileSettingsPage;
