import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/useToast';
import { UserProfile } from '@/types/profile';
import { PersonalInformationFormValues, personalInformationSchema } from '../schemas';
import { useCandidateProfile, useUpdateCandidateProfile, useUploadCandidateAvatar } from '../queries';
import { VALID_TABS, initialProfile, buildSyncedProfile } from './profileManagement.utils';
import { profileKeys } from '@/modules/settings/shared';
import { updateProfileResume } from '@/store/slices/userSlice';

// ─── Pure helpers ─────────────────────────────────────────────────────────────

const toFormValues = (p: UserProfile): PersonalInformationFormValues => ({
  firstName:               p.firstName               || '',
  lastName:                p.lastName                || '',
  gender:                  p.gender                  || 'Male',
  timezone:                p.timezone                || 'UTC+01:00',
  requiredExperienceLevel: p.requiredExperienceLevel || 'Mid Level',
  targetRole:              p.targetRole              || '',
  phone:                   p.phone                   || '',
  location:                p.location                || '',
  address:                 p.address                 || '',
  linkedinUrl:             p.linkedinUrl             || '',
  githubUrl:               p.githubUrl               || '',
  personalWebsite:         p.personalWebsite         || '',
});

const buildPayload = (values: PersonalInformationFormValues): Record<string, unknown> => {
  const payload: Record<string, unknown> = {};
  if (values.firstName)               payload.firstName               = values.firstName;
  if (values.lastName)                payload.lastName                = values.lastName;
  if (values.gender)                  payload.gender                  = values.gender;
  if (values.timezone)                payload.timeZone                = values.timezone;
  if (values.requiredExperienceLevel) payload.requiredExperienceLevel = values.requiredExperienceLevel;
  if (values.targetRole)              payload.targetRole              = values.targetRole;

  if (values.phone) payload.phone = values.phone;

  const contact: Record<string, string> = {};
  if (values.location)        contact.location        = values.location;
  if (values.address)         contact.address         = values.address;
  if (values.linkedinUrl)     contact.linkedinUrl     = values.linkedinUrl;
  if (values.githubUrl)       contact.githubUrl       = values.githubUrl;
  if (values.personalWebsite) contact.personalWebsite = values.personalWebsite;
  if (Object.keys(contact).length > 0) payload.contactInformation = contact;

  return payload;
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useProfileManagement = () => {
  const router = useRouter();
  const { showToast } = useToast();
  const dispatch = useDispatch();

  const queryClient = useQueryClient();
  const { data: settingsData, isLoading } = useCandidateProfile();
  const updateMutation = useUpdateCandidateProfile();
  const uploadMutation = useUploadCandidateAvatar();

  const user              = settingsData?.user;
  const serverProfile     = settingsData?.profile;
  const companyMembership = settingsData?.companyMembership ?? null;
  const isPublicProfile   = settingsData?.profile?.isPublicProfile ?? false;
  const userId            = user?._id || user?.id;
  const loading           = isLoading || updateMutation.isPending || uploadMutation.isPending;

  const form = useForm<PersonalInformationFormValues>({
    resolver:      zodResolver(personalInformationSchema),
    mode:          'onBlur',
    defaultValues: toFormValues(initialProfile),
  });

  const [activeTab,      setActiveTab]      = useState('personal');
  const [isEditing,      setIsEditing]      = useState(false);
  const [profile,        setProfile]        = useState<UserProfile>(initialProfile);
  const [savedProfile,   setSavedProfile]   = useState<UserProfile>(initialProfile);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saveSuccess,    setSaveSuccess]    = useState(false);
  const [error,          setError]          = useState<string | null>(null);

  useEffect(() => {
    if (router.isReady && router.query.tab) {
      const tabParam = router.query.tab as string;
      if (VALID_TABS.includes(tabParam)) setActiveTab(tabParam);
    }
  }, [router.isReady, router.query.tab]);

  // Sync server data → local state + form, but only when not editing
  useEffect(() => {
    if (!serverProfile) return;
    const synced = buildSyncedProfile(serverProfile, user);
    setSavedProfile(synced);
    if (!isEditing) {
      setProfile(synced);
      form.reset(toFormValues(synced));
    }
  }, [serverProfile, user, isEditing]);

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

  const handleSaveProfile = useCallback(async () => {
    await form.handleSubmit(
      async (values) => {
        if (!userId) {
          showToast({ message: 'User not found', severity: 'error' });
          return;
        }
        const payload = buildPayload(values);
        if (Object.keys(payload).length === 0) {
          showToast({ message: 'Please fill in at least one field to update', severity: 'warning' });
          return;
        }
        try {
          await updateMutation.mutateAsync({ userId, payload });
          setIsEditing(false);
          setSaveSuccess(true);
          showToast({ message: 'Profile updated successfully!', severity: 'success' });
        } catch (err: any) {
          showToast({ message: err?.message || 'Failed to update profile. Please try again.', severity: 'error' });
        }
      },
      () => {
        showToast({ message: 'Please fix the errors before saving.', severity: 'error' });
      }
    )();
  }, [form, showToast, userId, updateMutation]);

  const handleSaveLanguage = useCallback(async (lang: string) => {
    if (!userId) return;
    try {
      await updateMutation.mutateAsync({ userId, payload: { language: lang } });
      showToast({ message: 'Language updated successfully!', severity: 'success' });
    } catch (err: any) {
      showToast({ message: err?.message || 'Failed to update language', severity: 'error' });
    }
  }, [showToast, userId, updateMutation]);

  const handleCancel = useCallback(() => {
    setProfile(savedProfile);
    form.reset(toFormValues(savedProfile));
    setIsEditing(false);
  }, [savedProfile, form]);

  return {
    activeTab,
    isEditing,
    profile,
    loading,
    error,
    uploadingImage,
    saveSuccess,
    userId,
    companyMembership,
    isPublicProfile,
    control:    form.control,
    formErrors: form.formState.errors,

    setActiveTab,
    setIsEditing,
    handleInputChange,
    handleImageUpload,
    handleSaveProfile,
    handleSaveLanguage,
    handleCancel,
    handleCvUpdated:      useCallback((filename: string, _cvAnalysis?: any) => {
      setProfile((prev) => ({ ...prev, resume: filename }));
      setSavedProfile((prev) => ({ ...prev, resume: filename }));
      dispatch(updateProfileResume(filename));
      queryClient.setQueryData(profileKeys.me, (old: any) =>
        old ? { ...old, profile: { ...old.profile, resume: filename } } : old
      );
    }, [dispatch, queryClient]),
    handleCvDeleted:      useCallback(() => {
      setProfile((prev) => ({ ...prev, resume: "" }));
      setSavedProfile((prev) => ({ ...prev, resume: "" }));
      dispatch(updateProfileResume(""));
      queryClient.setQueryData(profileKeys.me, (old: any) =>
        old ? { ...old, profile: { ...old.profile, resume: "" } } : old
      );
    }, [dispatch, queryClient]),
    handleDismissError:   useCallback(() => setError(null), []),
    handleDismissSuccess: useCallback(() => setSaveSuccess(false), []),
  };
};
