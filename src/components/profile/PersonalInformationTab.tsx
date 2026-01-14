import React from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Divider,
  Typography,
  SelectChangeEvent,
} from '@mui/material';
import { UserProfile } from '@/types/profile';
import {
  experienceLevels,
  countries,
  languages,
  timezones,
  employmentTypes,
  companySizes,
  industries,
} from '@/constants/profile';
import ProfilePictureSection from './ProfilePictureSection';

interface PersonalInformationTabProps {
  profile: UserProfile;
  isEditing: boolean;
  loading: boolean;
  saveSuccess: boolean;
  error: string | null;
  uploadingImage: boolean;
  onInputChange: (field: keyof UserProfile, value: string) => void;
  onSelectChange: (event: SelectChangeEvent<string>, field: keyof UserProfile) => void;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
  onCancel: () => void;
  onEditToggle: () => void;
}

const PersonalInformationTab: React.FC<PersonalInformationTabProps> = ({
  profile,
  isEditing,
  loading,
  saveSuccess,
  error,
  uploadingImage,
  onInputChange,
  onSelectChange,
  onImageUpload,
  onSave,
  onCancel,
  onEditToggle,
}) => {
  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      '&.Mui-focused fieldset': {
        borderColor: '#8310FF',
      },
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: '#8310FF',
    },
  };

  const selectSx = {
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#8310FF',
    },
  };

  // For company profiles, wait until company name is loaded
  const isCompanyProfile = profile.profileType === 'Company';
  const isLoadingCompanyData = isCompanyProfile && loading && !profile.name && !profile.companyName;
  const isCandidateLoadingData = !isCompanyProfile && loading && !profile.username;

  return (
    <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)', mb: 3 }}>
      <CardContent sx={{ p: 4 }}>
        {(isLoadingCompanyData || isCandidateLoadingData) ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
            <CircularProgress sx={{ color: '#8310FF' }} />
          </Box>
        ) : (
          <>
            {/* Header */}
            <Box sx={{ backgroundColor: 'rgba(131, 16, 255, 0.04)', p: 3, borderRadius: 2, mb: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 0.5 }}>
                {profile.profileType === 'Company' ? 'Company Information' : 'Personal Information'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                {profile.profileType === 'Company'
                  ? 'Manage your company profile and business details'
                  : 'Manage your profile details and preferences'
                }
              </Typography>
            </Box>

            {saveSuccess && (
              <Alert severity="success" sx={{ mb: 3 }}>
                Profile updated successfully!
              </Alert>
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {/* Only show content when not in initial loading state */}
            {(!loading || profile.firstName || profile.name || profile.companyName) && (
              <>
                {/* Profile Picture Section */}
                <ProfilePictureSection
                  profile={profile}
                  uploadingImage={uploadingImage}
                  isEditing={isEditing}
                  onImageUpload={onImageUpload}
                  onEditClick={onEditToggle}
                />

                <Divider sx={{ my: 3 }} />

                {/* Form Fields - Different for Candidate vs Company */}
                {profile.profileType === 'Candidate' ? (
                  // Candidate Fields
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
                    <TextField
                      label="Username"
                      value={profile.username}
                      disabled={true}
                      fullWidth
                      sx={fieldSx}
                    />

                    <TextField
                      label="Email"
                      value={profile.email}
                      disabled={true}
                      fullWidth
                      type="email"
                      sx={fieldSx}
                    />

                    <TextField
                      label="First Name"
                      value={profile.firstName}
                      onChange={(e) => onInputChange('firstName', e.target.value)}
                      disabled={!isEditing}
                      fullWidth
                      sx={fieldSx}
                    />

                    <TextField
                      label="Last Name"
                      value={profile.lastName}
                      onChange={(e) => onInputChange('lastName', e.target.value)}
                      disabled={!isEditing}
                      fullWidth
                      sx={fieldSx}
                    />

                    <FormControl fullWidth disabled={!isEditing}>
                      <InputLabel>Gender</InputLabel>
                      <Select
                        value={profile.gender}
                        onChange={(e) => onSelectChange(e, 'gender')}
                        label="Gender"
                        sx={selectSx}
                      >
                        <MenuItem value="Male">Male</MenuItem>
                        <MenuItem value="Female">Female</MenuItem>
                        <MenuItem value="Prefer not to say">Prefer not to say</MenuItem>
                      </Select>
                    </FormControl>

                    <FormControl fullWidth disabled={!isEditing}>
                      <InputLabel>Country</InputLabel>
                      <Select
                        value={profile.country}
                        onChange={(e) => onSelectChange(e, 'country')}
                        label="Country"
                        sx={selectSx}
                      >
                        {countries.map((country) => (
                          <MenuItem key={country} value={country}>
                            {country}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl fullWidth disabled={!isEditing}>
                      <InputLabel>Language</InputLabel>
                      <Select
                        value={profile.language}
                        onChange={(e) => onSelectChange(e, 'language')}
                        label="Language"
                        sx={selectSx}
                      >
                        {languages.map((lang) => (
                          <MenuItem key={lang} value={lang}>
                            {lang}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl fullWidth disabled={!isEditing}>
                      <InputLabel>Time Zone</InputLabel>
                      <Select
                        value={profile.timezone}
                        onChange={(e) => onSelectChange(e, 'timezone')}
                        label="Time Zone"
                        sx={selectSx}
                      >
                        {timezones.map((tz) => (
                          <MenuItem key={tz} value={tz}>
                            {tz}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl fullWidth disabled={!isEditing}>
                      <InputLabel>Experience Level</InputLabel>
                      <Select
                        value={profile.requiredExperienceLevel}
                        onChange={(e) => onSelectChange(e, 'requiredExperienceLevel')}
                        label="Experience Level"
                        sx={selectSx}
                      >
                        {experienceLevels.map((level) => (
                          <MenuItem key={level} value={level}>
                            {level}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <TextField
                      label="Target Role"
                      value={profile.targetRole}
                      onChange={(e) => onInputChange('targetRole', e.target.value)}
                      disabled={!isEditing}
                      fullWidth
                      placeholder="e.g., Software Engineer, Product Manager"
                      sx={fieldSx}
                    />
                  </Box>
                ) : (
                  // Company Fields
                  <>
                    {/* Debug logging */}
                    {console.log('🎨 [PersonalInformationTab] Rendering company fields:', {
                      name: profile.name,
                      companyName: profile.companyName,
                      displayValue: profile.name || profile.companyName,
                    })}
                    {/* Editable Company Fields */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
                      <TextField
                        label="Company Name"
                        value={profile.name || profile.companyName || ''}
                        onChange={(e) => {
                          onInputChange('name', e.target.value);
                          onInputChange('companyName', e.target.value);
                        }}
                        disabled={!isEditing}
                        fullWidth
                        sx={{
                          gridColumn: { xs: '1 / -1', sm: 'span 2' },
                          ...fieldSx,
                        }}
                      />

                      <TextField
                        label="Company Email"
                        value={profile.email}
                        disabled={true}
                        fullWidth
                        type="email"
                        sx={{
                          gridColumn: { xs: '1 / -1', sm: 'span 2' },
                          ...fieldSx,
                        }}
                      />

                      <FormControl fullWidth disabled={!isEditing} sx={fieldSx}>
                        <InputLabel>Industry</InputLabel>
                        <Select
                          value={profile.industry || ''}
                          onChange={(e) => onSelectChange(e, 'industry')}
                          label="Industry"
                        >
                          {industries.map((ind) => (
                            <MenuItem key={ind} value={ind}>
                              {ind}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <FormControl fullWidth disabled={!isEditing} sx={fieldSx}>
                        <InputLabel>Company Size</InputLabel>
                        <Select
                          value={profile.size || profile.companySize || ''}
                          onChange={(e) => {
                            onSelectChange(e, 'size');
                            onSelectChange(e, 'companySize');
                          }}
                          label="Company Size"
                        >
                          {companySizes.map((size) => (
                            <MenuItem key={size} value={size}>
                              {size}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <FormControl fullWidth disabled={!isEditing} sx={fieldSx}>
                        <InputLabel>Employment Type</InputLabel>
                        <Select
                          value={profile.employmentType || 'Remote'}
                          onChange={(e) => onSelectChange(e, 'employmentType')}
                          label="Employment Type"
                        >
                          {employmentTypes.map((type) => (
                            <MenuItem key={type} value={type}>
                              {type}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <FormControl fullWidth disabled={!isEditing} sx={fieldSx}>
                        <InputLabel>Required Experience Level</InputLabel>
                        <Select
                          value={profile.requiredExperienceLevel || 'Mid Level'}
                          onChange={(e) => onSelectChange(e, 'requiredExperienceLevel')}
                          label="Required Experience Level"
                        >
                          {experienceLevels.map((level) => (
                            <MenuItem key={level} value={level}>
                              {level}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                  </>
                )}

                {isEditing && (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
                    <Button
                      variant="outlined"
                      onClick={onCancel}
                      sx={{
                        textTransform: 'none',
                        borderColor: '#d1d5db',
                        color: '#6b7280',
                        '&:hover': {
                          borderColor: '#9ca3af',
                          backgroundColor: 'rgba(107, 114, 128, 0.04)',
                        },
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      onClick={onSave}
                      disabled={loading}
                      sx={{
                        textTransform: 'none',
                        backgroundColor: '#8310FF',
                        '&:hover': {
                          backgroundColor: '#6a0dd4',
                        },
                      }}
                    >
                      {loading ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
                    </Button>
                  </Box>
                )}
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default React.memo(PersonalInformationTab);
