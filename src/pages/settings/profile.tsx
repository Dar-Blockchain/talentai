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
} from '@mui/icons-material';
import { signOut } from 'next-auth/react';
import { clearProfile } from '@/store/slices/profileSlice';
import { logout, setLoggingOut } from '@/store/slices/authSlice';
import { resetRedirectState } from '@/utils/authRedirect';
import Cookies from 'js-cookie';
import Header from '@/components/Header';
import SimpleFooter from '@/components/SimpleFooter';

interface UserProfile {
  username: string;
  email: string;
  requiredExperienceLevel: string;
  targetRole: string;
  // Display-only fields (not sent to backend)
  firstName?: string;
  lastName?: string;
  gender?: string;
  country?: string;
  language?: string;
  timezone?: string;
  avatar?: string;
  profileType?: 'Candidate' | 'Company';
  // Company-specific fields
  companyName?: string;
  industry?: string;
  companySize?: string;
  location?: string;
}

const experienceLevels = [
  'Entry Level',
  'Junior',
  'Mid-Level',
  'Senior',
  'Lead',
  'Principal',
  'Executive'
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

  const [profile, setProfile] = useState<UserProfile>({
    username: '',
    email: '',
    requiredExperienceLevel: 'Mid-Level',
    targetRole: '',
    firstName: '',
    lastName: '',
    gender: 'Male',
    country: 'Tunisia',
    language: 'English',
    timezone: 'UTC+01:00',
    avatar: '',
    profileType: 'Candidate',
    companyName: '',
    industry: '',
    companySize: '',
    location: '',
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
          email: userData.email || user.email || '',
          requiredExperienceLevel: data.requiredExperienceLevel || 'Mid-Level',
          targetRole: data.targetRole || '',
          firstName: data.FirstName || userData.FirstName || user.username?.split(' ')[0] || '',
          lastName: data.LastName || userData.LastName || user.username?.split(' ')[1] || '',
          gender: data.gender || userData.gender || 'Male',
          country: data.country || data.companyDetails?.location || userData.country || 'Tunisia',
          language: data.language || userData.language || 'English',
          timezone: data.timezone || userData.timezone || 'UTC+01:00',
          avatar: avatarUrl,
          profileType: data.type || 'Candidate',
          // Company-specific fields
          companyName: data.companyDetails?.name || '',
          industry: data.companyDetails?.industry || '',
          companySize: data.companyDetails?.size || '',
          location: data.companyDetails?.location || '',
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

      // Build update payload with only the fields backend accepts
      const updatePayload: any = {};

      if (profile.username?.trim()) {
        updatePayload.username = profile.username.trim();
      }

      // Only include these fields for Candidates
      if (profile.profileType === 'Candidate') {
        if (profile.requiredExperienceLevel) {
          updatePayload.requiredExperienceLevel = profile.requiredExperienceLevel;
        }
        if (profile.targetRole?.trim()) {
          updatePayload.targetRole = profile.targetRole.trim();
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

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      resetRedirectState();

      dispatch(clearProfile());
      dispatch(logout());

      localStorage.removeItem('api_token');
      Cookies.remove('api_token', { path: '/' });
      localStorage.clear();

      Object.keys(Cookies.get()).forEach(cookieName => {
        Cookies.remove(cookieName, { path: '/' });
      });

      signOut({ redirect: false }).catch(console.error);

      window.location.href = '/signin';
    } catch (error) {
      console.error('Logout failed:', error);
      setLoggingOut(true);
      resetRedirectState();
      window.location.href = '/signin';
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
    <Box sx={{ minHeight: '100vh', backgroundColor: '#F8F9FA' }}>
      <Header logo="/images/home/logocandidate.png"
        type="jobseeker"
        color="#8310FF"
        link="Are you hiring?" />

      <Container maxWidth="xl" sx={{ py: 4 }}>
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
                  onClick={() => setActiveTab(item.id)}
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
                              ? profile.companyName?.charAt(0)?.toUpperCase() || 'C'
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
                              ? profile.companyName || 'Company Name'
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
                              {profile.companySize && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <Typography variant="caption" sx={{ color: '#9ca3af', fontWeight: 500 }}>
                                    Size:
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600 }}>
                                    {profile.companySize}
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
                        // Candidate Fields
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

                      {/* Display-only fields - Different for Candidate vs Company */}
                      <Box sx={{ mt: 4 }}>
                        <Typography variant="subtitle2" sx={{ color: '#6b7280', mb: 2, fontWeight: 600 }}>
                          Additional Information (Read-only)
                        </Typography>

                        {profile.profileType === 'Candidate' ? (
                          // Candidate Read-only Fields
                          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
                            <TextField
                              label="Email"
                              value={profile.email}
                              disabled
                              fullWidth
                              type="email"
                              sx={{
                                gridColumn: { xs: '1 / -1', sm: 'span 2' },
                                '& .MuiInputBase-input.Mui-disabled': {
                                  WebkitTextFillColor: '#6b7280',
                                },
                              }}
                            />

                            <TextField
                              label="First Name"
                              value={profile.firstName}
                              disabled
                              fullWidth
                              sx={{
                                '& .MuiInputBase-input.Mui-disabled': {
                                  WebkitTextFillColor: '#6b7280',
                                },
                              }}
                            />

                            <TextField
                              label="Last Name"
                              value={profile.lastName}
                              disabled
                              fullWidth
                              sx={{
                                '& .MuiInputBase-input.Mui-disabled': {
                                  WebkitTextFillColor: '#6b7280',
                                },
                              }}
                            />

                            <TextField
                              label="Gender"
                              value={profile.gender}
                              disabled
                              fullWidth
                              sx={{
                                '& .MuiInputBase-input.Mui-disabled': {
                                  WebkitTextFillColor: '#6b7280',
                                },
                              }}
                            />

                            <TextField
                              label="Country"
                              value={profile.country}
                              disabled
                              fullWidth
                              sx={{
                                '& .MuiInputBase-input.Mui-disabled': {
                                  WebkitTextFillColor: '#6b7280',
                                },
                              }}
                            />

                            <TextField
                              label="Language"
                              value={profile.language}
                              disabled
                              fullWidth
                              sx={{
                                '& .MuiInputBase-input.Mui-disabled': {
                                  WebkitTextFillColor: '#6b7280',
                                },
                              }}
                            />

                            <TextField
                              label="Time Zone"
                              value={profile.timezone}
                              disabled
                              fullWidth
                              sx={{
                                '& .MuiInputBase-input.Mui-disabled': {
                                  WebkitTextFillColor: '#6b7280',
                                },
                              }}
                            />
                          </Box>
                        ) : (
                          // Company Read-only Fields
                          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
                            <TextField
                              label="Email"
                              value={profile.email}
                              disabled
                              fullWidth
                              type="email"
                              sx={{
                                gridColumn: { xs: '1 / -1', sm: 'span 2' },
                                '& .MuiInputBase-input.Mui-disabled': {
                                  WebkitTextFillColor: '#6b7280',
                                },
                              }}
                            />

                            <TextField
                              label="Company Name"
                              value={profile.companyName}
                              disabled
                              fullWidth
                              sx={{
                                gridColumn: { xs: '1 / -1', sm: 'span 2' },
                                '& .MuiInputBase-input.Mui-disabled': {
                                  WebkitTextFillColor: '#6b7280',
                                },
                              }}
                            />

                            <TextField
                              label="Industry"
                              value={profile.industry}
                              disabled
                              fullWidth
                              sx={{
                                '& .MuiInputBase-input.Mui-disabled': {
                                  WebkitTextFillColor: '#6b7280',
                                },
                              }}
                            />

                            <TextField
                              label="Company Size"
                              value={profile.companySize}
                              disabled
                              fullWidth
                              sx={{
                                '& .MuiInputBase-input.Mui-disabled': {
                                  WebkitTextFillColor: '#6b7280',
                                },
                              }}
                            />

                            <TextField
                              label="Location"
                              value={profile.location}
                              disabled
                              fullWidth
                              sx={{
                                gridColumn: { xs: '1 / -1', sm: 'span 2' },
                                '& .MuiInputBase-input.Mui-disabled': {
                                  WebkitTextFillColor: '#6b7280',
                                },
                              }}
                            />
                          </Box>
                        )}
                      </Box>

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

            {/* Placeholder for other tabs */}
            {activeTab !== 'personal' && (
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
