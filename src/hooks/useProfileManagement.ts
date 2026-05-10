import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { useToast } from '@/hooks/useToast';
import { RootState, AppDispatch } from '@/store/store';
import { UserProfile } from '@/types/profile';
import { updateProfile as updateProfileAction, getMyProfile, uploadProfileImage } from '@/store/slices/userSlice';
import {
  VALID_TABS,
  initialProfile,
  trimValue,
  areStringValuesEqual,
  areStringArraysEqual,
  validateContactInformation,
  buildContactInformation,
  hasCandidateContactChanges,
  buildSyncedProfile,
} from '@/hooks/profileManagement.utils';

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
    if (source.timezone) payload.timeZone = source.timezone;
    if (source.requiredExperienceLevel) payload.requiredExperienceLevel = source.requiredExperienceLevel;
    if (trimValue(source.targetRole)) payload.targetRole = trimValue(source.targetRole);

    const contactValidation = validateContactInformation(source);
    if (!contactValidation.isValid) {
      return { errors: contactValidation.errors, payload: null };
    }

    const contactInformation = buildContactInformation(source);

    if (Object.keys(contactInformation).length > 0) {
      payload.contactInformation = contactInformation;
    }

    return { errors: null, payload };
  };

  const buildCandidateContactPayload = (source: UserProfile) => {
    const validation = validateContactInformation(source);
    if (!validation.isValid) {
      return { errors: validation.errors, payload: null };
    }

    const contactInformation = buildContactInformation(source, { includeEmail: true });

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
          current.timezone !== saved.timezone ||
          current.requiredExperienceLevel !== saved.requiredExperienceLevel ||
          !areStringValuesEqual(current.targetRole, saved.targetRole);

        const contactChanged =
          hasCandidateContactChanges(current, saved);

        return personalChanged || contactChanged;
      }

      if (activeTab === 'contact') {
        return hasCandidateContactChanges(current, saved);
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
