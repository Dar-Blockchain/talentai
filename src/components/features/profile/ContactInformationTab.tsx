import React, { useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  CircularProgress,
  Divider,
  Typography,
  MenuItem,
  Autocomplete,
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { UserProfile } from '@/types/profile';
import { getAllCountryNames } from '@/utils/countryMappings';

interface ContactInformationTabProps {
  profile: UserProfile;
  isEditing: boolean;
  loading: boolean;
  fieldErrors?: Record<string, string>;
  onInputChange: (field: keyof UserProfile, value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  onEditToggle: () => void;
}

const ContactInformationTab: React.FC<ContactInformationTabProps> = ({
  profile,
  isEditing,
  loading,
  fieldErrors = {},
  onInputChange,
  onSave,
  onCancel,
  onEditToggle,
}) => {
  // Get countries list from i18n-iso-countries (excludes Israel)
  const countries = useMemo(() => getAllCountryNames(), []);

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

  return (
    <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)', mb: 3 }}>
      <CardContent sx={{ p: 4 }}>
        {loading && !profile.username ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
            <CircularProgress sx={{ color: '#8310FF' }} />
          </Box>
        ) : (
          <>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827' }}>
                  Contact Information
                </Typography>

                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={onEditToggle}
                  sx={{
                    borderColor: '#8310FF',
                    color: '#8310FF',
                    textTransform: 'none',
                    '&:hover': {
                      borderColor: '#6a0dd4',
                      backgroundColor: 'rgba(131, 16, 255, 0.04)',
                    },
                  }}
                >
                  {isEditing ? 'Cancel' : 'Edit'}
                </Button>
              </Box>
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                {profile.profileType === 'Company'
                  ? 'Manage your company contact details and professional presence'
                  : 'Manage your contact details and social profiles'
                }
              </Typography>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Contact Information Fields - Different for Candidate vs Company */}
            {profile.profileType === 'Candidate' ? (
              // Candidate Contact Fields
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
                <TextField
                  label="Email"
                  value={profile.email}
                  disabled
                  fullWidth
                  type="email"
                  helperText="Email cannot be changed"
                  sx={{
                    gridColumn: { xs: '1 / -1', sm: 'span 2' },
                    ...fieldSx,
                  }}
                />

                <TextField
                  label="Phone Number"
                  value={profile.phone}
                  onChange={(e) => onInputChange('phone', e.target.value)}
                  disabled={!isEditing}
                  fullWidth
                  type="tel"
                  placeholder="+33612345678"
                  error={!!fieldErrors.phone}
                  helperText={fieldErrors.phone || ''}
                  sx={fieldSx}
                />

                <TextField
                  label="Location"
                  value={profile.location}
                  onChange={(e) => onInputChange('location', e.target.value)}
                  disabled={!isEditing}
                  fullWidth
                  placeholder="Paris, France"
                  sx={fieldSx}
                />

                <TextField
                  label="Address"
                  value={profile.address}
                  onChange={(e) => onInputChange('address', e.target.value)}
                  disabled={!isEditing}
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="123 Rue de Paris"
                  sx={{
                    gridColumn: { xs: '1 / -1', sm: 'span 2' },
                    ...fieldSx,
                  }}
                />

                <TextField
                  label="LinkedIn URL"
                  value={profile.linkedinUrl}
                  onChange={(e) => onInputChange('linkedinUrl', e.target.value)}
                  disabled={!isEditing}
                  fullWidth
                  type="url"
                  placeholder="https://linkedin.com/in/yourprofile"
                  error={!!fieldErrors.linkedinUrl}
                  helperText={fieldErrors.linkedinUrl || ''}
                  sx={{
                    gridColumn: { xs: '1 / -1', sm: 'span 2' },
                    ...fieldSx,
                  }}
                />

                <TextField
                  label="GitHub URL"
                  value={profile.githubUrl}
                  onChange={(e) => onInputChange('githubUrl', e.target.value)}
                  disabled={!isEditing}
                  fullWidth
                  type="url"
                  placeholder="https://github.com/yourprofile"
                  error={!!fieldErrors.githubUrl}
                  helperText={fieldErrors.githubUrl || ''}
                  sx={{
                    gridColumn: { xs: '1 / -1', sm: 'span 2' },
                    ...fieldSx,
                  }}
                />

                <TextField
                  label="Personal Website"
                  value={profile.personalWebsite}
                  onChange={(e) => onInputChange('personalWebsite', e.target.value)}
                  disabled={!isEditing}
                  fullWidth
                  type="url"
                  placeholder="https://yourwebsite.com"
                  error={!!fieldErrors.personalWebsite}
                  helperText={fieldErrors.personalWebsite || ''}
                  sx={{
                    gridColumn: { xs: '1 / -1', sm: 'span 2' },
                    ...fieldSx,
                  }}
                />
              </Box>
            ) : (
              // Company Contact Fields
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
                <TextField
                  label="Company Email"
                  value={profile.email}
                  disabled
                  fullWidth
                  type="email"
                  helperText="Email cannot be changed"
                  sx={{
                    gridColumn: { xs: '1 / -1', sm: 'span 2' },
                    ...fieldSx,
                  }}
                />
                <Autocomplete
                  options={countries}
                  value={profile.location || null}
                  onChange={(_, value) => onInputChange('location', value || '')}
                  disabled={!isEditing}
                  fullWidth
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Location"
                      placeholder="Select country"
                      sx={fieldSx}
                    />
                  )}
                  sx={{
                    '& .MuiAutocomplete-popupIndicator': {
                      color: '#6b7280',
                    },
                  }}
                />
                <TextField
                  select
                  label="Employment Type"
                  value={profile.employmentType}
                  onChange={(e) => onInputChange('employmentType', e.target.value)}
                  disabled={!isEditing}
                  fullWidth
                  sx={fieldSx}
                >
                  <MenuItem value="Remote">Remote</MenuItem>
                  <MenuItem value="On-site">On-site</MenuItem>
                  <MenuItem value="Hybrid">Hybrid</MenuItem>
                </TextField>
                <TextField
                  label="Industry"
                  value={profile.industry}
                  onChange={(e) => onInputChange('industry', e.target.value)}
                  disabled={!isEditing}
                  fullWidth
                  error={!!fieldErrors.industry}
                  helperText={fieldErrors.industry || ''}
                  placeholder="Finance, Technology, Healthcare..."
                  sx={fieldSx}
                />
                <TextField
                  select
                  label="Company Size"
                  value={profile.size}
                  onChange={(e) => onInputChange('size', e.target.value)}
                  disabled={!isEditing}
                  fullWidth
                  error={!!fieldErrors.size}
                  helperText={fieldErrors.size || ''}
                  sx={fieldSx}
                >
                  <MenuItem value="1-10">1–10</MenuItem>
                  <MenuItem value="11-50">11–50</MenuItem>
                  <MenuItem value="51-200">51–200</MenuItem>
                  <MenuItem value="201-500">201–500</MenuItem>
                  <MenuItem value="500+">500+</MenuItem>
                </TextField>

                <TextField
                  value={profile.linkedin}
                  onChange={(e) => onInputChange('linkedin', e.target.value)}
                  disabled={!isEditing}
                  fullWidth
                  type="url"
                  placeholder="https://linkedin.com/company/yourcompany"

                  error={!!fieldErrors.linkedin}
                  helperText={fieldErrors.linkedin || ''}
                  sx={{
                    gridColumn: { xs: '1 / -1', sm: 'span 2' },
                    ...fieldSx,
                  }}
                />

                <TextField
                  value={profile.website}
                  onChange={(e) => onInputChange('website', e.target.value)}
                  disabled={!isEditing}
                  fullWidth
                  type="url"
                  placeholder="https://yourcompany.com"
                  error={!!fieldErrors.website}
                  helperText={fieldErrors.website || ''}
                  sx={{
                    gridColumn: { xs: '1 / -1', sm: 'span 2' },
                    ...fieldSx,
                  }}
                />
              </Box>
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
      </CardContent>
    </Card>
  );
};

export default React.memo(ContactInformationTab);
