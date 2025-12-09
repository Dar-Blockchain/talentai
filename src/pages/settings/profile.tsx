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
  TextField,
  Button,
  Avatar,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Divider,
  SelectChangeEvent,
} from '@mui/material';
import {
  Person as PersonIcon,
  ContactMail as ContactMailIcon,
  Description as DescriptionIcon,
  Work as WorkIcon,
  Notifications as NotificationsIcon,
  Payment as PaymentIcon,
  HelpOutline as HelpIcon,
  Edit as EditIcon,
  PhotoCamera as PhotoCameraIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  AccessTime as AccessTimeIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { signOut } from 'next-auth/react';
import { clearProfile } from '@/store/slices/profileSlice';
import { logout, setLoggingOut } from '@/store/slices/authSlice';
import { resetRedirectState } from '@/utils/authRedirect';
import Cookies from 'js-cookie';
import Header from '@/components/Header';
import SimpleFooter from '@/components/SimpleFooter';

interface UserProfile {
  // Editable fields
  username: string;
  email: string;
  requiredExperienceLevel: string;
  targetRole: string;
  firstName: string;
  lastName: string;
  gender: string;
  country: string;
  language: string;
  timezone: string;
  // Contact Information fields
  phone?: string;
  address?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  personalWebsite?: string;
  location?: string;
  // Display-only fields
  avatar?: string;
  profileType?: 'Candidate' | 'Company';
  // Company-specific fields (all editable)
  companyName?: string;
  name?: string;
  industry?: string;
  companySize?: string;
  size?: string;
  employmentType?: string;
  requiredSkills?: string[];
}

const experienceLevels = [
  'Entry Level',
  'Junior',
  'Mid Level',
  'Senior',
  'Expert'
];

const countries = [
  'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany',
  'France', 'Spain', 'Italy', 'Netherlands', 'Sweden', 'Norway', 'Denmark',
  'Tunisia', 'Morocco', 'Egypt', 'Algeria', 'Libya', 'Saudi Arabia', 'UAE',
  'Other'
];

const languages = [
  'English', 'French', 'Spanish', 'German', 'Arabic', 'Chinese', 'Japanese',
  'Portuguese', 'Russian', 'Italian', 'Dutch', 'Korean', 'Other'
];

const timezones = [
  'UTC-12:00', 'UTC-11:00', 'UTC-10:00', 'UTC-09:00', 'UTC-08:00', 'UTC-07:00',
  'UTC-06:00', 'UTC-05:00', 'UTC-04:00', 'UTC-03:00', 'UTC-02:00', 'UTC-01:00',
  'UTC+00:00', 'UTC+01:00', 'UTC+02:00', 'UTC+03:00', 'UTC+04:00', 'UTC+05:00',
  'UTC+06:00', 'UTC+07:00', 'UTC+08:00', 'UTC+09:00', 'UTC+10:00', 'UTC+11:00', 'UTC+12:00'
];

const employmentTypes = [
  'Remote',
  'Hybrid',
  'On-site'
];

const companySizes = [
  '1-10',
  '11-50',
  '51-200',
  '201-500',
  '500-1000',
  '1000+'
];

const industries = [
  'Technology',
  'Finance',
  'Healthcare',
  'Education',
  'Retail',
  'Manufacturing',
  'Consulting',
  'Media & Entertainment',
  'Real Estate',
  'Transportation',
  'Energy',
  'Telecommunications',
  'Other'
];

// Static notification data
const staticNotifications = [
  {
    id: '1',
    type: 'success',
    title: 'Interview Completed',
    message: 'Your React Developer technical interview has been completed successfully. Results are now available.',
    timestamp: '2 hours ago',
    isRead: false,
    icon: 'success'
  },
  {
    id: '2',
    type: 'info',
    title: 'New Match Found',
    message: 'A new candidate matches your JavaScript Developer position with 85% compatibility.',
    timestamp: '5 hours ago',
    isRead: false,
    icon: 'info'
  },
  {
    id: '3',
    type: 'success',
    title: 'Purchase Successful',
    message: 'You successfully purchased candidate profile for 150 TAI. Contact information has been revealed.',
    timestamp: '1 day ago',
    isRead: true,
    icon: 'success'
  },
  {
    id: '4',
    type: 'warning',
    title: 'Interview Reminder',
    message: 'You have a scheduled HR interview starting in 30 minutes. Please be prepared.',
    timestamp: '2 days ago',
    isRead: true,
    icon: 'warning'
  },
  {
    id: '5',
    type: 'info',
    title: 'Profile Updated',
    message: 'Your profile information has been successfully updated and saved.',
    timestamp: '3 days ago',
    isRead: true,
    icon: 'info'
  },
  {
    id: '6',
    type: 'success',
    title: 'Skill Assessment Passed',
    message: 'Congratulations! You passed the TypeScript skill assessment with a score of 92%.',
    timestamp: '5 days ago',
    isRead: true,
    icon: 'success'
  },
  {
    id: '7',
    type: 'info',
    title: 'New Job Posted',
    message: 'Your Senior Frontend Developer position has been posted successfully and is now live.',
    timestamp: '1 week ago',
    isRead: true,
    icon: 'info'
  }
];

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


  // Different menu items for Candidate vs Company
  const getCandidateMenuItems = () => [
    { id: 'personal', label: 'Personal Information', icon: <PersonIcon /> },
    { id: 'contact', label: 'Contact Information', icon: <ContactMailIcon /> },
    { id: 'resume', label: 'Resume & Documents', icon: <DescriptionIcon /> },
    { id: 'preferences', label: 'Job Preferences', icon: <WorkIcon /> },
    { id: 'notifications', label: 'Notifications', icon: <NotificationsIcon /> },
    { id: 'billing', label: 'Billing & Subscriptions', icon: <PaymentIcon /> },
  ];

  const getCompanyMenuItems = () => [
    { id: 'personal', label: 'Company Information', icon: <PersonIcon /> },
    { id: 'contact', label: 'Contact Information', icon: <ContactMailIcon /> },
    { id: 'notifications', label: 'Notifications', icon: <NotificationsIcon /> },
    { id: 'billing', label: 'Billing & Subscriptions', icon: <PaymentIcon /> },
  ];

  const menuItems = profile.profileType === 'Company' ? getCompanyMenuItems() : getCandidateMenuItems();

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
          {/* Sidebar */}
          <Card sx={{
            width: { xs: '100%', md: 280 },
            height: 'fit-content',
            borderRadius: 3,
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            position: { xs: 'relative', md: 'sticky' },
            top: 20,
          }}>
            <CardContent sx={{ p: 0 }}>
              {menuItems.map((item) => (
                <Box
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    router.push(`/settings/profile?tab=${item.id}`, undefined, { shallow: true });
                  }}
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

              <Divider sx={{ my: 1 }} />

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  p: 2.5,
                  cursor: 'pointer',
                  color: '#6b7280',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(131, 16, 255, 0.04)',
                    color: '#8310FF',
                  },
                }}
              >
                <HelpIcon />
                <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>
                  Help & Support
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Main Content */}
          <Box sx={{ flex: 1 }}>
            {activeTab === 'personal' && (
              <Card sx={{
                borderRadius: 3,
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                mb: 3,
              }}>
                <CardContent sx={{ p: 4 }}>
                  {/* Header */}
                  <Box sx={{
                    backgroundColor: 'rgba(131, 16, 255, 0.04)',
                    p: 3,
                    borderRadius: 2,
                    mb: 4
                  }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 0.5 }}>
                      {profile.profileType === 'Company' ? 'Company Information' : 'Personal Information'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6b7280' }}>
                      {profile.profileType === 'Company'
                        ? 'Manage your company details and profile information'
                        : 'Manage your personal details and profile information'
                      }
                    </Typography>
                  </Box>

                  {/* Loading State */}
                  {loading && !profile.firstName && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                      <CircularProgress sx={{ color: '#8310FF' }} />
                    </Box>
                  )}

                  {saveSuccess && (
                    <Alert severity="success" sx={{ mb: 3 }}>
                      Profile updated successfully!
                    </Alert>
                  )}

                  {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                      {error}
                    </Alert>
                  )}

                  {/* Only show content when not in initial loading state */}
                  {(!loading || profile.firstName) && (
                    <>

                      {/* Profile Picture Section */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
                        <Box sx={{ position: 'relative' }}>
                          <Avatar
                            src={profile.avatar}
                            alt={`${profile.firstName} ${profile.lastName}`}
                            sx={{
                              width: 100,
                              height: 100,
                              border: '4px solid #8310FF',
                              boxShadow: '0 4px 12px rgba(131, 16, 255, 0.2)',
                            }}
                          >
                            {profile.profileType === 'Company'
                              ? (profile.name || profile.companyName)?.charAt(0)?.toUpperCase() || 'C'
                              : `${profile.firstName?.charAt(0)}${profile.lastName?.charAt(0)}`
                            }
                          </Avatar>
                          <input
                            accept="image/*"
                            style={{ display: 'none' }}
                            id="profile-picture-upload"
                            type="file"
                            onChange={handleImageUpload}
                            disabled={uploadingImage}
                          />
                          <label htmlFor="profile-picture-upload">
                            <IconButton
                              component="span"
                              disabled={uploadingImage}
                              sx={{
                                position: 'absolute',
                                bottom: -5,
                                right: -5,
                                backgroundColor: '#8310FF',
                                color: 'white',
                                width: 36,
                                height: 36,
                                '&:hover': {
                                  backgroundColor: '#6a0dd4',
                                },
                                '&.Mui-disabled': {
                                  backgroundColor: '#9ca3af',
                                },
                              }}
                            >
                              {uploadingImage ? (
                                <CircularProgress size={18} sx={{ color: 'white' }} />
                              ) : (
                                <PhotoCameraIcon sx={{ fontSize: 18 }} />
                              )}
                            </IconButton>
                          </label>
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                            {profile.profileType === 'Company'
                              ? profile.name || profile.companyName || 'Company Name'
                              : `${profile.firstName} ${profile.lastName}`
                            }
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                            {profile.email}
                          </Typography>

                          {/* Company-specific details */}
                          {profile.profileType === 'Company' && (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 1 }}>
                              {profile.industry && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <Typography variant="caption" sx={{ color: '#9ca3af', fontWeight: 500 }}>
                                    Industry:
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600 }}>
                                    {profile.industry}
                                  </Typography>
                                </Box>
                              )}
                              {(profile.size || profile.companySize) && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <Typography variant="caption" sx={{ color: '#9ca3af', fontWeight: 500 }}>
                                    Size:
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600 }}>
                                    {profile.size || profile.companySize}
                                  </Typography>
                                </Box>
                              )}
                              {profile.location && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <Typography variant="caption" sx={{ color: '#9ca3af', fontWeight: 500 }}>
                                    Location:
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600 }}>
                                    {profile.location}
                                  </Typography>
                                </Box>
                              )}
                              {profile.employmentType && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <Typography variant="caption" sx={{ color: '#9ca3af', fontWeight: 500 }}>
                                    Type:
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600 }}>
                                    {profile.employmentType}
                                  </Typography>
                                </Box>
                              )}
                              {profile.requiredExperienceLevel && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <Typography variant="caption" sx={{ color: '#9ca3af', fontWeight: 500 }}>
                                    Experience:
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600 }}>
                                    {profile.requiredExperienceLevel}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          )}

                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<EditIcon />}
                            onClick={() => setIsEditing(!isEditing)}
                            sx={{
                              borderColor: '#8310FF',
                              color: '#8310FF',
                              textTransform: 'none',
                              '&:hover': {
                                borderColor: '#6a0dd4',
                                backgroundColor: 'rgba(131, 16, 255, 0.04)',
                              },
                            }}
                          >
                            {isEditing ? 'Cancel' : 'Edit'}
                          </Button>
                        </Box>
                      </Box>

                      <Divider sx={{ my: 3 }} />

                      {/* Form Fields - Different for Candidate vs Company */}
                      {profile.profileType === 'Candidate' ? (
                        // Candidate Fields - All Editable
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
                          <TextField
                            label="Username"
                            value={profile.username}
                            onChange={(e) => handleInputChange('username', e.target.value)}
                            disabled={!isEditing}
                            fullWidth
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '&.Mui-focused fieldset': {
                                  borderColor: '#8310FF',
                                },
                              },
                              '& .MuiInputLabel-root.Mui-focused': {
                                color: '#8310FF',
                              },
                            }}
                          />

                          <TextField
                            label="Email"
                            value={profile.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            disabled={!isEditing}
                            fullWidth
                            type="email"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '&.Mui-focused fieldset': {
                                  borderColor: '#8310FF',
                                },
                              },
                              '& .MuiInputLabel-root.Mui-focused': {
                                color: '#8310FF',
                              },
                            }}
                          />

                          <TextField
                            label="First Name"
                            value={profile.firstName}
                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                            disabled={!isEditing}
                            fullWidth
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '&.Mui-focused fieldset': {
                                  borderColor: '#8310FF',
                                },
                              },
                              '& .MuiInputLabel-root.Mui-focused': {
                                color: '#8310FF',
                              },
                            }}
                          />

                          <TextField
                            label="Last Name"
                            value={profile.lastName}
                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                            disabled={!isEditing}
                            fullWidth
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '&.Mui-focused fieldset': {
                                  borderColor: '#8310FF',
                                },
                              },
                              '& .MuiInputLabel-root.Mui-focused': {
                                color: '#8310FF',
                              },
                            }}
                          />

                          <FormControl fullWidth disabled={!isEditing}>
                            <InputLabel>Gender</InputLabel>
                            <Select
                              value={profile.gender}
                              onChange={(e) => handleSelectChange(e, 'gender')}
                              label="Gender"
                              sx={{
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#8310FF',
                                },
                              }}
                            >
                              <MenuItem value="Male">Male</MenuItem>
                              <MenuItem value="Female">Female</MenuItem>
                              <MenuItem value="Prefer not to say">Prefer not to say</MenuItem>
                            </Select>
                          </FormControl>

                          <FormControl fullWidth disabled={!isEditing}>
                            <InputLabel>Country</InputLabel>
                            <Select
                              value={profile.country}
                              onChange={(e) => handleSelectChange(e, 'country')}
                              label="Country"
                              sx={{
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#8310FF',
                                },
                              }}
                            >
                              {countries.map((country) => (
                                <MenuItem key={country} value={country}>
                                  {country}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>

                          <FormControl fullWidth disabled={!isEditing}>
                            <InputLabel>Language</InputLabel>
                            <Select
                              value={profile.language}
                              onChange={(e) => handleSelectChange(e, 'language')}
                              label="Language"
                              sx={{
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#8310FF',
                                },
                              }}
                            >
                              {languages.map((lang) => (
                                <MenuItem key={lang} value={lang}>
                                  {lang}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>

                          <FormControl fullWidth disabled={!isEditing}>
                            <InputLabel>Time Zone</InputLabel>
                            <Select
                              value={profile.timezone}
                              onChange={(e) => handleSelectChange(e, 'timezone')}
                              label="Time Zone"
                              sx={{
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#8310FF',
                                },
                              }}
                            >
                              {timezones.map((tz) => (
                                <MenuItem key={tz} value={tz}>
                                  {tz}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>

                          <FormControl fullWidth disabled={!isEditing}>
                            <InputLabel>Experience Level</InputLabel>
                            <Select
                              value={profile.requiredExperienceLevel}
                              onChange={(e) => handleSelectChange(e, 'requiredExperienceLevel')}
                              label="Experience Level"
                              sx={{
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#8310FF',
                                },
                              }}
                            >
                              {experienceLevels.map((level) => (
                                <MenuItem key={level} value={level}>
                                  {level}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>

                          <TextField
                            label="Target Role"
                            value={profile.targetRole}
                            onChange={(e) => handleInputChange('targetRole', e.target.value)}
                            disabled={!isEditing}
                            fullWidth
                            placeholder="e.g., Software Engineer, Product Manager"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '&.Mui-focused fieldset': {
                                  borderColor: '#8310FF',
                                },
                              },
                              '& .MuiInputLabel-root.Mui-focused': {
                                color: '#8310FF',
                              },
                            }}
                          />
                        </Box>
                      ) : (
                        // Company Fields - Only Username
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 3 }}>
                          <TextField
                            label="Username"
                            value={profile.username}
                            onChange={(e) => handleInputChange('username', e.target.value)}
                            disabled={!isEditing}
                            fullWidth
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '&.Mui-focused fieldset': {
                                  borderColor: '#8310FF',
                                },
                              },
                              '& .MuiInputLabel-root.Mui-focused': {
                                color: '#8310FF',
                              },
                            }}
                          />
                        </Box>
                      )}

                      {/* Editable Company Fields */}
                      {profile.profileType === 'Company' && (
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3, mt: 4 }}>
                          <TextField
                            label="Company Email"
                            value={profile.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            disabled={!isEditing}
                            fullWidth
                            type="email"
                            sx={{
                              gridColumn: { xs: '1 / -1', sm: 'span 2' },
                              '& .MuiOutlinedInput-root': {
                                '&.Mui-focused fieldset': {
                                  borderColor: '#8310FF',
                                },
                              },
                              '& .MuiInputLabel-root.Mui-focused': {
                                color: '#8310FF',
                              },
                            }}
                          />

                          <TextField
                            label="Company Name"
                            value={profile.name || profile.companyName}
                            onChange={(e) => {
                              handleInputChange('name', e.target.value);
                              handleInputChange('companyName', e.target.value);
                            }}
                            disabled={!isEditing}
                            fullWidth
                            sx={{
                              gridColumn: { xs: '1 / -1', sm: 'span 2' },
                              '& .MuiOutlinedInput-root': {
                                '&.Mui-focused fieldset': {
                                  borderColor: '#8310FF',
                                },
                              },
                              '& .MuiInputLabel-root.Mui-focused': {
                                color: '#8310FF',
                              },
                            }}
                          />

                          <FormControl
                            fullWidth
                            disabled={!isEditing}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '&.Mui-focused fieldset': {
                                  borderColor: '#8310FF',
                                },
                              },
                              '& .MuiInputLabel-root.Mui-focused': {
                                color: '#8310FF',
                              },
                            }}
                          >
                            <InputLabel>Industry</InputLabel>
                            <Select
                              value={profile.industry || ''}
                              onChange={(e) => handleSelectChange(e, 'industry')}
                              label="Industry"
                            >
                              {industries.map((ind) => (
                                <MenuItem key={ind} value={ind}>{ind}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>

                          <FormControl
                            fullWidth
                            disabled={!isEditing}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '&.Mui-focused fieldset': {
                                  borderColor: '#8310FF',
                                },
                              },
                              '& .MuiInputLabel-root.Mui-focused': {
                                color: '#8310FF',
                              },
                            }}
                          >
                            <InputLabel>Company Size</InputLabel>
                            <Select
                              value={profile.size || profile.companySize || ''}
                              onChange={(e) => {
                                handleSelectChange(e, 'size');
                                handleSelectChange(e, 'companySize');
                              }}
                              label="Company Size"
                            >
                              {companySizes.map((size) => (
                                <MenuItem key={size} value={size}>{size}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>

                          <TextField
                            label="Location"
                            value={profile.location}
                            onChange={(e) => handleInputChange('location', e.target.value)}
                            disabled={!isEditing}
                            fullWidth
                            placeholder="Paris, France"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '&.Mui-focused fieldset': {
                                  borderColor: '#8310FF',
                                },
                              },
                              '& .MuiInputLabel-root.Mui-focused': {
                                color: '#8310FF',
                              },
                            }}
                          />

                          <FormControl
                            fullWidth
                            disabled={!isEditing}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '&.Mui-focused fieldset': {
                                  borderColor: '#8310FF',
                                },
                              },
                              '& .MuiInputLabel-root.Mui-focused': {
                                color: '#8310FF',
                              },
                            }}
                          >
                            <InputLabel>Employment Type</InputLabel>
                            <Select
                              value={profile.employmentType || 'Remote'}
                              onChange={(e) => handleSelectChange(e, 'employmentType')}
                              label="Employment Type"
                            >
                              {employmentTypes.map((type) => (
                                <MenuItem key={type} value={type}>{type}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>

                          <FormControl
                            fullWidth
                            disabled={!isEditing}
                            sx={{
                              gridColumn: { xs: '1 / -1', sm: 'span 2' },
                              '& .MuiOutlinedInput-root': {
                                '&.Mui-focused fieldset': {
                                  borderColor: '#8310FF',
                                },
                              },
                              '& .MuiInputLabel-root.Mui-focused': {
                                color: '#8310FF',
                              },
                            }}
                          >
                            <InputLabel>Required Experience Level</InputLabel>
                            <Select
                              value={profile.requiredExperienceLevel || 'Mid Level'}
                              onChange={(e) => handleSelectChange(e, 'requiredExperienceLevel')}
                              label="Required Experience Level"
                            >
                              {experienceLevels.map((level) => (
                                <MenuItem key={level} value={level}>{level}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Box>
                      )}

                      {isEditing && (
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
                          <Button
                            variant="outlined"
                            onClick={() => setIsEditing(false)}
                            sx={{
                              textTransform: 'none',
                              borderColor: '#d1d5db',
                              color: '#6b7280',
                              '&:hover': {
                                borderColor: '#9ca3af',
                                backgroundColor: 'rgba(107, 114, 128, 0.04)',
                              },
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="contained"
                            onClick={handleSaveProfile}
                            disabled={loading}
                            sx={{
                              textTransform: 'none',
                              backgroundColor: '#8310FF',
                              '&:hover': {
                                backgroundColor: '#6a0dd4',
                              },
                            }}
                          >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
                          </Button>
                        </Box>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Contact Information Tab */}
            {activeTab === 'contact' && (
              <Card sx={{
                borderRadius: 3,
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                mb: 3,
              }}>
                <CardContent sx={{ p: 4 }}>
                  {loading && !profile.username ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
                      <CircularProgress sx={{ color: '#8310FF' }} />
                    </Box>
                  ) : (
                    <>
                      {/* Header */}
                      <Box sx={{ mb: 4 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827' }}>
                            Contact Information
                          </Typography>

                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<EditIcon />}
                            onClick={() => setIsEditing(!isEditing)}
                            sx={{
                              borderColor: '#8310FF',
                              color: '#8310FF',
                              textTransform: 'none',
                              '&:hover': {
                                borderColor: '#6a0dd4',
                                backgroundColor: 'rgba(131, 16, 255, 0.04)',
                              },
                            }}
                          >
                            {isEditing ? 'Cancel' : 'Edit'}
                          </Button>
                        </Box>
                        <Typography variant="body2" sx={{ color: '#6b7280' }}>
                          {profile.profileType === 'Company'
                            ? 'Manage your company contact details and professional presence'
                            : 'Manage your contact details and social profiles'
                          }
                        </Typography>
                      </Box>

                      <Divider sx={{ my: 3 }} />

                      {/* Contact Information Fields - Different for Candidate vs Company */}
                      {profile.profileType === 'Candidate' ? (
                        // Candidate Contact Fields
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
                          <TextField
                            label="Email"
                            value={profile.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            disabled={!isEditing}
                            fullWidth
                            type="email"
                            sx={{
                              gridColumn: { xs: '1 / -1', sm: 'span 2' },
                              '& .MuiOutlinedInput-root': {
                                '&.Mui-focused fieldset': {
                                  borderColor: '#8310FF',
                                },
                              },
                              '& .MuiInputLabel-root.Mui-focused': {
                                color: '#8310FF',
                              },
                            }}
                          />

                          <TextField
                            label="Phone Number"
                            value={profile.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            disabled={!isEditing}
                            fullWidth
                            type="tel"
                            placeholder="+33612345678"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '&.Mui-focused fieldset': {
                                  borderColor: '#8310FF',
                                },
                              },
                              '& .MuiInputLabel-root.Mui-focused': {
                                color: '#8310FF',
                              },
                            }}
                          />

                          <TextField
                            label="Location"
                            value={profile.location}
                            onChange={(e) => handleInputChange('location', e.target.value)}
                            disabled={!isEditing}
                            fullWidth
                            placeholder="Paris, France"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '&.Mui-focused fieldset': {
                                  borderColor: '#8310FF',
                                },
                              },
                              '& .MuiInputLabel-root.Mui-focused': {
                                color: '#8310FF',
                              },
                            }}
                          />

                          <TextField
                            label="Address"
                            value={profile.address}
                            onChange={(e) => handleInputChange('address', e.target.value)}
                            disabled={!isEditing}
                            fullWidth
                            multiline
                            rows={2}
                            placeholder="123 Rue de Paris"
                            sx={{
                              gridColumn: { xs: '1 / -1', sm: 'span 2' },
                              '& .MuiOutlinedInput-root': {
                                '&.Mui-focused fieldset': {
                                  borderColor: '#8310FF',
                                },
                              },
                              '& .MuiInputLabel-root.Mui-focused': {
                                color: '#8310FF',
                              },
                            }}
                          />

                          <TextField
                            label="LinkedIn URL"
                            value={profile.linkedinUrl}
                            onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
                            disabled={!isEditing}
                            fullWidth
                            type="url"
                            placeholder="https://linkedin.com/in/yourprofile"
                            sx={{
                              gridColumn: { xs: '1 / -1', sm: 'span 2' },
                              '& .MuiOutlinedInput-root': {
                                '&.Mui-focused fieldset': {
                                  borderColor: '#8310FF',
                                },
                              },
                              '& .MuiInputLabel-root.Mui-focused': {
                                color: '#8310FF',
                              },
                            }}
                          />

                          <TextField
                            label="GitHub URL"
                            value={profile.githubUrl}
                            onChange={(e) => handleInputChange('githubUrl', e.target.value)}
                            disabled={!isEditing}
                            fullWidth
                            type="url"
                            placeholder="https://github.com/yourprofile"
                            sx={{
                              gridColumn: { xs: '1 / -1', sm: 'span 2' },
                              '& .MuiOutlinedInput-root': {
                                '&.Mui-focused fieldset': {
                                  borderColor: '#8310FF',
                                },
                              },
                              '& .MuiInputLabel-root.Mui-focused': {
                                color: '#8310FF',
                              },
                            }}
                          />

                          <TextField
                            label="Personal Website"
                            value={profile.personalWebsite}
                            onChange={(e) => handleInputChange('personalWebsite', e.target.value)}
                            disabled={!isEditing}
                            fullWidth
                            type="url"
                            placeholder="https://yourwebsite.com"
                            sx={{
                              gridColumn: { xs: '1 / -1', sm: 'span 2' },
                              '& .MuiOutlinedInput-root': {
                                '&.Mui-focused fieldset': {
                                  borderColor: '#8310FF',
                                },
                              },
                              '& .MuiInputLabel-root.Mui-focused': {
                                color: '#8310FF',
                              },
                            }}
                          />
                        </Box>
                      ) : (
                        // Company Contact Fields
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
                          <TextField
                            label="Company Email"
                            value={profile.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            disabled={!isEditing}
                            fullWidth
                            type="email"
                            sx={{
                              gridColumn: { xs: '1 / -1', sm: 'span 2' },
                              '& .MuiOutlinedInput-root': {
                                '&.Mui-focused fieldset': {
                                  borderColor: '#8310FF',
                                },
                              },
                              '& .MuiInputLabel-root.Mui-focused': {
                                color: '#8310FF',
                              },
                            }}
                          />

                          <TextField
                            label="Main Phone Number"
                            value={profile.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            disabled={!isEditing}
                            fullWidth
                            type="tel"
                            placeholder="+33123456789"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '&.Mui-focused fieldset': {
                                  borderColor: '#8310FF',
                                },
                              },
                              '& .MuiInputLabel-root.Mui-focused': {
                                color: '#8310FF',
                              },
                            }}
                          />

                          <TextField
                            label="Location"
                            value={profile.location}
                            onChange={(e) => handleInputChange('location', e.target.value)}
                            disabled={!isEditing}
                            fullWidth
                            placeholder="Paris, France"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '&.Mui-focused fieldset': {
                                  borderColor: '#8310FF',
                                },
                              },
                              '& .MuiInputLabel-root.Mui-focused': {
                                color: '#8310FF',
                              },
                            }}
                          />

                          <TextField
                            label="Company Address"
                            value={profile.address}
                            onChange={(e) => handleInputChange('address', e.target.value)}
                            disabled={!isEditing}
                            fullWidth
                            multiline
                            rows={2}
                            placeholder="123 Business Avenue, Suite 100"
                            sx={{
                              gridColumn: { xs: '1 / -1', sm: 'span 2' },
                              '& .MuiOutlinedInput-root': {
                                '&.Mui-focused fieldset': {
                                  borderColor: '#8310FF',
                                },
                              },
                              '& .MuiInputLabel-root.Mui-focused': {
                                color: '#8310FF',
                              },
                            }}
                          />

                          <TextField
                            label="LinkedIn Company Page"
                            value={profile.linkedinUrl}
                            onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
                            disabled={!isEditing}
                            fullWidth
                            type="url"
                            placeholder="https://linkedin.com/company/yourcompany"
                            sx={{
                              gridColumn: { xs: '1 / -1', sm: 'span 2' },
                              '& .MuiOutlinedInput-root': {
                                '&.Mui-focused fieldset': {
                                  borderColor: '#8310FF',
                                },
                              },
                              '& .MuiInputLabel-root.Mui-focused': {
                                color: '#8310FF',
                              },
                            }}
                          />

                          <TextField
                            label="Company Website"
                            value={profile.personalWebsite}
                            onChange={(e) => handleInputChange('personalWebsite', e.target.value)}
                            disabled={!isEditing}
                            fullWidth
                            type="url"
                            placeholder="https://yourcompany.com"
                            sx={{
                              gridColumn: { xs: '1 / -1', sm: 'span 2' },
                              '& .MuiOutlinedInput-root': {
                                '&.Mui-focused fieldset': {
                                  borderColor: '#8310FF',
                                },
                              },
                              '& .MuiInputLabel-root.Mui-focused': {
                                color: '#8310FF',
                              },
                            }}
                          />
                        </Box>
                      )}

                      {isEditing && (
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
                          <Button
                            variant="outlined"
                            onClick={() => setIsEditing(false)}
                            sx={{
                              textTransform: 'none',
                              borderColor: '#d1d5db',
                              color: '#6b7280',
                              '&:hover': {
                                borderColor: '#9ca3af',
                                backgroundColor: 'rgba(107, 114, 128, 0.04)',
                              },
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="contained"
                            onClick={handleSaveProfile}
                            disabled={loading}
                            sx={{
                              textTransform: 'none',
                              backgroundColor: '#8310FF',
                              '&:hover': {
                                backgroundColor: '#6a0dd4',
                              },
                            }}
                          >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
                          </Button>
                        </Box>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (() => {
              const totalNotifications = staticNotifications.length;
              const unreadNotifications = staticNotifications.filter(n => !n.isRead).length;
              const thisWeekNotifications = staticNotifications.filter(n =>
                n.timestamp.includes('hour') || n.timestamp.includes('day') || n.timestamp.includes('days')
              ).length;
              const importantNotifications = staticNotifications.filter(n => n.type === 'warning').length;

              const getNotificationIcon = (type: string) => {
                switch(type) {
                  case 'success': return <CheckCircleIcon />;
                  case 'warning': return <WarningIcon />;
                  case 'error': return <ErrorIcon />;
                  default: return <InfoIcon />;
                }
              };

              const getNotificationColor = (type: string) => {
                switch(type) {
                  case 'success': return { bg: '#d1fae5', color: '#065f46', border: '#6ee7b7' };
                  case 'warning': return { bg: '#fef3c7', color: '#92400e', border: '#fcd34d' };
                  case 'error': return { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' };
                  default: return { bg: '#dbeafe', color: '#1e40af', border: '#93c5fd' };
                }
              };

              return (
                <Card sx={{
                  borderRadius: 3,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  mb: 3,
                }}>
                  <CardContent sx={{ p: 4 }}>
                    {/* Header */}
                    <Box sx={{
                      backgroundColor: 'rgba(131, 16, 255, 0.04)',
                      p: 3,
                      borderRadius: 2,
                      mb: 4
                    }}>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 0.5 }}>
                        Notification History
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#6b7280' }}>
                        View and manage all your notifications
                      </Typography>
                    </Box>

                    {/* Notification Stats */}
                    <Box sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: 'repeat(4, 1fr)' },
                      gap: 2,
                      mb: 4
                    }}>
                      <Box sx={{
                        p: 3,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        textAlign: 'center'
                      }}>
                        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>{totalNotifications}</Typography>
                        <Typography variant="body2">Total</Typography>
                      </Box>
                      <Box sx={{
                        p: 3,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                        color: 'white',
                        textAlign: 'center'
                      }}>
                        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>{unreadNotifications}</Typography>
                        <Typography variant="body2">Unread</Typography>
                      </Box>
                      <Box sx={{
                        p: 3,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                        color: 'white',
                        textAlign: 'center'
                      }}>
                        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>{thisWeekNotifications}</Typography>
                        <Typography variant="body2">This Week</Typography>
                      </Box>
                      <Box sx={{
                        p: 3,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                        color: 'white',
                        textAlign: 'center'
                      }}>
                        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>{importantNotifications}</Typography>
                        <Typography variant="body2">Important</Typography>
                      </Box>
                    </Box>

                    {/* Notifications List */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {staticNotifications.map((notification) => {
                        const colors = getNotificationColor(notification.type);
                        return (
                          <Box
                            key={notification.id}
                            sx={{
                              p: 3,
                              borderRadius: 2,
                              border: `1px solid ${colors.border}`,
                              backgroundColor: notification.isRead ? '#ffffff' : colors.bg,
                              display: 'flex',
                              gap: 2,
                              transition: 'all 0.2s',
                              '&:hover': {
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                transform: 'translateY(-2px)'
                              }
                            }}
                          >
                            <Box sx={{
                              width: 48,
                              height: 48,
                              borderRadius: '50%',
                              backgroundColor: colors.bg,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: colors.color,
                              flexShrink: 0
                            }}>
                              {getNotificationIcon(notification.type)}
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 0.5 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
                                  {notification.title}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#6b7280' }}>
                                  <AccessTimeIcon sx={{ fontSize: 16 }} />
                                  <Typography variant="caption">{notification.timestamp}</Typography>
                                </Box>
                              </Box>
                              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                                {notification.message}
                              </Typography>
                              {!notification.isRead && (
                                <Box sx={{ mt: 1 }}>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: '#8310FF',
                                      fontWeight: 600,
                                      backgroundColor: 'rgba(131, 16, 255, 0.1)',
                                      px: 1.5,
                                      py: 0.5,
                                      borderRadius: 1,
                                      display: 'inline-block'
                                    }}
                                  >
                                    NEW
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          </Box>
                        );
                      })}
                    </Box>
                  </CardContent>
                </Card>
              );
            })()}

            {/* Placeholder for other tabs */}
            {activeTab !== 'personal' && activeTab !== 'contact' && activeTab !== 'notifications' && (
              <Card sx={{
                borderRadius: 3,
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                mb: 3,
              }}>
                <CardContent sx={{ p: 6, textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ color: '#6b7280', mb: 2 }}>
                    {menuItems.find(item => item.id === activeTab)?.label}
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
