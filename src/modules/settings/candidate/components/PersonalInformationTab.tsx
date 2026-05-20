import React, { useMemo } from 'react';
import { Box, Alert, Divider, Typography, CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { UserProfile } from '@/types/profile';
import { experienceLevels, timezones } from '@/constants/profile';
import ProfilePictureSection from '@/components/features/profile/ProfilePictureSection';
import { Controller, SubmitErrorHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PersonalInformationFormValues, personalInformationSchema } from '@/validations/profileSchemas';
import AppInput from '@/modules/shared/ui/AppInput';
import AppSelect from '@/modules/shared/ui/AppSelect';
import { EditActions } from '@/modules/settings/shared/components';

interface PersonalInformationTabProps {
  profile: UserProfile;
  isEditing: boolean;
  loading: boolean;
  saveSuccess: boolean;
  error: string | null;
  uploadingImage: boolean;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: (values?: Partial<UserProfile>) => void;
  onCancel: () => void;
  onEditToggle: () => void;
}

const getPersonalFormDefaults = (profile: UserProfile): PersonalInformationFormValues => ({
  firstName: profile.firstName || '',
  lastName: profile.lastName || '',
  gender: profile.gender || 'Male',
  timezone: profile.timezone || 'UTC+01:00',
  requiredExperienceLevel: profile.requiredExperienceLevel || 'Mid Level',
  targetRole: profile.targetRole || '',
  phone: profile.phone || '',
  location: profile.location || '',
  address: profile.address || '',
  linkedinUrl: profile.linkedinUrl || '',
  githubUrl: profile.githubUrl || '',
  personalWebsite: profile.personalWebsite || '',
});

const SectionHeader = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <Box
    sx={{
      px: 2,
      py: 1.5,
      bgcolor: '#F9FAFB',
      border: '1px solid #E5E7EB',
      borderRadius: 2,
      borderLeft: '3px solid #0D9488',
    }}
  >
    <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: '#111827' }}>{title}</Typography>
    <Typography sx={{ fontSize: '0.78rem', color: '#9CA3AF', mt: 0.25 }}>{subtitle}</Typography>
  </Box>
);

const PersonalInformationTab: React.FC<PersonalInformationTabProps> = ({
  profile, isEditing, loading, saveSuccess, error,
  uploadingImage, onImageUpload, onSave, onCancel, onEditToggle,
}) => {
  const { t } = useTranslation('dashboard');
  const s = (k: string) => t(`candidate_settings.personal.${k}`);
  const c = (k: string) => t(`candidate_settings.contact.${k}`);

  const isLoading = loading && !profile.firstName && !profile.username;
  const isNotWorkingValue = /^not\s+working$/i.test(profile.requiredExperienceLevel || '');
  const [submitErrorMessage, setSubmitErrorMessage] = React.useState<string | null>(null);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<PersonalInformationFormValues>({
    resolver: zodResolver(personalInformationSchema),
    mode: 'onChange',
    defaultValues: getPersonalFormDefaults(profile),
  });

  React.useEffect(() => { setSubmitErrorMessage(null); reset(getPersonalFormDefaults(profile)); }, [profile, reset]);

  const handleValidSubmit = (values: PersonalInformationFormValues) => { setSubmitErrorMessage(null); onSave(values); };
  const handleInvalidSubmit: SubmitErrorHandler<PersonalInformationFormValues> = (formErrors) => {
    const firstError = Object.values(formErrors)[0];
    setSubmitErrorMessage(firstError?.message || s('validation_fix_fields'));
  };

  const genderOptions = useMemo(() => [
    { value: 'Male', label: s('gender_male') },
    { value: 'Female', label: s('gender_female') },
    { value: 'Prefer not to say', label: s('gender_other') },
  ], [t]);

  const timezoneOptions = useMemo(() => timezones.map((tz) => ({ value: tz, label: tz })), []);

  const experienceOptions = useMemo(() => {
    const opts = experienceLevels.map((el) => ({ value: el, label: el }));
    if (isNotWorkingValue && !experienceLevels.includes('Not working') && profile.requiredExperienceLevel) {
      opts.push({ value: profile.requiredExperienceLevel, label: s('experience_not_currently_employed') });
    }
    return opts;
  }, [isNotWorkingValue, profile.requiredExperienceLevel, t]);

  return (
    <Box sx={{ bgcolor: '#fff', border: '1px solid #E5E7EB', borderRadius: '16px', overflow: 'hidden' }}>

      {/* Header */}
      <Box sx={{ px: { xs: 2, md: 3 }, py: 2, borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#111827' }}>{s('title')}</Typography>
          <Typography sx={{ fontSize: '0.78rem', color: '#9CA3AF', mt: 0.25 }}>{s('subtitle')}</Typography>
        </Box>
        <EditActions
          isEditing={isEditing}
          loading={loading}
          onEdit={onEditToggle}
          onCancel={onCancel}
          onSave={() => handleSubmit(handleValidSubmit, handleInvalidSubmit)()}
        />
      </Box>

      {/* Content */}
      <Box sx={{ p: { xs: 2, md: 3 }, display: 'flex', flexDirection: 'column', gap: 3 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress size={28} sx={{ color: '#0D9488' }} />
          </Box>
        ) : (
          <>
            {saveSuccess && <Alert severity="success" sx={{ borderRadius: '10px', fontSize: '0.8rem' }}>{s('save_success')}</Alert>}
            {error && <Alert severity="error" sx={{ borderRadius: '10px', fontSize: '0.8rem' }}>{error}</Alert>}
            {submitErrorMessage && <Alert severity="error" sx={{ borderRadius: '10px', fontSize: '0.8rem' }}>{submitErrorMessage}</Alert>}

            <ProfilePictureSection
              profile={profile}
              uploadingImage={uploadingImage}
              isEditing={isEditing}
              onImageUpload={onImageUpload}
              onEditClick={onEditToggle}
            />

            <Divider sx={{ borderColor: '#E5E7EB' }} />

            {/* ── Account ── */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <SectionHeader title="Account" subtitle="Your login credentials" />
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
                <AppInput label={s('username')} value={profile.username || ''} disabled />
                <AppInput label={s('email')} value={profile.email || ''} disabled />
              </Box>
            </Box>

            <Divider sx={{ borderColor: '#E5E7EB' }} />

            {/* ── Profile Details ── */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <SectionHeader title="Profile Details" subtitle="Your personal and professional information" />
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>

                <Controller name="firstName" control={control}
                  render={({ field, fieldState }) => (
                    <AppInput label={s('first_name')} value={field.value} onChange={(e) => field.onChange(e.target.value)} disabled={!isEditing} error={fieldState.error?.message} />
                  )}
                />

                <Controller name="lastName" control={control}
                  render={({ field, fieldState }) => (
                    <AppInput label={s('last_name')} value={field.value} onChange={(e) => field.onChange(e.target.value)} disabled={!isEditing} error={fieldState.error?.message} />
                  )}
                />

                <Controller name="targetRole" control={control}
                  render={({ field, fieldState }) => (
                    <AppInput label={s('target_role')} value={field.value} onChange={(e) => field.onChange(e.target.value)} disabled={!isEditing} placeholder={s('target_role_placeholder')} error={fieldState.error?.message} sx={{ gridColumn: { xs: '1 / -1', sm: 'span 2' } }} />
                  )}
                />

                <Controller name="gender" control={control}
                  render={({ field, fieldState }) => (
                    <AppSelect label={s('gender')} value={field.value} onChange={(val) => field.onChange(val)} options={genderOptions} disabled={!isEditing} error={fieldState.error?.message} />
                  )}
                />

                <Controller name="timezone" control={control}
                  render={({ field, fieldState }) => (
                    <AppSelect label={s('timezone')} value={field.value} onChange={(val) => field.onChange(val)} options={timezoneOptions} disabled={!isEditing} error={fieldState.error?.message} />
                  )}
                />

                <Controller name="requiredExperienceLevel" control={control}
                  render={({ field, fieldState }) => (
                    <AppSelect label={s('experience_level')} value={field.value} onChange={(val) => field.onChange(val)} options={experienceOptions} disabled={!isEditing} error={fieldState.error?.message} sx={{ gridColumn: { xs: '1 / -1', sm: 'span 2' } }} />
                  )}
                />
              </Box>
            </Box>

            <Divider sx={{ borderColor: '#E5E7EB' }} />

            {/* ── Contact Information ── */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <SectionHeader title={t('candidate_settings.contact.title')} subtitle={c('subtitle')} />
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>

                <Controller name="phone" control={control}
                  render={({ field, fieldState }) => (
                    <AppInput label={c('phone')} value={field.value} onChange={(e) => field.onChange(e.target.value)} disabled={!isEditing} error={fieldState.error?.message} />
                  )}
                />

                <Controller name="location" control={control}
                  render={({ field, fieldState }) => (
                    <AppInput label={c('location')} value={field.value} onChange={(e) => field.onChange(e.target.value)} disabled={!isEditing} error={fieldState.error?.message} />
                  )}
                />

                <Controller name="address" control={control}
                  render={({ field, fieldState }) => (
                    <AppInput label={c('address')} value={field.value} onChange={(e) => field.onChange(e.target.value)} disabled={!isEditing} error={fieldState.error?.message} sx={{ gridColumn: { xs: '1 / -1', sm: 'span 2' } }} />
                  )}
                />

                <Controller name="linkedinUrl" control={control}
                  render={({ field, fieldState }) => (
                    <AppInput label={c('linkedin')} value={field.value} onChange={(e) => field.onChange(e.target.value)} disabled={!isEditing} placeholder="https://linkedin.com/in/yourprofile" type="url" error={fieldState.error?.message} />
                  )}
                />

                <Controller name="githubUrl" control={control}
                  render={({ field, fieldState }) => (
                    <AppInput label={c('github')} value={field.value} onChange={(e) => field.onChange(e.target.value)} disabled={!isEditing} placeholder="https://github.com/yourprofile" type="url" error={fieldState.error?.message} />
                  )}
                />

                <Controller name="personalWebsite" control={control}
                  render={({ field, fieldState }) => (
                    <AppInput label={c('website')} value={field.value} onChange={(e) => field.onChange(e.target.value)} disabled={!isEditing} placeholder="https://yourwebsite.com" type="url" error={fieldState.error?.message} sx={{ gridColumn: { xs: '1 / -1', sm: 'span 2' } }} />
                  )}
                />
              </Box>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};

export default React.memo(PersonalInformationTab);
