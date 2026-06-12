import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import { SelectChangeEvent } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/useToast';
import { UserProfile } from '@/types/profile';
import { normalizeLangCode } from '@/hooks/useLanguage';
import { companyProfileSchema, CompanyProfileFormValues } from '../schemas/companyProfileSchema';
import {
  useSettingsProfile,
  useUpdateSettingsProfile,
  useUploadSettingsAvatar,
} from '../queries';

// ─── Pure helpers (outside hook — never recreated) ───────────────────────────

const normalizeCompanySize = (size?: string): string =>
  !size ? '' : size.replace(/\s*employees?$/i, '').replace(/–/g, '-');

const buildAvatarUrl = (...images: (string | undefined)[]): string => {
  const img = images.find(Boolean);
  return img ? `${process.env.NEXT_PUBLIC_API_BASE_URL}images/Users/${img}` : '';
};

const buildSyncedProfile = (
  companyData: any,
  extra: {
    username: string;
    email: string;
    avatarUrl: string;
    requiredExperienceLevel?: string;
    targetRole?: string;
    requiredSkills?: any[];
    language?: string;
    phone?: string;
    address?: string;
    linkedin?: string;
    personalWebsite?: string;
    location?: string;
    website?: string;
  }
): UserProfile => {
  const normalizedSize = normalizeCompanySize(companyData?.size);
  const companyName = companyData?.name || extra.username || '';
  return {
    username: extra.username,
    email: extra.email,
    requiredExperienceLevel: extra.requiredExperienceLevel || companyData?.requiredExperienceLevel || 'Mid Level',
    targetRole: extra.targetRole || '',
    firstName: '',
    lastName: '',
    gender: 'Male',
    country: companyData?.location || '',
    language: normalizeLangCode(extra.language || companyData?.language) ?? 'en',
    timezone: 'UTC+01:00',
    phone: extra.phone || companyData?.phone || '',
    address: extra.address || companyData?.address || '',
    linkedin: extra.linkedin || companyData?.linkedin || '',
    githubUrl: '',
    personalWebsite: extra.personalWebsite || companyData?.personalWebsite || '',
    location: extra.location || companyData?.location || '',
    avatar: extra.avatarUrl,
    profileType: 'Company',
    companyName,
    name: companyName,
    industry: companyData?.industry || '',
    companySize: normalizedSize,
    size: normalizedSize,
    website: extra.website || companyData?.website || '',
    employmentType: companyData?.employmentType || 'Remote',
    requiredSkills: extra.requiredSkills || companyData?.requiredSkills || [],
  };
};

const toFormValues = (p: UserProfile): CompanyProfileFormValues => ({
  name: p.name || p.companyName || '',
  industry: p.industry || '',
  size: p.size || p.companySize || '',
  employmentType: p.employmentType || 'Remote',
  location: p.location || '',
  linkedin: p.linkedin || '',
  website: p.website || '',
  phone: p.phone || '',
});

const initialProfile: UserProfile = buildSyncedProfile(
  {},
  { username: '', email: '', avatarUrl: '' } as any
);

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useCompanyProfileManagement = () => {
  const router = useRouter();
  const { showToast } = useToast();

  // ── React Query ─────────────────────────────────────────────────────────────
  const { data: settingsData, isLoading, error: fetchError } = useSettingsProfile();
  const updateMutation = useUpdateSettingsProfile();
  const uploadMutation = useUploadSettingsAvatar();

  const user              = settingsData?.user;
  const reduxProfile      = settingsData?.profile;
  const companyMembership = settingsData?.companyMembership;
  const isEmployee        = user?.role === 'Employee';
  const userId            = user?._id || user?.id;

  const loading = isLoading || updateMutation.isPending || uploadMutation.isPending;
  const error   = (fetchError as any)?.message ?? null;

  const form = useForm<CompanyProfileFormValues>({
    resolver: zodResolver(companyProfileSchema),
    mode: 'onChange',
    defaultValues: { name: '', industry: '', size: '', employmentType: 'Remote', location: '', linkedin: '', website: '', phone: '' },
  });

  const [activeTab,      setActiveTab]      = useState('personal');
  const [isEditing,      setIsEditing]      = useState(false);
  const [profile,        setProfile]        = useState<UserProfile>(initialProfile);
  const [savedProfile,   setSavedProfile]   = useState<UserProfile>(initialProfile);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saveSuccess,    setSaveSuccess]    = useState(false);

  const profileRef = useRef(profile);
  useEffect(() => { profileRef.current = profile; }, [profile]);

  useEffect(() => {
    if (router.isReady && router.query.tab) {
      const tabParam = router.query.tab as string;
      if (['personal', 'contact', 'team'].includes(tabParam)) setActiveTab(tabParam);
    }
  }, [router.isReady, router.query.tab]);

  // Sync profile from React Query data → local state + RHF form, but only when not editing
  useEffect(() => {
    if (!user) return;

    let synced: UserProfile;

    if (isEmployee) {
      const companyUser    = companyMembership?.company;
      const companyProfile = companyUser?.profile;
      if (!companyUser) return;

      const companyData = companyProfile?.companyDetails || companyProfile || {};
      synced = buildSyncedProfile(companyData, {
        username:                companyUser.username || '',
        email:                   companyUser.email || companyData?.email || '',
        avatarUrl:               buildAvatarUrl(companyUser.user_image),
        requiredExperienceLevel: companyProfile?.requiredExperienceLevel,
        requiredSkills:          companyProfile?.requiredSkills || companyData?.requiredSkills,
      });
    } else {
      if (!reduxProfile) return;

      const companyData = reduxProfile.companyDetails || reduxProfile;
      synced = buildSyncedProfile(companyData, {
        username:                user.username || '',
        email:                   user.email || companyData?.email || '',
        avatarUrl:               buildAvatarUrl(reduxProfile.user_image, user.user_image),
        requiredExperienceLevel: reduxProfile?.requiredExperienceLevel,
        targetRole:              reduxProfile?.targetRole,
        requiredSkills:          reduxProfile?.requiredSkills || companyData?.requiredSkills,
        language:                reduxProfile?.language,
        phone:                   reduxProfile.companyDetails?.phone,
        address:                 reduxProfile.companyDetails?.address,
        linkedin:                reduxProfile.companyDetails?.linkedin,
        personalWebsite:         reduxProfile.companyDetails?.personalWebsite,
        location:                reduxProfile.companyDetails?.location || companyData?.location,
        website:                 reduxProfile.companyDetails?.website  || companyData?.website,
      });
    }

    setSavedProfile(synced);
    if (!isEditing) {
      setProfile(synced);
      form.reset(toFormValues(synced));
    }
  }, [reduxProfile, companyMembership, user, isEmployee, isEditing]);

  useEffect(() => {
    if (!saveSuccess) return;
    const timer = setTimeout(() => setSaveSuccess(false), 3000);
    return () => clearTimeout(timer);
  }, [saveSuccess]);

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleInputChange = useCallback((field: keyof UserProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSelectChange = useCallback((event: SelectChangeEvent<string>, field: keyof UserProfile) => {
    setProfile((prev) => ({ ...prev, [field]: event.target.value }));
  }, []);

  const handleImageUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
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

      const targetUserId    = isEmployee ? companyMembership?.company?._id : undefined;
      const effectiveUserId = targetUserId || userId;

      if (!effectiveUserId) {
        showToast({ message: 'User not found', severity: 'error' });
        return;
      }

      setUploadingImage(true);
      try {
        await uploadMutation.mutateAsync({ userId: effectiveUserId, file });
        setSaveSuccess(true);
        showToast({ message: 'Profile picture updated successfully!', severity: 'success' });
      } catch (err: any) {
        showToast({ message: err?.message || 'Failed to upload image', severity: 'error' });
      } finally {
        setUploadingImage(false);
      }
    },
    [showToast, isEmployee, companyMembership, userId, uploadMutation]
  );

  const handleSaveProfile = useCallback(async (): Promise<boolean> => {
    let succeeded = false;
    const currentProfile  = profileRef.current;
    const targetUserId    = isEmployee ? companyMembership?.company?._id : undefined;
    const effectiveUserId = targetUserId || userId;

    await form.handleSubmit(async (data) => {
      try {
        if (!effectiveUserId) throw new Error('User not found');

        const updatePayload = {
          language: currentProfile.language || 'en',
          companyDetails: {
            name:           data.name?.trim() || '',
            industry:       data.industry,
            size:           data.size,
            employmentType: data.employmentType,
            ...(data.location && { location: data.location }),
            ...(data.linkedin && { linkedin: data.linkedin }),
            ...(data.website  && { website:  data.website }),
            ...(data.phone    && { phone:    data.phone }),
          },
        };

        await updateMutation.mutateAsync({ userId: effectiveUserId, payload: updatePayload });
        setSaveSuccess(true);
        showToast({ message: 'Profile updated successfully!', severity: 'success' });
        succeeded = true;
      } catch (err: any) {
        showToast({ message: err?.message || 'Failed to update profile', severity: 'error' });
      }
    })();

    if (!succeeded && Object.keys(form.formState.errors).length > 0) {
      showToast({ message: 'Please fix the errors in the form', severity: 'error' });
    }

    return succeeded;
  }, [showToast, isEmployee, companyMembership, userId, updateMutation, form]);

  const handleSaveLanguage = useCallback(
    async (lang: string) => {
      const targetUserId    = isEmployee ? companyMembership?.company?._id : undefined;
      const effectiveUserId = targetUserId || userId;
      try {
        if (!effectiveUserId) throw new Error('User not found');
        await updateMutation.mutateAsync({ userId: effectiveUserId, payload: { language: lang } });
        showToast({ message: 'Language updated successfully!', severity: 'success' });
      } catch (err: any) {
        showToast({ message: err?.message || 'Failed to update language', severity: 'error' });
      }
    },
    [showToast, isEmployee, companyMembership, userId, updateMutation]
  );

  const handleCancel = useCallback(() => {
    setProfile(savedProfile);
    form.reset(toFormValues(savedProfile));
    setIsEditing(false);
  }, [savedProfile, form]);

  return {
    activeTab,
    isEditing,
    isEmployee,
    profile,
    loading,
    error,
    uploadingImage,
    saveSuccess,
    userId,
    control:    form.control,
    formErrors: form.formState.errors,

    setActiveTab,
    setIsEditing,
    handleInputChange,
    handleSelectChange,
    handleImageUpload,
    handleSaveProfile,
    handleSaveLanguage,
    handleCancel,
    handleDismissError:   useCallback(() => {}, []),
    handleDismissSuccess: useCallback(() => setSaveSuccess(false), []),
  };
};
