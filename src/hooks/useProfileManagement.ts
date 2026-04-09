import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { SelectChangeEvent } from '@mui/material';
import { useToast } from '@/hooks/useToast';
import { RootState, AppDispatch } from '@/store/store';
import { UserProfile } from '@/types/profile';
import { updateProfile as updateProfileAction, getMyProfile, uploadProfileImage } from '@/store/slices/userSlice';

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
  const { showToast } = useToast();
  const { user, profile: reduxProfile, loading } = useSelector((state: RootState) => state.user.connectedUser);

  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

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
        phone: reduxProfile.phone || reduxProfile.contactInformation?.phone || '',
        address: reduxProfile.address || reduxProfile.contactInformation?.address || '',
        linkedinUrl: reduxProfile.linkedinUrl || reduxProfile.contactInformation?.linkedinUrl || '',
        githubUrl: reduxProfile.githubUrl || reduxProfile.contactInformation?.githubUrl || '',
        personalWebsite: reduxProfile.personalWebsite || reduxProfile.contactInformation?.personalWebsite || '',
        location: reduxProfile.location || reduxProfile.contactInformation?.location || '',
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
        setSaveSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [saveSuccess]);

  // Validation helper function
  const validateField = (field: keyof UserProfile, value: string): string => {
    // Clear error when field is empty or only whitespace
    if (!value || !value.trim()) {
      return '';
    }

    switch (field) {
      case 'firstName':
      case 'lastName':
        if (value.trim().length < 2) {
          return 'Must be at least 2 characters';
        }
        break;
      case 'phone':
        if (!/^[\d\s+()-]+$/.test(value.trim())) {
          return 'Invalid phone number format';
        }
        break;
      case 'linkedinUrl':
        const linkedinPattern = /^(https?:\/\/)?(www\.)?linkedin\.com\/.+$/i;
        if (!linkedinPattern.test(value.trim())) {
          return 'Must be a valid LinkedIn URL (e.g., https://www.linkedin.com/in/username)';
        }
        break;
      case 'githubUrl':
        const githubPattern = /^(https?:\/\/)?(www\.)?github\.com\/.+$/i;
        if (!githubPattern.test(value.trim())) {
          return 'Must be a valid GitHub URL (e.g., https://github.com/username)';
        }
        break;
      case 'personalWebsite':
        const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
        if (!urlPattern.test(value.trim())) {
          return 'Invalid website URL';
        }
        break;
    }
    return '';
  };

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));

    // Validate field and update errors
    const error = validateField(field, value);
    setFieldErrors(prev => {
      if (error) {
        return { ...prev, [field]: error };
      } else {
        const { [field]: _, ...rest } = prev;
        return rest;
      }
    });
  };

  const handleSelectChange = (event: SelectChangeEvent<string>, field: keyof UserProfile) => {
    setProfile(prev => ({ ...prev, [field]: event.target.value }));
    // Clear any existing error for this field
    setFieldErrors(prev => {
      const { [field]: _, ...rest } = prev;
      return rest;
    });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast({ message: 'Please select a valid image file', severity: 'error' });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast({ message: 'Image size should be less than 5MB', severity: 'error' });
      return;
    }

    setUploadingImage(true);

    try {
      await dispatch(uploadProfileImage({ file })).unwrap();
      await dispatch(getMyProfile());
      setSaveSuccess(true);
      showToast({ message: 'Profile picture updated successfully!', severity: 'success' });
    } catch (err: any) {
      console.error('Error uploading profile picture:', err);
      showToast({ message: err?.message || 'Failed to upload image', severity: 'error' });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      // Check if there are any field errors
      if (Object.keys(fieldErrors).length > 0) {
        showToast({ message: 'Please fix the errors in the form before saving', severity: 'error' });
        return;
      }

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
          // Contact Information - nest under contactInformation object
          const contactInfo: any = {}

          if (profile.email?.trim()) {
            contactInfo.email = profile.email.trim();
          }
          if (profile.phone?.trim()) {
            contactInfo.phone = profile.phone.trim();
          }
          if (profile.location?.trim()) {
            contactInfo.location = profile.location.trim();
          }
          if (profile.address?.trim()) {
            contactInfo.address = profile.address.trim();
          }
          if (profile.linkedinUrl?.trim()) {
            contactInfo.linkedinUrl = profile.linkedinUrl.trim();
          }
          if (profile.githubUrl?.trim()) {
            contactInfo.githubUrl = profile.githubUrl.trim();
          }
          if (profile.personalWebsite?.trim()) {
            contactInfo.personalWebsite = profile.personalWebsite.trim();
          }

          // Only add contactInformation if at least one field is filled
          if (Object.keys(contactInfo).length > 0) {
            updatePayload.contactInformation = contactInfo;
          }
        }
      }

      // For Companies - use updateProfileAction with company-specific payload
      if (profile.profileType === 'Company') {
        if (activeTab === 'personal') {
          updatePayload.name = profile.name?.trim() || profile.companyName?.trim() || '';
          updatePayload.industry = profile.industry || '';
          updatePayload.size = profile.size || profile.companySize || '';
          updatePayload.employmentType = profile.employmentType || 'Remote';
          updatePayload.requiredExperienceLevel = profile.requiredExperienceLevel || 'Mid Level';
          updatePayload.requiredSkills = profile.requiredSkills || [];
        } else if (activeTab === 'contact') {
          updatePayload.email = profile.email?.trim() || '';
          updatePayload.linkedin = profile.linkedinUrl?.trim() || '';
          updatePayload.website = profile.personalWebsite?.trim() || '';
          updatePayload.location = profile.location?.trim() || '';
        }
      }

      // Check if we have at least one field to update
      if (Object.keys(updatePayload).length === 0) {
        showToast({ message: 'Please fill in at least one field to update', severity: 'warning' });
        return;
      }

      console.log('🔵 [useProfileManagement] Sending update payload:', JSON.stringify(updatePayload, null, 2));

      await dispatch(updateProfileAction(updatePayload)).unwrap();
      setIsEditing(false);
      await dispatch(getMyProfile());

      showToast({ message: 'Profile updated successfully!', severity: 'success' });
    } catch (err: any) {
      console.error('❌ [useProfileManagement] Error saving profile:', err);
      showToast({ message: err?.message || 'Failed to update profile. Please try again.', severity: 'error' });
    }
  };

  const handleDismissError = () => {
    setError(null);
  };

  const handleDismissSuccess = () => {
    setSaveSuccess(false);
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
    userId: user?._id || user?.id || reduxProfile?.userId?._id,
    fieldErrors,

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
