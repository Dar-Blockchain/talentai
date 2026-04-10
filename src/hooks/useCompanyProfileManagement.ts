import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { SelectChangeEvent } from '@mui/material';
import { useToast } from '@/hooks/useToast';
import { RootState, AppDispatch } from '@/store/store';
import { UserProfile } from '@/types/profile';
import {
  getMyProfile,
  updateProfile,
  uploadProfileImage,
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
  linkedin: '',
  githubUrl: '',
  personalWebsite: '',
  location: '',
  avatar: '',
  profileType: 'Company',
  companyName: '',
  name: '',
  website: '',
  industry: '',
  companySize: '',
  size: '',
  employmentType: 'Remote',
  requiredSkills: [],
};

export const useCompanyProfileManagement = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { showToast } = useToast();

  const { user, profile: reduxProfile, loading, error } = useSelector(
    (state: RootState) => state.user.connectedUser
  );

  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [savedProfile, setSavedProfile] = useState<UserProfile>(initialProfile);
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

      const synced: UserProfile = {
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
        linkedin: reduxProfile.companyDetails?.linkedin || '',
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
        website: reduxProfile.companyDetails?.website || companyData?.website || '',
        employmentType: companyData?.employmentType || 'Remote',
        requiredSkills: reduxProfile?.requiredSkills || companyData?.requiredSkills || [],
      };
      setSavedProfile(synced);
      if (!isEditing) {
        setProfile(synced);
      }
    }
  }, [reduxProfile, user, isEditing]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (saveSuccess) {
      const timer = setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [saveSuccess]);


  const REQUIRED_FIELDS: (keyof UserProfile)[] = [
    'industry',
    'employmentType',
    'size',
  ];

  const validateField = (field: keyof UserProfile, value: string): string => {
    const trimmedValue = value?.trim() || '';

    // 🔴 Required fields → must not be empty
    if (REQUIRED_FIELDS.includes(field) && !trimmedValue) {
      return 'This field is required';
    }

    // 🟡 Optional fields → skip validation if empty
    if (!trimmedValue) {
      return '';
    }

    switch (field) {
      case 'name':
      case 'companyName':
        if (trimmedValue.length < 2) {
          return 'Company name must be at least 2 characters';
        }
        if (trimmedValue.length > 100) {
          return 'Company name must be less than 100 characters';
        }
        if (!/^[a-zA-Z0-9\s&.,'-]+$/.test(trimmedValue)) {
          return 'Company name contains invalid characters';
        }
        break;

      case 'industry':
        if (trimmedValue.length < 2) {
          return 'Industry must be at least 2 characters';
        }
        break;

      case 'phone':
        if (!/^[\d\s+()-]+$/.test(trimmedValue)) {
          return 'Invalid phone number format';
        }
        break;

      case 'linkedin':
        if (!/^(https?:\/\/)?(www\.)?linkedin\.com\/.+$/i.test(trimmedValue)) {
          return 'Must be a valid LinkedIn URL (e.g., https://www.linkedin.com/company/yourcompany)';
        }
        break;

      case 'website':
        if (!/^(https?:\/\/).+/.test(trimmedValue)) {
          return 'Invalid website URL';
        }
        break;

      case 'employmentType':
        if (!['Remote', 'On-site', 'Hybrid'].includes(trimmedValue)) {
          return 'Invalid employment type';
        }
        break;

      case 'size':
        if (!['1-10', '11-50', '51-200', '201-500', '500+'].includes(trimmedValue)) {
          return 'Invalid company size';
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
      await dispatch(uploadProfileImage(file)).unwrap();
      await dispatch(getMyProfile());
      setSaveSuccess(true);
      showToast({ message: 'Profile picture updated successfully!', severity: 'success' });
    } catch (err: any) {
      console.error('Error uploading profile picture:', err);
      showToast({ message: err?.message || 'Failed to upload image', severity: 'error' });
    } finally {
      setUploadingImage(false);
    }
  }, [dispatch, showToast]);
  const validateForm = (profile: UserProfile): Record<string, string> => {
    const errors: Record<string, string> = {};

    (Object.keys(profile) as (keyof UserProfile)[]).forEach((field) => {
      const value = profile[field];

      if (typeof value === 'string') {
        const error = validateField(field, value);
        if (error) {
          errors[field] = error;
        }
      }
    });

    return errors;
  };
const handleSaveProfile = useCallback(async () => {
  // 1️⃣ FULL validation
  const validationErrors = validateForm(profile);

  if (Object.keys(validationErrors).length > 0) {
    setFieldErrors(validationErrors);
    showToast({ message: 'Please fix the errors in the form', severity: 'error' });
    return; // ⛔ HARD STOP
  }

  setFieldErrors({});

  // 2️⃣ Build payload
  const updatePayload: any = {};

  if (activeTab === 'personal') {
    const companyName = profile.name?.trim() || profile.companyName?.trim() || '';

    if (!companyName || companyName.length < 2) {
      showToast({ message: 'Company name must be at least 2 characters', severity: 'error' });
      return;
    }

    updatePayload.name = companyName;
    updatePayload.email = profile.email?.trim() || '';
    updatePayload.industry = profile.industry;
    updatePayload.size = profile.size;
    updatePayload.employmentType = profile.employmentType;
    updatePayload.requiredSkills = profile.requiredSkills || [];
    updatePayload.requiredExperienceLevel = profile.requiredExperienceLevel;
  }

  if (activeTab === 'contact') {
    const contactInfo: any = {};

    if (profile.phone) contactInfo.phone = profile.phone;
    if (profile.location) contactInfo.location = profile.location;
    if (profile.linkedin) contactInfo.linkedin = profile.linkedin;
    if (profile.website) contactInfo.website = profile.website;
    if (profile.employmentType) contactInfo.employmentType = profile.employmentType;
    if (profile.size) contactInfo.size = profile.size;
    if (profile.industry) contactInfo.industry = profile.industry;

    if (Object.keys(contactInfo).length === 0) {
      showToast({ message: 'Please fill in at least one field to update', severity: 'warning' });
      return;
    }

    updatePayload.companyDetails = contactInfo;
  }

  // 3️⃣ API CALL (ONLY HERE)
  try {
    await dispatch(updateProfile(updatePayload)).unwrap();
    await dispatch(getMyProfile()).unwrap();
    setIsEditing(false);
    setSaveSuccess(true);
    showToast({ message: 'Profile updated successfully!', severity: 'success' });
  } catch (err: any) {
    showToast({ message: err?.message || 'Failed to update profile', severity: 'error' });
  }
}, [profile, activeTab, dispatch, showToast]);


  const handleCancel = useCallback(() => {
    setProfile(savedProfile);
    setFieldErrors({});
    setIsEditing(false);
  }, [savedProfile]);

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
    handleCancel,
    handleDismissError,
    handleDismissSuccess,
  };
};
