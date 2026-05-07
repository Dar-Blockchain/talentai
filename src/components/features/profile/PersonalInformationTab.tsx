import React from 'react';
import {
  Box, TextField, Button, MenuItem, Select, FormControl,
  InputLabel, CircularProgress, Alert, Divider, Typography, FormHelperText,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { UserProfile } from '@/types/profile';
import { experienceLevels, timezones } from '@/constants/profile';
import ProfilePictureSection from './ProfilePictureSection';
import EditOutlined from '@mui/icons-material/EditOutlined';
import SaveOutlined from '@mui/icons-material/SaveOutlined';
import CloseOutlined from '@mui/icons-material/CloseOutlined';
import { Controller, SubmitErrorHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PersonalInformationFormValues, personalInformationSchema } from '@/validations/profileSchemas';

const T = '#0D9488';
const T_DARK = '#0F766E';
const T_LIGHT = '#F0FDFA';
const T_BORDER = '#99F6E4';
const NAVY = '#0F172A';
const SLATE = '#64748B';
const CARD_BORDER = '#E2E8F0';
const PAGE_BG = '#F8FAFC';

const fieldSx = {
  '& .MuiInputBase-root': { transition: 'all 0.24s cubic-bezier(0.4, 0, 0.2, 1)' },
  '& .MuiOutlinedInput-root': {
    borderRadius: '16px',
    fontSize: { xs: '0.86rem', md: '0.9rem' },
    fontWeight: 500,
    background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
    minHeight: 48,
    '& input, & textarea': {
      paddingTop: '13px',
      paddingBottom: '13px',
      letterSpacing: '0.01em',
      color: '#0F172A',
    },
    '& textarea::placeholder, & input::placeholder': {
      color: '#94A3B8',
      opacity: 1,
      fontWeight: 400,
    },
    '&.Mui-focused fieldset': {
      borderColor: '#2DD4BF',
      borderWidth: 1.2,
    },
    '&:hover fieldset': { borderColor: '#99F6E4' },
    '& fieldset': { borderColor: '#E2E8F0' },
    '&.Mui-disabled': {
      background: 'linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 100%)',
      color: '#94A3B8',
    },
  },
  '& .MuiOutlinedInput-root:not(.Mui-disabled):hover': {
    boxShadow: '0 6px 18px rgba(15,23,42,0.07), 0 2px 8px rgba(45,212,191,0.08)',
  },
  '& .MuiOutlinedInput-root.Mui-focused': {
    boxShadow: '0 0 0 4px rgba(45,212,191,0.18), 0 10px 24px rgba(15,23,42,0.08)',
  },
  '& .MuiInputLabel-root.Mui-focused': { color: T_DARK },
  '& .MuiInputLabel-root': {
    fontSize: '0.76rem',
    color: '#64748B',
    fontWeight: 600,
    letterSpacing: '0.01em',
  },
  '& .MuiFormHelperText-root': {
    marginLeft: 2,
    marginTop: 0.5,
    fontSize: '0.72rem',
    lineHeight: 1.3,
  },
  '& .MuiFormHelperText-root.Mui-error': {
    color: '#DC2626',
    fontWeight: 500,
  },
  '& .MuiSvgIcon-root': {
    color: '#64748B',
    transition: 'color 0.2s ease',
  },
  '& .Mui-focused .MuiSvgIcon-root': {
    color: T_DARK,
  },
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

type SelectFieldKey = 'gender' | 'timezone' | 'requiredExperienceLevel';
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
    { key: 'targetRole', labelKey: 'target_role', placeholderKey: 'target_role_placeholder', scope: 'personal' },
  ];

  const contactTextFields: SharedTextFieldConfig[] = [
    { key: 'phone', labelKey: 'phone', scope: 'contact' },
    { key: 'location', labelKey: 'location', scope: 'contact' },
    { key: 'address', labelKey: 'address', scope: 'contact' },
    { key: 'linkedinUrl', labelKey: 'linkedin', scope: 'contact' },
    { key: 'githubUrl', labelKey: 'github', scope: 'contact' },
    { key: 'personalWebsite', labelKey: 'website', scope: 'contact' },
  ];

  const personalSelectFields: SharedSelectFieldConfig[] = [
    {
      key: 'gender',
      labelKey: 'gender',
      options: ['Male', 'Female', 'Prefer not to say'],
      optionLabelMap: { Male: 'gender_male', Female: 'gender_female', 'Prefer not to say': 'gender_other' },
    },
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

  const selectMenuProps = {
    PaperProps: {
      sx: {
        mt: 0.8,
        borderRadius: '14px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 14px 32px rgba(15,23,42,0.12)',
        p: 0.4,
        '& .MuiMenuItem-root': {
          fontSize: '0.86rem',
          py: 1,
          px: 1.2,
          borderRadius: '8px',
          transition: 'all 0.16s ease',
        },
        '& .MuiMenuItem-root:hover': { bgcolor: '#F0FDFA' },
        '& .MuiMenuItem-root.Mui-selected': {
          bgcolor: '#CCFBF1',
          color: '#0F766E',
          fontWeight: 700,
        },
        '& .MuiMenuItem-root.Mui-selected:hover': { bgcolor: '#99F6E4' },
      },
    },
  };

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
            MenuProps={selectMenuProps}
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
          sx={{
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '0.76rem',
            color: T_DARK,
            bgcolor: T_LIGHT,
            border: `1px solid ${T_BORDER}`,
            borderRadius: '11px',
            px: 1.7,
            py: 0.5,
            transition: 'all 0.2s ease',
            '&:hover': { bgcolor: '#CCFBF1', transform: 'translateY(-1px)' },
          }}
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
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.76rem',
            color: '#475569',
            bgcolor: '#FFFFFF',
            border: '1px solid #CBD5E1',
            borderRadius: '11px',
            px: 1.7,
            py: 0.5,
            transition: 'all 0.2s ease',
            '&:hover': { bgcolor: '#F8FAFC', borderColor: '#94A3B8' },
          }}
        >
          {s('cancel')}
        </Button>
        <Button
          size="small"
          startIcon={loading ? undefined : <SaveOutlined sx={{ fontSize: '14px !important' }} />}
          onClick={handleSubmit(handleValidSubmit, handleInvalidSubmit)}
          disabled={loading}
          sx={{
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '0.76rem',
            color: '#fff',
            bgcolor: T,
            borderRadius: '11px',
            px: 1.8,
            py: 0.5,
            transition: 'all 0.2s ease',
            '&:hover': { bgcolor: T_DARK, transform: 'translateY(-1px)' },
          }}
        >
          {loading ? <CircularProgress size={14} color="inherit" /> : s('save')}
        </Button>
      </Box>
    );
  };

  const sectionTitleSx = {
    mb: 1,
    mt: 2.2,
    fontSize: '0.72rem',
    fontWeight: 700,
    color: SLATE,
    textTransform: 'uppercase',
    letterSpacing: '0.09em',
  };

  const sectionBoxSx = {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
    gap: { xs: 1.3, md: 1.6 },
    p: { xs: 1.4, md: 1.8 },
    border: `1px solid ${CARD_BORDER}`,
    borderRadius: '16px',
    bgcolor: '#FFFFFF',
    boxShadow: '0 8px 24px rgba(15,23,42,0.05)',
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
    <Box sx={{ bgcolor: PAGE_BG, p: { xs: 1, sm: 1.5, md: 2 } }}>
      <Box sx={{ bgcolor: '#fff', borderRadius: '22px', border: `1px solid ${CARD_BORDER}`, overflow: 'hidden', boxShadow: '0 20px 45px rgba(15,23,42,0.08)' }}>
      <Box
        sx={{
          px: { xs: 1.8, md: 2.6 },
          py: 1.7,
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 1,
          flexDirection: { xs: 'column', sm: 'row' },
          background: 'linear-gradient(180deg, #FFFFFF 0%, #FAFCFF 100%)',
        }}
      >
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: { xs: '0.95rem', md: '1rem' }, color: NAVY, letterSpacing: '-0.01em' }}>{s('title')}</Typography>
          <Typography sx={{ fontSize: '0.78rem', color: '#64748B', mt: 0.35, maxWidth: 560 }}>{s('subtitle')}</Typography>
        </Box>
        {renderHeaderActions()}
      </Box>

      <Box sx={{ p: { xs: 1.4, md: 2.2 }, background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)' }}>
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
    </Box>
  );
};

export default React.memo(PersonalInformationTab);
