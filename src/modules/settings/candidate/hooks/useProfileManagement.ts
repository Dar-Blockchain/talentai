import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PersonalInformationFormValues, personalInformationSchema } from '../schemas';
import { useCandidateProfile, useUpdateCandidateProfile, useUploadCandidateAvatar } from '../queries';
import { VALID_TABS, initialProfile, buildSyncedProfile } from './profileManagement.utils';
import { profileKeys, UserProfile } from '@/modules/settings/shared';
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
      toast.error('Please select a valid image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }
    if (!userId) {
      toast.error('User not found');
      return;
    }
    setUploadingImage(true);
    try {
      await uploadMutation.mutateAsync({ userId, file });
      setSaveSuccess(true);
      toast.success('Profile picture updated successfully!');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  }, [userId, uploadMutation]);

  const handleSaveProfile = useCallback(async () => {
    await form.handleSubmit(
      async (values) => {
        if (!userId) {
          toast.error('User not found');
          return;
        }
        const payload = buildPayload(values);
        if (Object.keys(payload).length === 0) {
          toast.warning('Please fill in at least one field to update');
          return;
        }
        try {
          await updateMutation.mutateAsync({ userId, payload });
          setIsEditing(false);
          setSaveSuccess(true);
          toast.success('Profile updated successfully!');
        } catch (err: any) {
          toast.error(err?.message || 'Failed to update profile. Please try again.');
        }
      },
      () => {
        toast.error('Please fix the errors before saving.');
      }
    )();
  }, [form, userId, updateMutation]);

  const handleSaveLanguage = useCallback(async (lang: string) => {
    if (!userId) return;
    try {
      await updateMutation.mutateAsync({ userId, payload: { language: lang } });
      toast.success('Language updated successfully!');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update language');
    }
  }, [userId, updateMutation]);

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
  };
};
