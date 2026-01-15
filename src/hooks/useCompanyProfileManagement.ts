import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { SelectChangeEvent } from '@mui/material';
import { toast } from 'react-toastify';
import { RootState, AppDispatch } from '@/store/store';
import { UserProfile } from '@/types/profile';
import {
  getMyProfile,
  updateProfile,
} from '@/store/slices/userSlice';

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
  profileType: 'Company',
  companyName: '',
  name: '',
  industry: '',
  companySize: '',
  size: '',
  employmentType: 'Remote',
  requiredSkills: [],
};

export const useCompanyProfileManagement = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const { user, profile: reduxProfile, loading, error } = useSelector(
    (state: RootState) => state.user.connectedUser
  );

  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Fetch profile on mount
  useEffect(() => {
    dispatch(getMyProfile());
  }, [dispatch]);

  // Handle tab parameter from URL query
  useEffect(() => {
    if (router.isReady && router.query.tab) {
      const tabParam = router.query.tab as string;
      if (['personal', 'contact', 'team'].includes(tabParam)) {
        setActiveTab(tabParam);
      }
    }
  }, [router.isReady, router.query.tab]);

  // Update local profile state when Redux profile changes
  useEffect(() => {
    if (reduxProfile && user) {
      console.log('🔍 [useCompanyProfileManagement] Redux profile structure:', {
        hasCompanyDetails: !!reduxProfile.companyDetails,
        companyDetailsKeys: reduxProfile.companyDetails ? Object.keys(reduxProfile.companyDetails) : [],
        topLevelKeys: Object.keys(reduxProfile),
        companyName: reduxProfile.companyDetails?.name,
        directName: reduxProfile.name,
        userId: reduxProfile.userId
      });

      // Construct avatar URL
      let avatarUrl = '';
      if (reduxProfile.user_image) {
        avatarUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}images/Users/${reduxProfile.user_image}`;
      } else if (user?.user_image) {
        avatarUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}images/Users/${user.user_image}`;
      }

      // Normalize company size from backend format to frontend format
      // Backend: "11–50 employees" -> Frontend: "11-50"
      const normalizeCompanySize = (size: string | undefined): string => {
        if (!size) return '';
        // Remove " employees" suffix and replace en-dash with hyphen
        return size.replace(/\s*employees?$/i, '').replace(/–/g, '-');
      };

      // Try multiple possible locations for company data
      const companyData = reduxProfile.companyDetails || reduxProfile;
      const normalizedSize = normalizeCompanySize(companyData?.size);

      // Extract company name from multiple possible locations
      const companyName = companyData?.name ||
                         reduxProfile.name ||
                         reduxProfile.userId?.username ||
                         user?.username ||
                         '';

      console.log('🔍 [useCompanyProfileManagement] Extracted company name:', companyName);

      setProfile({
        username: user.username || '',
        email: user.email || companyData?.email || '',
        requiredExperienceLevel: reduxProfile?.requiredExperienceLevel || companyData?.requiredExperienceLevel || 'Mid Level',
        targetRole: reduxProfile?.targetRole || '',
        firstName: '',
        lastName: '',
        gender: 'Male',
        country: companyData?.location || 'Tunisia',
        language: 'English',
        timezone: 'UTC+01:00',
        phone: reduxProfile.companyDetails?.phone || '',
        address: reduxProfile.companyDetails?.address || '',
        linkedinUrl: reduxProfile.companyDetails?.linkedinUrl || '',
        githubUrl: '',
        personalWebsite: reduxProfile.companyDetails?.personalWebsite || '',
        location: reduxProfile.companyDetails?.location || companyData?.location || '',
        avatar: avatarUrl,
        profileType: 'Company',
        companyName: companyName,
        name: companyName,
        industry: companyData?.industry || '',
        companySize: normalizedSize,
        size: normalizedSize,
        employmentType: companyData?.employmentType || 'Remote',
        requiredSkills: reduxProfile?.requiredSkills || companyData?.requiredSkills || [],
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
      case 'name':
      case 'companyName':
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
          return 'Must be a valid LinkedIn URL (e.g., https://www.linkedin.com/company/yourcompany)';
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

  const handleInputChange = useCallback((field: keyof UserProfile, value: string) => {
    console.log('🟡 [handleInputChange] Field:', field, 'Value:', value);
    setProfile(prev => {
      const updated = { ...prev, [field]: value };
      console.log('🟡 [handleInputChange] Updated profile:', { name: updated.name, companyName: updated.companyName });
      return updated;
    });

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
  }, []);

  const handleSelectChange = useCallback((event: SelectChangeEvent<string>, field: keyof UserProfile) => {
    setProfile(prev => ({ ...prev, [field]: event.target.value }));
    // Clear any existing error for this field
    setFieldErrors(prev => {
      const { [field]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setUploadingImage(true);

    try {
      const token = localStorage.getItem('api_token');
      const formData = new FormData();
      formData.append('user_image', file);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}profiles/updateProfileComplete`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      await dispatch(getMyProfile());
      setSaveSuccess(true);

      toast.success('Profile picture updated successfully!');
    } catch (err: any) {
      console.error('Error uploading profile picture:', err);
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  }, [dispatch]);

  const handleSaveProfile = useCallback(async () => {
    // Check if there are any field errors
    if (Object.keys(fieldErrors).length > 0) {
      toast.error('Please fix the errors in the form before saving');
      return;
    }

    // Use a functional update to get the latest profile state
    setProfile(currentProfile => {
      console.log('🟣 [handleSaveProfile] Current profile state:', {
        name: currentProfile.name,
        companyName: currentProfile.companyName,
        industry: currentProfile.industry,
        location: currentProfile.location
      });

      const updatePayload: any = {};

      if (activeTab === 'personal') {
        // Validation for company profile
        const companyName = currentProfile.name?.trim() || currentProfile.companyName?.trim() || '';

        if (companyName && companyName.length < 2) {
          toast.error('Company name must be at least 2 characters');
          return currentProfile;
        }

        // Company profile update - matches backend API structure
        updatePayload.name = companyName;
        updatePayload.email = currentProfile.email?.trim() || '';
        updatePayload.industry = currentProfile.industry || '';
        updatePayload.size = currentProfile.size || currentProfile.companySize || '';
        updatePayload.employmentType = currentProfile.employmentType || 'Remote';
        updatePayload.requiredSkills = currentProfile.requiredSkills || [];
        updatePayload.requiredExperienceLevel = currentProfile.requiredExperienceLevel || 'Mid Level';

        console.log('🟢 [useCompanyProfileManagement] Company name being sent:', companyName);
        console.log('🟢 [useCompanyProfileManagement] currentProfile.name:', currentProfile.name);
        console.log('🟢 [useCompanyProfileManagement] currentProfile.companyName:', currentProfile.companyName);
      } else if (activeTab === 'contact') {
        // Validation for contact information
        if (currentProfile.phone?.trim() && !/^[\d\s+()-]+$/.test(currentProfile.phone.trim())) {
          toast.error('Please enter a valid phone number');
          return currentProfile;
        }
        if (currentProfile.linkedinUrl?.trim()) {
          const linkedinPattern = /^(https?:\/\/)?(www\.)?linkedin\.com\/.+$/i;
          if (!linkedinPattern.test(currentProfile.linkedinUrl.trim())) {
            toast.error('Please enter a valid LinkedIn URL (e.g., https://www.linkedin.com/company/yourcompany)');
            return currentProfile;
          }
        }
        if (currentProfile.personalWebsite?.trim()) {
          const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
          if (!urlPattern.test(currentProfile.personalWebsite.trim())) {
            toast.error('Please enter a valid website URL');
            return currentProfile;
          }
        }

        // Contact Information - nest under contactInformation object
        const contactInfo: any = {};

        if (currentProfile.email?.trim()) {
          contactInfo.email = currentProfile.email.trim();
        }
        if (currentProfile.phone?.trim()) {
          contactInfo.phone = currentProfile.phone.trim();
        }
        if (currentProfile.location?.trim()) {
          contactInfo.location = currentProfile.location.trim();
        }
        if (currentProfile.address?.trim()) {
          contactInfo.address = currentProfile.address.trim();
        }
        if (currentProfile.linkedinUrl?.trim()) {
          contactInfo.linkedinUrl = currentProfile.linkedinUrl.trim();
        }
        if (currentProfile.personalWebsite?.trim()) {
          contactInfo.personalWebsite = currentProfile.personalWebsite.trim();
        }

        // Only add contactInformation if at least one field is filled
        if (Object.keys(contactInfo).length > 0) {
          updatePayload.companyDetails = contactInfo;
        }
      }

      // Check if we have at least one field to update
      if (Object.keys(updatePayload).length === 0) {
        toast.warning('Please fill in at least one field to update');
        return currentProfile;
      }

      console.log('🔵 [useCompanyProfileManagement] Sending update payload:', JSON.stringify(updatePayload, null, 2));
      console.log('🔵 [useCompanyProfileManagement] Active tab:', activeTab);
      console.log('🔵 [useCompanyProfileManagement] API endpoint: profiles/updateProfileComplete');

      // Perform the async operation
      (async () => {
        try {
          const updateResponse = await dispatch(updateProfile(updatePayload)).unwrap();
          console.log('✅ [useCompanyProfileManagement] Update response:', updateResponse);
          setIsEditing(false);
          setSaveSuccess(true);
          const freshProfile = await dispatch(getMyProfile()).unwrap();
          console.log('✅ [useCompanyProfileManagement] Fresh profile after update:', {
            username: freshProfile.user?.username,
            companyName: freshProfile.profile?.companyDetails?.name
          });

          toast.success('Profile updated successfully!');
        } catch (err: any) {
          console.error('❌ [useCompanyProfileManagement] Error saving profile:', err);
          toast.error(err?.message || 'Failed to update profile. Please try again.');
        }
      })();

      return currentProfile;
    });
  }, [activeTab, dispatch, setIsEditing, setSaveSuccess]);

  const handleDismissError = useCallback(() => {
    // Error is handled in Redux, no need to clear manually
  }, []);

  const handleDismissSuccess = useCallback(() => {
    setSaveSuccess(false);
  }, []);

  return {
    // State
    activeTab,
    isEditing,
    profile,
    loading,
    error,
    uploadingImage,
    saveSuccess,
    userId: user?._id || user?.id,
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
