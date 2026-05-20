import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import { useToast } from '@/hooks/useToast';
import { UserProfile } from '@/types/profile';
import { useCandidateProfile, useUpdateCandidateProfile, useUploadCandidateAvatar } from '../queries';
import {
  VALID_TABS,
  initialProfile,
  trimValue,
  areStringValuesEqual,
  hasCandidateContactChanges,
  validateContactInformation,
  buildContactInformation,
  buildSyncedProfile,
} from './profileManagement.utils';

// ─── Pure helpers ─────────────────────────────────────────────────────────────

const buildPersonalPayload = (source: UserProfile) => {
  const payload: Record<string, unknown> = {};
  if (trimValue(source.firstName))           payload.firstName               = trimValue(source.firstName);
  if (trimValue(source.lastName))            payload.lastName                = trimValue(source.lastName);
  if (source.gender)                         payload.gender                  = source.gender;
  if (source.timezone)                       payload.timeZone                = source.timezone;
  if (source.requiredExperienceLevel)        payload.requiredExperienceLevel = source.requiredExperienceLevel;
  if (trimValue(source.targetRole))          payload.targetRole              = trimValue(source.targetRole);

  const contactValidation = validateContactInformation(source);
  if (!contactValidation.isValid) return { errors: contactValidation.errors, payload: null };

  const contactInformation = buildContactInformation(source);
  if (Object.keys(contactInformation).length > 0) payload.contactInformation = contactInformation;

  return { errors: null, payload };
};

const hasPersonalChanges = (current: UserProfile, saved: UserProfile) =>
  !areStringValuesEqual(current.firstName,  saved.firstName)  ||
  !areStringValuesEqual(current.lastName,   saved.lastName)   ||
  current.gender    !== saved.gender    ||
  current.timezone  !== saved.timezone  ||
  current.requiredExperienceLevel !== saved.requiredExperienceLevel ||
  !areStringValuesEqual(current.targetRole, saved.targetRole) ||
  hasCandidateContactChanges(current, saved);

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useProfileManagement = () => {
  const router = useRouter();
  const { showToast } = useToast();

  const { data: settingsData, isLoading } = useCandidateProfile();
  const updateMutation = useUpdateCandidateProfile();
  const uploadMutation = useUploadCandidateAvatar();

  const user         = settingsData?.user;
  const reduxProfile = settingsData?.profile;
  const userId       = user?._id || user?.id;
  const loading      = isLoading || updateMutation.isPending || uploadMutation.isPending;

  const [activeTab,      setActiveTab]      = useState('personal');
  const [isEditing,      setIsEditing]      = useState(false);
  const [profile,        setProfile]        = useState<UserProfile>(initialProfile);
  const [savedProfile,   setSavedProfile]   = useState<UserProfile>(initialProfile);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saveSuccess,    setSaveSuccess]    = useState(false);
  const [error,          setError]          = useState<string | null>(null);

  const profileRef = useRef(profile);
  useEffect(() => { profileRef.current = profile; }, [profile]);

  useEffect(() => {
    if (router.isReady && router.query.tab) {
      const tabParam = router.query.tab as string;
      if (VALID_TABS.includes(tabParam)) setActiveTab(tabParam);
    }
  }, [router.isReady, router.query.tab]);

  useEffect(() => {
    if (!reduxProfile) return;
    const synced = buildSyncedProfile(reduxProfile, user);
    setSavedProfile(synced);
    if (!isEditing) setProfile(synced);
  }, [reduxProfile, user, isEditing]);

  useEffect(() => {
    if (!saveSuccess) return;
    const timer = setTimeout(() => setSaveSuccess(false), 3000);
    return () => clearTimeout(timer);
  }, [saveSuccess]);

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleInputChange = useCallback((field: keyof UserProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
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
    if (!userId) {
      showToast({ message: 'User not found', severity: 'error' });
      return;
    }

    setUploadingImage(true);
    try {
      await uploadMutation.mutateAsync({ userId, file });
      setSaveSuccess(true);
      showToast({ message: 'Profile picture updated successfully!', severity: 'success' });
    } catch (err: any) {
      showToast({ message: err?.message || 'Failed to upload image', severity: 'error' });
    } finally {
      setUploadingImage(false);
    }
  }, [showToast, userId, uploadMutation]);

  const handleSaveProfile = useCallback(async (overrides?: Partial<UserProfile>) => {
    if (!userId) {
      showToast({ message: 'User not found', severity: 'error' });
      return;
    }

    const profileToSave: UserProfile = { ...profileRef.current, ...(overrides || {}) };

    if (!hasPersonalChanges(profileToSave, savedProfile)) {
      showToast({ message: 'No changes to save.', severity: 'info' });
      return;
    }

    const result = buildPersonalPayload(profileToSave);
    if (result.errors) {
      showToast({ message: 'Please fix personal information errors before saving.', severity: 'error' });
      return;
    }
    if (!result.payload || Object.keys(result.payload).length === 0) {
      showToast({ message: 'Please fill in at least one field to update', severity: 'warning' });
      return;
    }

    try {
      await updateMutation.mutateAsync({ userId, payload: result.payload });
      setIsEditing(false);
      setSaveSuccess(true);
      showToast({ message: 'Profile updated successfully!', severity: 'success' });
    } catch (err: any) {
      showToast({ message: err?.message || 'Failed to update profile. Please try again.', severity: 'error' });
    }
  }, [showToast, userId, savedProfile, updateMutation]);

  const handleSaveLanguage = useCallback(async (lang: string) => {
    if (!userId) return;
    try {
      await updateMutation.mutateAsync({ userId, payload: { language: lang } });
      showToast({ message: 'Language updated successfully!', severity: 'success' });
    } catch (err: any) {
      showToast({ message: err?.message || 'Failed to update language', severity: 'error' });
    }
  }, [showToast, userId, updateMutation]);

  const handleCancel       = useCallback(() => { setProfile(savedProfile); setIsEditing(false); }, [savedProfile]);
  const handleDismissError   = useCallback(() => setError(null), []);
  const handleDismissSuccess = useCallback(() => setSaveSuccess(false), []);

  return {
    activeTab,
    isEditing,
    profile,
    loading,
    error,
    uploadingImage,
    saveSuccess,
    userId,

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
