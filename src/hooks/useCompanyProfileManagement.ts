import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { SelectChangeEvent } from '@mui/material';
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
      // Construct avatar URL
      let avatarUrl = '';
      if (user.user_image) {
        avatarUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}images/Users/${user.user_image}`;
      }

      // Normalize company size from backend format to frontend format
      // Backend: "11–50 employees" -> Frontend: "11-50"
      const normalizeCompanySize = (size: string | undefined): string => {
        if (!size) return '';
        // Remove " employees" suffix and replace en-dash with hyphen
        return size.replace(/\s*employees?$/i, '').replace(/–/g, '-');
      };

      const normalizedSize = normalizeCompanySize(reduxProfile.companyDetails?.size);

      setProfile({
        username: user.username || '',
        email: user.email || reduxProfile.companyDetails?.email || '',
        requiredExperienceLevel: reduxProfile.companyDetails?.requiredExperienceLevel || 'Mid Level',
        targetRole: '',
        firstName: '',
        lastName: '',
        gender: 'Male',
        country: reduxProfile.companyDetails?.location || 'Tunisia',
        language: 'English',
        timezone: 'UTC+01:00',
        phone: reduxProfile.contactInformation?.phone || '',
        address: reduxProfile.contactInformation?.address || '',
        linkedinUrl: reduxProfile.contactInformation?.linkedinUrl || '',
        githubUrl: '',
        personalWebsite: reduxProfile.contactInformation?.personalWebsite || '',
        location: reduxProfile.contactInformation?.location || reduxProfile.companyDetails?.location || '',
        avatar: avatarUrl,
        profileType: 'Company',
        companyName: reduxProfile.companyDetails?.name || '',
        name: reduxProfile.companyDetails?.name || '',
        industry: reduxProfile.companyDetails?.industry || '',
        companySize: normalizedSize,
        size: normalizedSize,
        employmentType: reduxProfile.companyDetails?.employmentType || 'Remote',
        requiredSkills: reduxProfile.companyDetails?.requiredSkills || [],
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

  const handleInputChange = useCallback((field: keyof UserProfile, value: string) => {
    console.log('🟡 [handleInputChange] Field:', field, 'Value:', value);
    setProfile(prev => {
      const updated = { ...prev, [field]: value };
      console.log('🟡 [handleInputChange] Updated profile:', { name: updated.name, companyName: updated.companyName });
      return updated;
    });
  }, []);

  const handleSelectChange = useCallback((event: SelectChangeEvent<string>, field: keyof UserProfile) => {
    setProfile(prev => ({ ...prev, [field]: event.target.value }));
  }, []);

  const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
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

    setUploadingImage(true);
    try {
      const token = localStorage.getItem('api_token');
      const formData = new FormData();
      formData.append('profilePicture', file);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}profiles/uploadProfilePicture`,
        {
          method: 'POST',
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
    } catch (err: any) {
      console.error('Error uploading profile picture:', err);
      alert('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  }, [dispatch]);

  const handleSaveProfile = useCallback(async () => {
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
        // Company profile update - matches backend API structure
        const companyName = currentProfile.name?.trim() || currentProfile.companyName?.trim() || '';

        updatePayload.name = companyName;
        updatePayload.email = currentProfile.email?.trim() || '';
        updatePayload.industry = currentProfile.industry || '';
        updatePayload.size = currentProfile.size || currentProfile.companySize || '';
        updatePayload.location = currentProfile.location?.trim() || '';
        updatePayload.employmentType = currentProfile.employmentType || 'Remote';
        updatePayload.requiredSkills = currentProfile.requiredSkills || [];
        updatePayload.requiredExperienceLevel = currentProfile.requiredExperienceLevel || 'Mid Level';

        console.log('🟢 [useCompanyProfileManagement] Company name being sent:', companyName);
        console.log('🟢 [useCompanyProfileManagement] currentProfile.name:', currentProfile.name);
        console.log('🟢 [useCompanyProfileManagement] currentProfile.companyName:', currentProfile.companyName);
      } else if (activeTab === 'contact') {
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
          updatePayload.contactInformation = contactInfo;
        }
      }

      // Check if we have at least one field to update
      if (Object.keys(updatePayload).length === 0) {
        alert('Please fill in at least one field to update');
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
        } catch (err: any) {
          console.error('❌ [useCompanyProfileManagement] Error saving profile:', err);
          alert('Failed to save profile');
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
    userId: user?._id,

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
