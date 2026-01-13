import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { SelectChangeEvent } from '@mui/material';
import { RootState, AppDispatch } from '@/store/store';
import { UserProfile } from '@/types/profile';
import {
  getMyProfile,
  updateProfile as updateProfileAction,
  updateCompanyProfile,
  uploadProfilePicture,
  setSaveSuccess,
  clearError
} from '@/store/slices/profileSlice';

const initialProfile: UserProfile = {
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
};

export const useProfileManagement = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.user.connectedUser);
  const { profile: reduxProfile, loading, error, uploadingImage, saveSuccess } = useSelector(
    (state: RootState) => state.profile
  );

  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>(initialProfile);

  // Fetch profile on mount
  useEffect(() => {
    dispatch(getMyProfile());
  }, [dispatch]);

  // Handle tab parameter from URL query
  useEffect(() => {
    if (router.isReady && router.query.tab) {
      const tabParam = router.query.tab as string;
      if (['personal', 'contact', 'preferences', 'notifications', 'visibility'].includes(tabParam)) {
        setActiveTab(tabParam);
      }
    }
  }, [router.isReady, router.query.tab]);

  // Update local profile state when Redux profile changes
  useEffect(() => {
    if (reduxProfile) {
      const userData = reduxProfile.userId;

      // Construct avatar URL
      let avatarUrl = '';
      if (reduxProfile.user_image) {
        avatarUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}images/Users/${reduxProfile.user_image}`;
      } else if (userData?.user_image) {
        avatarUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}images/Users/${userData.user_image}`;
      }

      // For Candidates: Backend returns data at root level (firstName, lastName, country, language, timeZone)
      // Contact info is in contactInformation for both
      const isCompany = reduxProfile.type === 'Company';

      console.log('🔵 [useProfileManagement] Redux profile data:', {
        firstName: reduxProfile.firstName,
        lastName: reduxProfile.lastName,
        country: reduxProfile.country,
        language: reduxProfile.language,
        timeZone: reduxProfile.timeZone,
        timezone: reduxProfile.timezone,
        type: reduxProfile.type,
        targetRole: reduxProfile.targetRole,
        gender: reduxProfile.gender
      });

      setProfile({
        username: userData?.username || user.username || '',
        email: userData?.email || user.email || '',
        requiredExperienceLevel: reduxProfile.requiredExperienceLevel || 'Mid Level',
        targetRole: reduxProfile.targetRole ?? '',
        firstName: reduxProfile.firstName ?? '',
        lastName: reduxProfile.lastName ?? '',
        gender: reduxProfile.gender || 'Male',
        country: reduxProfile.country || 'Tunisia',
        language: reduxProfile.language || 'English',
        timezone: reduxProfile.timeZone || reduxProfile.timezone || 'UTC+01:00',
        phone: reduxProfile.contactInformation?.phone || '',
        address: reduxProfile.contactInformation?.address || '',
        linkedinUrl: reduxProfile.contactInformation?.linkedinUrl || '',
        githubUrl: reduxProfile.contactInformation?.githubUrl || '',
        personalWebsite: reduxProfile.contactInformation?.personalWebsite || '',
        location: reduxProfile.contactInformation?.location || '',
        avatar: avatarUrl,
        profileType: (isCompany ? 'Company' : 'Candidate') as 'Candidate' | 'Company',
        companyName: reduxProfile.companyDetails?.name || '',
        name: reduxProfile.companyDetails?.name || '',
        industry: reduxProfile.companyDetails?.industry || '',
        companySize: reduxProfile.companyDetails?.size || '',
        size: reduxProfile.companyDetails?.size || '',
        employmentType: reduxProfile.companyDetails?.employmentType || 'Remote',
        requiredSkills: reduxProfile.requiredSkills || [],
      });

      console.log('🟢 [useProfileManagement] Profile state set to:', {
        firstName: reduxProfile.firstName,
        lastName: reduxProfile.lastName,
        country: reduxProfile.country,
        language: reduxProfile.language,
        timezone: reduxProfile.timeZone || reduxProfile.timezone || 'UTC+01:00'
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
      await dispatch(getMyProfile());
    } catch (err: any) {
      console.error('Error uploading profile picture:', err);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const updatePayload: any = {};

      // Only include these fields for Candidates - matches backend API structure
      if (profile.profileType === 'Candidate') {
        if (activeTab === 'personal') {
          // Personal Information - matches backend structure
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
            updatePayload.timeZone = profile.timezone; // Note: backend uses 'timeZone' not 'timezone'
          }
          if (profile.requiredExperienceLevel) {
            updatePayload.requiredExperienceLevel = profile.requiredExperienceLevel;
          }
          if (profile.targetRole?.trim()) {
            updatePayload.targetRole = profile.targetRole.trim();
          }
        } else if (activeTab === 'contact') {
          // Contact Information - only fields that exist in backend
          // Note: Backend doesn't have contactInformation nested structure for candidates
          // These would need to be handled separately or added to the profile root
        }
      }

      // For Companies (this shouldn't be called from useProfileManagement but keeping for safety)
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
            requiredSkills: profile.requiredSkills || [],
          };

          await dispatch(updateCompanyProfile(companyPayload)).unwrap();
          setIsEditing(false);
          await dispatch(getMyProfile());
          return;
        } else if (activeTab === 'contact') {
          updatePayload.email = profile.email?.trim() || '';
          updatePayload.linkedin = profile.linkedinUrl?.trim() || '';
          updatePayload.website = profile.personalWebsite?.trim() || '';
          updatePayload.location = profile.location?.trim() || '';
        }
      }

      // Check if we have at least one field to update
      if (Object.keys(updatePayload).length === 0) {
        alert('Please fill in at least one field to update');
        return;
      }

      console.log('🔵 [useProfileManagement] Sending update payload:', JSON.stringify(updatePayload, null, 2));
      await dispatch(updateProfileAction(updatePayload)).unwrap();
      setIsEditing(false);
      await dispatch(getMyProfile());
    } catch (err: any) {
      console.error('❌ [useProfileManagement] Error saving profile:', err);
    }
  };

  const handleDismissError = () => {
    dispatch(clearError());
  };

  const handleDismissSuccess = () => {
    dispatch(setSaveSuccess(false));
  };

  return {
    // State
    activeTab,
    isEditing,
    profile,
    loading,
    error,
    uploadingImage,
    saveSuccess,
    userId: reduxProfile?.userId?._id,

    // Actions
    setActiveTab,
    setIsEditing,
    handleInputChange,
    handleSelectChange,
    handleImageUpload,
    handleSaveProfile,
    handleDismissError,
    handleDismissSuccess,
  };
};
