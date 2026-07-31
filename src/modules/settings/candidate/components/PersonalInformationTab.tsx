import React, { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PersonalInformationFormValues } from '@/modules/settings/candidate/schemas';
import { experienceLevels, timezones } from '../constants';
import ProfilePictureSection from './ProfilePictureSection';
import { EditActions, Spinner } from '@/modules/settings/shared/components';
import { Input } from '@/modules/shared/ui/shadcn/input';
import { Label } from '@/modules/shared/ui/shadcn/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/modules/shared/ui/shadcn/select';
import { UserProfile } from '../../shared';

type EditingSection = 'profile' | 'contact' | null;

interface PersonalInformationTabProps {
  profile:        UserProfile;
  control:        Control<PersonalInformationFormValues>;
  formErrors:     FieldErrors<PersonalInformationFormValues>;
  isEditing:      boolean;
  loading:        boolean;
  saveSuccess:    boolean;
  uploadingImage: boolean;
  onImageUpload:  (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSave:         () => void;
  onCancel:       () => void;
  onEditToggle:   () => void;
  onCvUpdated?:   (filename: string, cvAnalysis?: unknown) => void;
  onCvDeleted?:   () => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

interface SectionHeaderProps {
  title:    string;
  subtitle?: string;
  actions?: React.ReactNode;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, actions }) => (
  <div className="flex items-center justify-between gap-2 px-3 py-2 bg-primary-light/50 border border-primary-border rounded-xl border-l-[3px] border-l-primary">
    <p className="text-xs font-bold text-primary-dark uppercase tracking-wide truncate">{title}</p>
    <div className="shrink-0">{actions}</div>
  </div>
);

interface FieldProps {
  label:     string;
  error?:    string;
  required?: boolean;
  className?: string;
  children:  React.ReactNode;
}

const Field: React.FC<FieldProps> = ({ label, error, required, className, children }) => (
  <div className={cn("flex flex-col gap-1", className)}>
    <Label className="text-[0.68rem] font-semibold text-muted-foreground uppercase tracking-wide">
      {label}{required && <span className="text-destructive ml-0.5">*</span>}
    </Label>
    {children}
    {error && <p className="text-[0.7rem] text-destructive">{error}</p>}
  </div>
);

// ─── Tab ─────────────────────────────────────────────────────────────────────

const PersonalInformationTab: React.FC<PersonalInformationTabProps> = ({
  profile, control, formErrors, loading, saveSuccess,
  uploadingImage, onImageUpload, onSave, onCancel, onEditToggle,
}) => {
  const { t } = useTranslation('dashboard');
  const s = (k: string) => t(`candidate_settings.personal.${k}`);
  const c = (k: string) => t(`candidate_settings.contact.${k}`);

  const [editingSection, setEditingSection] = useState<EditingSection>(null);

  useEffect(() => {
    if (saveSuccess) setEditingSection(null);
  }, [saveSuccess]);

  const handleEdit = (section: EditingSection) => {
    setEditingSection(section);
    onEditToggle();
  };

  const handleSave   = () => { onSave(); };
  const handleCancel = () => { onCancel(); setEditingSection(null); };

  const isLoading          = loading && !profile.firstName && !profile.username;
  const isNotWorkingValue  = /^not\s+working$/i.test(profile.requiredExperienceLevel || '');
  const someoneEditing     = editingSection !== null;

  const genderOptions = useMemo(() => [
    { value: 'Male',              label: s('gender_male') },
    { value: 'Female',            label: s('gender_female') },
    { value: 'Prefer not to say', label: s('gender_other') },
  ], [t]);

  const timezoneOptions = useMemo(() => timezones.map(tz => ({ value: tz, label: tz })), []);

  const experienceOptions = useMemo(() => {
    const opts = experienceLevels.map(el => ({ value: el, label: el }));
    if (isNotWorkingValue && !experienceLevels.includes('Not working') && profile.requiredExperienceLevel)
      opts.push({ value: profile.requiredExperienceLevel, label: s('experience_not_currently_employed') });
    return opts;
  }, [isNotWorkingValue, profile.requiredExperienceLevel, t]);

  const inputCls = "h-9 text-sm disabled:bg-muted/40 disabled:cursor-default";
  const triggerCls = "h-9 text-sm disabled:bg-muted/40 disabled:cursor-default";

  const profileActions = (
    <EditActions
      isEditing={editingSection === 'profile'}
      loading={loading && editingSection === 'profile'}
      onEdit={() => handleEdit('profile')}
      onCancel={handleCancel}
      onSave={handleSave}
      disabled={someoneEditing && editingSection !== 'profile'}
    />
  );

  const contactActions = (
    <EditActions
      isEditing={editingSection === 'contact'}
      loading={loading && editingSection === 'contact'}
      onEdit={() => handleEdit('contact')}
      onCancel={handleCancel}
      onSave={handleSave}
      disabled={someoneEditing && editingSection !== 'contact'}
    />
  );

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">

      {/* Card header */}
      <div className="px-4 py-3 border-b border-border">
        <p className="font-bold text-sm text-foreground">{s('title')}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{s('subtitle')}</p>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 md:p-6 flex flex-col gap-5">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size={28} />
          </div>
        ) : (
          <>
            {/* Alerts */}
            {saveSuccess && (
              <div className="flex items-center gap-2 rounded-xl bg-primary-light border border-primary-border px-3 py-2 text-xs text-primary-dark">
                <CheckCircle2 size={14} className="shrink-0" />
                {s('save_success')}
              </div>
            )}
            {/* Avatar */}
            <ProfilePictureSection
              profile={profile}
              uploadingImage={uploadingImage}
              isEditing={someoneEditing}
              onImageUpload={onImageUpload}
              onEditClick={() => handleEdit('profile')}
            />

            <hr className="border-border" />

            {/* ── Profile Details ────────────────────────────── */}
            <div className="flex flex-col gap-3">
              <SectionHeader title="Profile Details" actions={profileActions} />

              {/* First + Last name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Controller name="firstName" control={control}
                  render={({ field }) => (
                    <Field label={s('first_name')} error={formErrors.firstName?.message}>
                      <Input {...field} disabled={editingSection !== 'profile'} className={inputCls} />
                    </Field>
                  )}
                />
                <Controller name="lastName" control={control}
                  render={({ field }) => (
                    <Field label={s('last_name')} error={formErrors.lastName?.message}>
                      <Input {...field} disabled={editingSection !== 'profile'} className={inputCls} />
                    </Field>
                  )}
                />
              </div>

              {/* Target role + Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Controller name="targetRole" control={control}
                  render={({ field }) => (
                    <Field label={s('target_role')} error={formErrors.targetRole?.message}>
                      <Input {...field} disabled={editingSection !== 'profile'} placeholder={s('target_role_placeholder')} className={inputCls} />
                    </Field>
                  )}
                />
                <Controller name="gender" control={control}
                  render={({ field }) => (
                    <Field label={s('gender')} error={formErrors.gender?.message}>
                      <Select value={field.value} onValueChange={field.onChange} disabled={editingSection !== 'profile'}>
                        <SelectTrigger className={triggerCls}><SelectValue placeholder="Select…" /></SelectTrigger>
                        <SelectContent>
                          {genderOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </Field>
                  )}
                />
              </div>

              {/* Timezone + Experience */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Controller name="timezone" control={control}
                  render={({ field }) => (
                    <Field label={s('timezone')} error={formErrors.timezone?.message}>
                      <Select value={field.value} onValueChange={field.onChange} disabled={editingSection !== 'profile'}>
                        <SelectTrigger className={triggerCls}><SelectValue placeholder="Select…" /></SelectTrigger>
                        <SelectContent>
                          {timezoneOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </Field>
                  )}
                />
                <Controller name="requiredExperienceLevel" control={control}
                  render={({ field }) => (
                    <Field label={s('experience_level')} error={formErrors.requiredExperienceLevel?.message}>
                      <Select value={field.value} onValueChange={field.onChange} disabled={editingSection !== 'profile'}>
                        <SelectTrigger className={triggerCls}><SelectValue placeholder="Select…" /></SelectTrigger>
                        <SelectContent>
                          {experienceOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </Field>
                  )}
                />
              </div>
            </div>

            <hr className="border-border" />

            {/* ── Contact Information ────────────────────────── */}
            <div className="flex flex-col gap-3">
              <SectionHeader title={t('candidate_settings.contact.title')} actions={contactActions} />

              {/* Phone + Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Controller name="phone" control={control}
                  render={({ field }) => (
                    <Field label={c('phone')} error={formErrors.phone?.message}>
                      <Input {...field} disabled={editingSection !== 'contact'} className={inputCls} />
                    </Field>
                  )}
                />
                <Controller name="location" control={control}
                  render={({ field }) => (
                    <Field label={c('location')} error={formErrors.location?.message}>
                      <Input {...field} disabled={editingSection !== 'contact'} className={inputCls} />
                    </Field>
                  )}
                />
              </div>

              {/* Address — full width */}
              <Controller name="address" control={control}
                render={({ field }) => (
                  <Field label={c('address')} error={formErrors.address?.message}>
                    <Input {...field} disabled={editingSection !== 'contact'} className={inputCls} />
                  </Field>
                )}
              />

              {/* LinkedIn + GitHub */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Controller name="linkedinUrl" control={control}
                  render={({ field }) => (
                    <Field label={c('linkedin')} error={formErrors.linkedinUrl?.message}>
                      <Input {...field} type="url" disabled={editingSection !== 'contact'} placeholder="linkedin.com/in/…" className={inputCls} />
                    </Field>
                  )}
                />
                <Controller name="githubUrl" control={control}
                  render={({ field }) => (
                    <Field label={c('github')} error={formErrors.githubUrl?.message}>
                      <Input {...field} type="url" disabled={editingSection !== 'contact'} placeholder="github.com/…" className={inputCls} />
                    </Field>
                  )}
                />
              </div>

              {/* Website — full width */}
              <Controller name="personalWebsite" control={control}
                render={({ field }) => (
                  <Field label={c('website')} error={formErrors.personalWebsite?.message}>
                    <Input {...field} type="url" disabled={editingSection !== 'contact'} placeholder="https://yourwebsite.com" className={inputCls} />
                  </Field>
                )}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default React.memo(PersonalInformationTab);
