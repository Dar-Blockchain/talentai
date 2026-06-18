import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import { CheckCircle2, XCircle } from 'lucide-react';
import { UserProfile } from '@/types/profile';
import { PersonalInformationFormValues } from '@/modules/settings/candidate/schemas';
import { experienceLevels, timezones } from '@/constants/profile';
import ProfilePictureSection from '@/components/features/profile/ProfilePictureSection';
import AppInput from '@/modules/shared/ui/AppInput';
import AppSelect from '@/modules/shared/ui/AppSelect';
import { EditActions, Spinner } from '@/modules/settings/shared/components';
import CvSection from './CvSection';

interface PersonalInformationTabProps {
  profile:        UserProfile;
  control:        Control<PersonalInformationFormValues>;
  formErrors:     FieldErrors<PersonalInformationFormValues>;
  isEditing:      boolean;
  loading:        boolean;
  saveSuccess:    boolean;
  error:          string | null;
  uploadingImage: boolean;
  onImageUpload:  (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSave:         () => void;
  onCancel:       () => void;
  onEditToggle:   () => void;
  onCvUpdated:    (filename: string) => void;
  onCvDeleted:    () => void;
}

const SectionHeader = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg border-l-[3px] border-l-teal-600">
    <p className="text-[0.9rem] font-bold text-gray-900">{title}</p>
    <p className="text-[0.78rem] text-gray-400 mt-1">{subtitle}</p>
  </div>
);

const PersonalInformationTab: React.FC<PersonalInformationTabProps> = ({
  profile, control, formErrors, isEditing, loading, saveSuccess, error,
  uploadingImage, onImageUpload, onSave, onCancel, onEditToggle, onCvUpdated, onCvDeleted,
}) => {
  const { t } = useTranslation('dashboard');
  const s = (k: string) => t(`candidate_settings.personal.${k}`);
  const c = (k: string) => t(`candidate_settings.contact.${k}`);

  const isLoading = loading && !profile.firstName && !profile.username;
  const isNotWorkingValue = /^not\s+working$/i.test(profile.requiredExperienceLevel || '');

  const genderOptions = useMemo(() => [
    { value: 'Male',              label: s('gender_male') },
    { value: 'Female',            label: s('gender_female') },
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
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">

      {/* Header */}
      <div className="px-4 md:px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-2 flex-wrap">
        <div>
          <p className="font-bold text-[0.95rem] text-gray-900">{s('title')}</p>
          <p className="text-[0.78rem] text-gray-400 mt-1">{s('subtitle')}</p>
        </div>
        <EditActions
          isEditing={isEditing}
          loading={loading}
          onEdit={onEditToggle}
          onCancel={onCancel}
          onSave={onSave}
        />
      </div>

      {/* Content */}
      <div className="p-4 md:p-6 flex flex-col gap-6">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size={28} />
          </div>
        ) : (
          <>
            {saveSuccess && (
              <div className="flex items-center gap-2 rounded-[10px] bg-green-50 border border-green-200 px-3 py-2 text-[0.8rem] text-green-800">
                <CheckCircle2 size={16} className="text-green-600" />
                {s('save_success')}
              </div>
            )}
            {error && (
              <div className="flex items-center gap-2 rounded-[10px] bg-red-50 border border-red-200 px-3 py-2 text-[0.8rem] text-red-800">
                <XCircle size={16} className="text-red-600" />
                {error}
              </div>
            )}

            <ProfilePictureSection
              profile={profile}
              uploadingImage={uploadingImage}
              isEditing={isEditing}
              onImageUpload={onImageUpload}
              onEditClick={onEditToggle}
            />

            <hr className="border-gray-200" />

            {/* ── Account ── */}
            <div className="flex flex-col gap-5">
              <SectionHeader title="Account" subtitle="Your login credentials" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <AppInput label={s('username')} value={profile.username || ''} disabled />
                <AppInput label={s('email')}    value={profile.email    || ''} disabled />
              </div>
            </div>

            <hr className="border-gray-200" />

            {/* ── Profile Details ── */}
            <div className="flex flex-col gap-5">
              <SectionHeader title="Profile Details" subtitle="Your personal and professional information" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                <Controller name="firstName" control={control}
                  render={({ field }) => (
                    <AppInput label={s('first_name')} value={field.value} onChange={(e) => field.onChange(e.target.value)} onBlur={field.onBlur} disabled={!isEditing} error={formErrors.firstName?.message} />
                  )}
                />

                <Controller name="lastName" control={control}
                  render={({ field }) => (
                    <AppInput label={s('last_name')} value={field.value} onChange={(e) => field.onChange(e.target.value)} onBlur={field.onBlur} disabled={!isEditing} error={formErrors.lastName?.message} />
                  )}
                />

                <Controller name="targetRole" control={control}
                  render={({ field }) => (
                    <AppInput label={s('target_role')} value={field.value} onChange={(e) => field.onChange(e.target.value)} onBlur={field.onBlur} disabled={!isEditing} placeholder={s('target_role_placeholder')} error={formErrors.targetRole?.message} sx={{ gridColumn: { xs: '1 / -1', sm: 'span 2' } }} />
                  )}
                />

                <Controller name="gender" control={control}
                  render={({ field }) => (
                    <AppSelect label={s('gender')} value={field.value} onChange={(val) => field.onChange(val)} options={genderOptions} disabled={!isEditing} error={formErrors.gender?.message} />
                  )}
                />

                <Controller name="timezone" control={control}
                  render={({ field }) => (
                    <AppSelect label={s('timezone')} value={field.value} onChange={(val) => field.onChange(val)} options={timezoneOptions} disabled={!isEditing} error={formErrors.timezone?.message} />
                  )}
                />

                <Controller name="requiredExperienceLevel" control={control}
                  render={({ field }) => (
                    <AppSelect label={s('experience_level')} value={field.value} onChange={(val) => field.onChange(val)} options={experienceOptions} disabled={!isEditing} error={formErrors.requiredExperienceLevel?.message} sx={{ gridColumn: { xs: '1 / -1', sm: 'span 2' } }} />
                  )}
                />
              </div>
            </div>

            <hr className="border-gray-200" />

            {/* ── Contact Information ── */}
            <div className="flex flex-col gap-5">
              <SectionHeader title={t('candidate_settings.contact.title')} subtitle={c('subtitle')} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                <Controller name="phone" control={control}
                  render={({ field }) => (
                    <AppInput label={c('phone')} value={field.value} onChange={(e) => field.onChange(e.target.value)} onBlur={field.onBlur} disabled={!isEditing} error={formErrors.phone?.message} />
                  )}
                />

                <Controller name="location" control={control}
                  render={({ field }) => (
                    <AppInput label={c('location')} value={field.value} onChange={(e) => field.onChange(e.target.value)} onBlur={field.onBlur} disabled={!isEditing} error={formErrors.location?.message} />
                  )}
                />

                <Controller name="address" control={control}
                  render={({ field }) => (
                    <AppInput label={c('address')} value={field.value} onChange={(e) => field.onChange(e.target.value)} onBlur={field.onBlur} disabled={!isEditing} error={formErrors.address?.message} sx={{ gridColumn: { xs: '1 / -1', sm: 'span 2' } }} />
                  )}
                />

                <Controller name="linkedinUrl" control={control}
                  render={({ field }) => (
                    <AppInput label={c('linkedin')} value={field.value} onChange={(e) => field.onChange(e.target.value)} onBlur={field.onBlur} disabled={!isEditing} placeholder="https://linkedin.com/in/yourprofile" type="url" error={formErrors.linkedinUrl?.message} />
                  )}
                />

                <Controller name="githubUrl" control={control}
                  render={({ field }) => (
                    <AppInput label={c('github')} value={field.value} onChange={(e) => field.onChange(e.target.value)} onBlur={field.onBlur} disabled={!isEditing} placeholder="https://github.com/yourprofile" type="url" error={formErrors.githubUrl?.message} />
                  )}
                />

                <Controller name="personalWebsite" control={control}
                  render={({ field }) => (
                    <AppInput label={c('website')} value={field.value} onChange={(e) => field.onChange(e.target.value)} onBlur={field.onBlur} disabled={!isEditing} placeholder="https://yourwebsite.com" type="url" error={formErrors.personalWebsite?.message} sx={{ gridColumn: { xs: '1 / -1', sm: 'span 2' } }} />
                  )}
                />
              </div>
            </div>

            <hr className="border-gray-200" />

            {/* ── Resume / CV ── */}
            <CvSection
              resumeFilename={profile.resume}
              onUpdated={onCvUpdated}
              onDeleted={onCvDeleted}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default React.memo(PersonalInformationTab);
