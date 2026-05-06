import React from 'react';
import {
  Box, TextField, Button, MenuItem, Select, FormControl,
  InputLabel, CircularProgress, Alert, Divider, Typography, FormHelperText,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { UserProfile } from '@/types/profile';
import { experienceLevels, countries, timezones } from '@/constants/profile';
import ProfilePictureSection from './ProfilePictureSection';
import EditOutlined from '@mui/icons-material/EditOutlined';
import SaveOutlined from '@mui/icons-material/SaveOutlined';
import CloseOutlined from '@mui/icons-material/CloseOutlined';
import { Controller, SubmitErrorHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PersonalInformationFormValues, personalInformationSchema } from '@/validations/profileSchemas';

const T = '#0D9488';
const TBG = '#F0FDFA';
const TBRD = '#99F6E4';
const NAVY = '#0D1B2A';
const SLATE = '#64748B';

const fieldSx = {
  '& .MuiInputBase-root': { transition: 'all 0.2s ease' },
  '& .MuiOutlinedInput-root': {
    borderRadius: '13px',
    fontSize: '0.8rem',
    background: '#fff',
    minHeight: 38,
    '&.Mui-focused fieldset': { borderColor: T, borderWidth: 1.2 },
    '&:hover fieldset': { borderColor: T },
    '& fieldset': { borderColor: '#E2E8F0' },
    '&.Mui-disabled': { background: '#F8FAFC' },
  },
  '& .MuiOutlinedInput-root:not(.Mui-disabled):hover': {
    boxShadow: '0 3px 12px rgba(13,148,136,0.10)',
  },
  '& .MuiOutlinedInput-root.Mui-focused': {
    boxShadow: '0 0 0 4px rgba(20,184,166,0.12)',
  },
  '& .MuiInputLabel-root.Mui-focused': { color: T },
  '& .MuiInputLabel-root': { fontSize: '0.76rem', color: SLATE },
  '& .MuiFormHelperText-root': { marginLeft: 0, fontSize: '0.68rem', lineHeight: 1.2 },
};

type TextFieldKey =
  | 'firstName'
  | 'lastName'
  | 'targetRole'
  | 'phone'
  | 'location'
  | 'address'
  | 'linkedinUrl'
  | 'githubUrl'
  | 'personalWebsite';

type SelectFieldKey = 'gender' | 'country' | 'timezone' | 'requiredExperienceLevel';
type FieldScope = 'personal' | 'contact';

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

interface SharedTextFieldConfig {
  key: TextFieldKey;
  labelKey: string;
  scope: FieldScope;
  placeholderKey?: string;
  fullWidth?: boolean;
}

interface SharedSelectFieldConfig {
  key: SelectFieldKey;
  labelKey: string;
  options: string[];
  optionLabelMap?: Record<string, string>;
}

const getPersonalFormDefaults = (profile: UserProfile): PersonalInformationFormValues => ({
  firstName: profile.firstName || '',
  lastName: profile.lastName || '',
  gender: profile.gender || 'Male',
  country: profile.country || 'Tunisia',
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

const PersonalInformationTab: React.FC<PersonalInformationTabProps> = ({
  profile, isEditing, loading, saveSuccess, error,
  uploadingImage, onImageUpload, onSave, onCancel, onEditToggle,
}) => {
  const { t } = useTranslation('dashboard');
  const s = (k: string) => t(`candidate_settings.personal.${k}`);
  const c = (k: string) => t(`candidate_settings.contact.${k}`);
  const labelByScope = (scope: FieldScope, labelKey: string) => (
    scope === 'personal' ? s(labelKey) : c(labelKey)
  );
  const placeholderByScope = (scope: FieldScope, placeholderKey?: string) => (
    placeholderKey ? (scope === 'personal' ? s(placeholderKey) : c(placeholderKey)) : undefined
  );

  const isLoading = loading && !profile.firstName && !profile.username;
  const isNotWorkingValue = /^not\s+working$/i.test(profile.requiredExperienceLevel || '');
  const [submitErrorMessage, setSubmitErrorMessage] = React.useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PersonalInformationFormValues>({
    resolver: zodResolver(personalInformationSchema),
    mode: 'onChange',
    defaultValues: getPersonalFormDefaults(profile),
  });

  React.useEffect(() => {
    setSubmitErrorMessage(null);
    reset(getPersonalFormDefaults(profile));
  }, [profile, reset]);

  const handleValidSubmit = (values: PersonalInformationFormValues) => {
    setSubmitErrorMessage(null);
    onSave(values);
  };

  const handleInvalidSubmit: SubmitErrorHandler<PersonalInformationFormValues> = (formErrors) => {
    const firstError = Object.values(formErrors)[0];
    setSubmitErrorMessage(firstError?.message || s('validation_fix_fields'));
  };

  const personalTextFields: SharedTextFieldConfig[] = [
    { key: 'firstName', labelKey: 'first_name', scope: 'personal' },
    { key: 'lastName', labelKey: 'last_name', scope: 'personal' },
    { key: 'targetRole', labelKey: 'target_role', placeholderKey: 'target_role_placeholder', fullWidth: true, scope: 'personal' },
  ];

  const contactTextFields: SharedTextFieldConfig[] = [
    { key: 'phone', labelKey: 'phone', scope: 'contact' },
    { key: 'location', labelKey: 'location', scope: 'contact' },
    { key: 'address', labelKey: 'address', scope: 'contact', fullWidth: true },
    { key: 'linkedinUrl', labelKey: 'linkedin', scope: 'contact' },
    { key: 'githubUrl', labelKey: 'github', scope: 'contact' },
    { key: 'personalWebsite', labelKey: 'website', scope: 'contact', fullWidth: true },
  ];

  const personalSelectFields: SharedSelectFieldConfig[] = [
    {
      key: 'gender',
      labelKey: 'gender',
      options: ['Male', 'Female', 'Prefer not to say'],
      optionLabelMap: { Male: 'gender_male', Female: 'gender_female', 'Prefer not to say': 'gender_other' },
    },
    { key: 'country', labelKey: 'country', options: countries },
    { key: 'timezone', labelKey: 'timezone', options: timezones },
    { key: 'requiredExperienceLevel', labelKey: 'experience_level', options: experienceLevels },
  ];

  const renderSharedTextField = (item: SharedTextFieldConfig) => (
    <Controller
      key={item.key}
      name={item.key}
      control={control}
      render={({ field }) => (
        <TextField
          {...field}
          label={labelByScope(item.scope, item.labelKey)}
          placeholder={placeholderByScope(item.scope, item.placeholderKey)}
          disabled={!isEditing}
          fullWidth
          error={!!errors[item.key]}
          helperText={errors[item.key]?.message || ''}
          sx={item.fullWidth ? { gridColumn: { xs: '1 / -1', sm: 'span 2' }, ...fieldSx } : fieldSx}
        />
      )}
    />
  );

  const renderSharedSelectField = (item: SharedSelectFieldConfig) => (
    <FormControl key={item.key} fullWidth disabled={!isEditing} sx={fieldSx} error={!!errors[item.key]}>
      <InputLabel>{s(item.labelKey)}</InputLabel>
      <Controller
        name={item.key}
        control={control}
        render={({ field }) => (
          <Select
            {...field}
            label={s(item.labelKey)}
            renderValue={
              item.key === 'requiredExperienceLevel'
                ? (selected) => (/^not\s+working$/i.test(selected) ? s('experience_not_currently_employed') : selected)
                : undefined
            }
          >
            {item.options.map((opt) => (
              <MenuItem key={opt} value={opt}>
                {item.optionLabelMap ? s(item.optionLabelMap[opt]) : opt}
              </MenuItem>
            ))}
            {item.key === 'requiredExperienceLevel' && !experienceLevels.includes('Not working') && isNotWorkingValue && (
              <MenuItem value={profile.requiredExperienceLevel}>{s('experience_not_currently_employed')}</MenuItem>
            )}
          </Select>
        )}
      />
      <FormHelperText>{errors[item.key]?.message || ''}</FormHelperText>
    </FormControl>
  );

  const renderHeaderActions = () => {
    if (!isEditing) {
      return (
        <Button
          size="small"
          startIcon={<EditOutlined sx={{ fontSize: '14px !important' }} />}
          onClick={onEditToggle}
          sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.72rem', color: T, bgcolor: TBG, border: `1px solid ${TBRD}`, borderRadius: '10px', px: 1.5, '&:hover': { bgcolor: '#CCFBF1' } }}
        >
          {s('edit')}
        </Button>
      );
    }

    return (
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          size="small"
          startIcon={<CloseOutlined sx={{ fontSize: '14px !important' }} />}
          onClick={onCancel}
          sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.72rem', color: '#6B7280', bgcolor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '10px', px: 1.45 }}
        >
          {s('cancel')}
        </Button>
        <Button
          size="small"
          startIcon={loading ? undefined : <SaveOutlined sx={{ fontSize: '14px !important' }} />}
          onClick={handleSubmit(handleValidSubmit, handleInvalidSubmit)}
          disabled={loading}
          sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.72rem', color: '#fff', bgcolor: T, borderRadius: '10px', px: 1.6, '&:hover': { bgcolor: '#0F766E' } }}
        >
          {loading ? <CircularProgress size={14} color="inherit" /> : s('save')}
        </Button>
      </Box>
    );
  };

  const sectionTitleSx = {
    mb: 0.75,
    mt: 1.3,
    fontSize: '0.66rem',
    fontWeight: 800,
    color: SLATE,
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
  };

  const sectionBoxSx = {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
    gap: 1.2,
    p: 1,
    border: '1px solid #ECF2F8',
    borderRadius: '14px',
    bgcolor: '#FFFFFF',
  };

  const renderSection = (title: string, content: React.ReactNode, options?: { tinted?: boolean; first?: boolean }) => (
    <>
      <Typography sx={{ ...sectionTitleSx, mt: options?.first ? 0 : sectionTitleSx.mt }}>{title}</Typography>
      <Box sx={{ ...sectionBoxSx, ...(options?.tinted ? { bgcolor: '#FAFDFC' } : {}) }}>
        {content}
      </Box>
    </>
  );

  return (
    <Box sx={{ bgcolor: '#fff', borderRadius: '20px', border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 14px 32px rgba(2,6,23,0.07)' }}>
      <Box sx={{ px: { xs: 2, md: 2.6 }, py: 1.5, borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: '0.94rem', color: NAVY, letterSpacing: '-0.01em' }}>{s('title')}</Typography>
          <Typography sx={{ fontSize: '0.7rem', color: '#94A3B8', mt: 0.2 }}>{s('subtitle')}</Typography>
        </Box>
        {renderHeaderActions()}
      </Box>

      <Box sx={{ p: { xs: 1.5, md: 2 }, background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FCFC 100%)' }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress sx={{ color: T }} size={28} />
          </Box>
        ) : (
          <>
            {saveSuccess && <Alert severity="success" sx={{ mb: 1.5, borderRadius: '10px', fontSize: '0.8rem' }}>{s('save_success')}</Alert>}
            {error && <Alert severity="error" sx={{ mb: 1.5, borderRadius: '10px', fontSize: '0.8rem' }}>{error}</Alert>}
            {submitErrorMessage && <Alert severity="error" sx={{ mb: 1.5, borderRadius: '10px', fontSize: '0.8rem' }}>{submitErrorMessage}</Alert>}

            <ProfilePictureSection
              profile={profile}
              uploadingImage={uploadingImage}
              isEditing={isEditing}
              onImageUpload={onImageUpload}
              onEditClick={onEditToggle}
            />

            <Divider sx={{ my: 1.2 }} />

            {renderSection(
              'Account',
              <>
                <TextField label={s('username')} value={profile.username || ''} disabled fullWidth sx={fieldSx} />
                <TextField label={s('email')} value={profile.email || ''} disabled fullWidth sx={fieldSx} />
              </>,
              { tinted: true, first: true }
            )}

            {renderSection(
              'Profile Details',
              <>
                {personalTextFields.map(renderSharedTextField)}
                {personalSelectFields.map(renderSharedSelectField)}
              </>
            )}

            {renderSection(
              t('candidate_settings.contact.title'),
              <>{contactTextFields.map(renderSharedTextField)}</>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export default React.memo(PersonalInformationTab);
