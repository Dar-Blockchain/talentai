import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { useToast } from '@/hooks/useToast';
import { RootState, AppDispatch } from '@/store/store';
import { UserProfile } from '@/types/profile';
import { updateProfile as updateProfileAction, getMyProfile, uploadProfileImage } from '@/store/slices/userSlice';
import { contactInformationSchema } from '@/validations/profileSchemas';

const VALID_TABS = ['personal', 'contact', 'preferences', 'language', 'notifications', 'visibility'];

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

const trimValue = (value?: string) => value?.trim() || '';
const areStringValuesEqual = (a?: string, b?: string) => trimValue(a) === trimValue(b);
const areStringArraysEqual = (a: string[] = [], b: string[] = []) => (
  a.length === b.length && a.every((value, index) => value === b[index])
);

const mapZodIssuesToErrors = (issues: Array<{ path: (string | number)[]; message: string }>) => {
  const nextErrors: Record<string, string> = {};
  issues.forEach((issue) => {
    const key = issue.path[0];
    if (typeof key === 'string' && !nextErrors[key]) {
      nextErrors[key] = issue.message;
    }
  });
  return nextErrors;
};

const getAvatarUrl = (reduxProfile: any, userData: any) => {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (reduxProfile?.user_image) {
    return `${base}images/Users/${reduxProfile.user_image}`;
  }
  if (userData?.user_image) {
    return `${base}images/Users/${userData.user_image}`;
  }
  return '';
};

const buildSyncedProfile = (reduxProfile: any, user: any): UserProfile => {
  const userData = reduxProfile?.userId;
  const isCompany = reduxProfile?.type === 'Company';

  return {
    username: userData?.username || user?.username || '',
    email: userData?.email || user?.email || '',
    requiredExperienceLevel: reduxProfile?.requiredExperienceLevel || 'Mid Level',
    targetRole: reduxProfile?.targetRole ?? '',
    firstName: reduxProfile?.firstName ?? '',
    lastName: reduxProfile?.lastName ?? '',
    gender: reduxProfile?.gender || 'Male',
    country: reduxProfile?.country || 'Tunisia',
    language: reduxProfile?.language || 'English',
    timezone: reduxProfile?.timeZone || reduxProfile?.timezone || 'UTC+01:00',
    phone: reduxProfile?.phone || reduxProfile?.contactInformation?.phone || '',
    address: reduxProfile?.address || reduxProfile?.contactInformation?.address || '',
    linkedinUrl: reduxProfile?.linkedinUrl || reduxProfile?.contactInformation?.linkedinUrl || '',
    githubUrl: reduxProfile?.githubUrl || reduxProfile?.contactInformation?.githubUrl || '',
    personalWebsite: reduxProfile?.personalWebsite || reduxProfile?.contactInformation?.personalWebsite || '',
    location: reduxProfile?.location || reduxProfile?.contactInformation?.location || '',
    avatar: getAvatarUrl(reduxProfile, userData),
    profileType: (isCompany ? 'Company' : 'Candidate') as 'Candidate' | 'Company',
    companyName: reduxProfile?.companyDetails?.name || '',
    name: reduxProfile?.companyDetails?.name || '',
    industry: reduxProfile?.companyDetails?.industry || '',
    companySize: reduxProfile?.companyDetails?.size || '',
    size: reduxProfile?.companyDetails?.size || '',
    employmentType: reduxProfile?.companyDetails?.employmentType || 'Remote',
    requiredSkills: reduxProfile?.requiredSkills || [],
  };
};

export const useProfileManagement = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { showToast } = useToast();
  const { user, profile: reduxProfile, loading } = useSelector((state: RootState) => state.user.connectedUser);

  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [savedProfile, setSavedProfile] = useState<UserProfile>(initialProfile);
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
      if (VALID_TABS.includes(tabParam)) {
        setActiveTab(tabParam);
      }
    }
  }, [router.isReady, router.query.tab]);

  useEffect(() => {
    if (!reduxProfile) return;

    const synced = buildSyncedProfile(reduxProfile, user);
    setSavedProfile(synced);
    if (!isEditing) setProfile(synced);
  }, [reduxProfile, user, isEditing]);

  useEffect(() => {
    if (saveSuccess) {
      const timer = setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [saveSuccess]);

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast({ message: 'Please select a valid image file', severity: 'error' });
      return;
    }

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

  const buildCandidatePersonalPayload = (source: UserProfile) => {
    const payload: Record<string, unknown> = {};
    if (trimValue(source.firstName)) payload.firstName = trimValue(source.firstName);
    if (trimValue(source.lastName)) payload.lastName = trimValue(source.lastName);
    if (source.gender) payload.gender = source.gender;
    if (source.country) payload.country = source.country;
    if (source.timezone) payload.timeZone = source.timezone;
    if (source.requiredExperienceLevel) payload.requiredExperienceLevel = source.requiredExperienceLevel;
    if (trimValue(source.targetRole)) payload.targetRole = trimValue(source.targetRole);

    const contactValidation = contactInformationSchema.safeParse({
      phone: source.phone || '',
      location: source.location || '',
      address: source.address || '',
      linkedinUrl: source.linkedinUrl || '',
      githubUrl: source.githubUrl || '',
      personalWebsite: source.personalWebsite || '',
    });

    if (!contactValidation.success) {
      return { errors: mapZodIssuesToErrors(contactValidation.error.issues), payload: null };
    }

    const contactInformation: Record<string, string> = {};
    if (trimValue(source.phone)) contactInformation.phone = trimValue(source.phone);
    if (trimValue(source.location)) contactInformation.location = trimValue(source.location);
    if (trimValue(source.address)) contactInformation.address = trimValue(source.address);
    if (trimValue(source.linkedinUrl)) contactInformation.linkedinUrl = trimValue(source.linkedinUrl);
    if (trimValue(source.githubUrl)) contactInformation.githubUrl = trimValue(source.githubUrl);
    if (trimValue(source.personalWebsite)) contactInformation.personalWebsite = trimValue(source.personalWebsite);

    if (Object.keys(contactInformation).length > 0) {
      payload.contactInformation = contactInformation;
    }

    return { errors: null, payload };
  };

  const buildCandidateContactPayload = (source: UserProfile) => {
    const validation = contactInformationSchema.safeParse({
      phone: source.phone || '',
      location: source.location || '',
      address: source.address || '',
      linkedinUrl: source.linkedinUrl || '',
      githubUrl: source.githubUrl || '',
      personalWebsite: source.personalWebsite || '',
    });

    if (!validation.success) {
      return { errors: mapZodIssuesToErrors(validation.error.issues), payload: null };
    }

    const contactInformation: Record<string, string> = {};
    if (trimValue(source.email)) contactInformation.email = trimValue(source.email);
    if (trimValue(source.phone)) contactInformation.phone = trimValue(source.phone);
    if (trimValue(source.location)) contactInformation.location = trimValue(source.location);
    if (trimValue(source.address)) contactInformation.address = trimValue(source.address);
    if (trimValue(source.linkedinUrl)) contactInformation.linkedinUrl = trimValue(source.linkedinUrl);
    if (trimValue(source.githubUrl)) contactInformation.githubUrl = trimValue(source.githubUrl);
    if (trimValue(source.personalWebsite)) contactInformation.personalWebsite = trimValue(source.personalWebsite);

    return {
      errors: null,
      payload: Object.keys(contactInformation).length > 0 ? { contactInformation } : {},
    };
  };

  const buildCompanyPayload = (source: UserProfile) => {
    if (activeTab === 'personal') {
      return {
        name: trimValue(source.name) || trimValue(source.companyName),
        industry: source.industry || '',
        size: source.size || source.companySize || '',
        employmentType: source.employmentType || 'Remote',
        requiredExperienceLevel: source.requiredExperienceLevel || 'Mid Level',
        requiredSkills: source.requiredSkills || [],
      };
    }

    if (activeTab === 'contact') {
      return {
        email: trimValue(source.email),
        linkedin: trimValue(source.linkedinUrl),
        website: trimValue(source.personalWebsite),
        location: trimValue(source.location),
      };
    }

    return {};
  };

  const hasChangesForActiveTab = (current: UserProfile, saved: UserProfile) => {
    if (current.profileType === 'Candidate') {
      if (activeTab === 'personal') {
        const personalChanged =
          !areStringValuesEqual(current.firstName, saved.firstName) ||
          !areStringValuesEqual(current.lastName, saved.lastName) ||
          current.gender !== saved.gender ||
          current.country !== saved.country ||
          current.timezone !== saved.timezone ||
          current.requiredExperienceLevel !== saved.requiredExperienceLevel ||
          !areStringValuesEqual(current.targetRole, saved.targetRole);

        const contactChanged =
          !areStringValuesEqual(current.phone, saved.phone) ||
          !areStringValuesEqual(current.location, saved.location) ||
          !areStringValuesEqual(current.address, saved.address) ||
          !areStringValuesEqual(current.linkedinUrl, saved.linkedinUrl) ||
          !areStringValuesEqual(current.githubUrl, saved.githubUrl) ||
          !areStringValuesEqual(current.personalWebsite, saved.personalWebsite);

        return personalChanged || contactChanged;
      }

      if (activeTab === 'contact') {
        return (
          !areStringValuesEqual(current.phone, saved.phone) ||
          !areStringValuesEqual(current.location, saved.location) ||
          !areStringValuesEqual(current.address, saved.address) ||
          !areStringValuesEqual(current.linkedinUrl, saved.linkedinUrl) ||
          !areStringValuesEqual(current.githubUrl, saved.githubUrl) ||
          !areStringValuesEqual(current.personalWebsite, saved.personalWebsite)
        );
      }
    }

    if (current.profileType === 'Company') {
      if (activeTab === 'personal') {
        return (
          !areStringValuesEqual(current.name || current.companyName, saved.name || saved.companyName) ||
          !areStringValuesEqual(current.industry, saved.industry) ||
          !areStringValuesEqual(current.size || current.companySize, saved.size || saved.companySize) ||
          !areStringValuesEqual(current.employmentType, saved.employmentType) ||
          !areStringValuesEqual(current.requiredExperienceLevel, saved.requiredExperienceLevel) ||
          !areStringArraysEqual(current.requiredSkills || [], saved.requiredSkills || [])
        );
      }

      if (activeTab === 'contact') {
        return (
          !areStringValuesEqual(current.email, saved.email) ||
          !areStringValuesEqual(current.linkedinUrl, saved.linkedinUrl) ||
          !areStringValuesEqual(current.personalWebsite, saved.personalWebsite) ||
          !areStringValuesEqual(current.location, saved.location)
        );
      }
    }

    return false;
  };

  const handleSaveProfile = async (overrides?: Partial<UserProfile>) => {
    try {
      const profileToSave: UserProfile = { ...profile, ...(overrides || {}) };
      if (!hasChangesForActiveTab(profileToSave, savedProfile)) {
        showToast({ message: 'No changes to save.', severity: 'info' });
        return;
      }

      let updatePayload: Record<string, unknown> = {};

      if (profileToSave.profileType === 'Candidate') {
        if (activeTab === 'personal') {
          const result = buildCandidatePersonalPayload(profileToSave);
          if (result.errors) {
            showToast({ message: 'Please fix personal information errors before saving.', severity: 'error' });
            return;
          }
          updatePayload = result.payload || {};
        } else if (activeTab === 'contact') {
          const result = buildCandidateContactPayload(profileToSave);
          if (result.errors) {
            showToast({ message: 'Please fix contact information errors before saving.', severity: 'error' });
            return;
          }
          updatePayload = result.payload || {};
        }
      } else if (profileToSave.profileType === 'Company') {
        updatePayload = buildCompanyPayload(profileToSave);
      }

      if (Object.keys(updatePayload).length === 0) {
        showToast({ message: 'Please fill in at least one field to update', severity: 'warning' });
        return;
      }

      await dispatch(updateProfileAction({ payload: updatePayload })).unwrap();
      setIsEditing(false);
      await dispatch(getMyProfile());
      showToast({ message: 'Profile updated successfully!', severity: 'success' });
    } catch (err: any) {
      showToast({ message: err?.message || 'Failed to update profile. Please try again.', severity: 'error' });
    }
  };

  const handleDismissError = () => {
    setError(null);
  };

  const handleDismissSuccess = () => {
    setSaveSuccess(false);
  };

  const handleSaveLanguage = async (lang: string) => {
    try {
      await dispatch(updateProfileAction({ payload: { language: lang } })).unwrap();
      await dispatch(getMyProfile());
      showToast({ message: 'Language updated successfully!', severity: 'success' });
    } catch (err: any) {
      showToast({ message: err?.message || 'Failed to update language', severity: 'error' });
    }
  };

  const handleCancel = () => {
    setProfile(savedProfile);
    setIsEditing(false);
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

    // Actions
    setActiveTab,
    setIsEditing,
    handleInputChange,
    handleImageUpload,
    handleSaveProfile,
    handleSaveLanguage,
    handleCancel,
    handleDismissError,
    handleDismissSuccess,
  };
};
