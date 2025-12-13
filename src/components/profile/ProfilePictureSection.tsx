import React from 'react';
import { Box, Avatar, IconButton, Typography, Button, CircularProgress } from '@mui/material';
import { PhotoCamera as PhotoCameraIcon, Edit as EditIcon } from '@mui/icons-material';
import { UserProfile } from '@/types/profile';

interface ProfilePictureSectionProps {
  profile: UserProfile;
  uploadingImage: boolean;
  isEditing: boolean;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onEditClick: () => void;
}

const ProfilePictureSection: React.FC<ProfilePictureSectionProps> = ({
  profile,
  uploadingImage,
  isEditing,
  onImageUpload,
  onEditClick,
}) => {
  const getDisplayName = () => {
    if (profile.profileType === 'Company') {
      return profile.name || profile.companyName || 'Company Name';
    }
    return `${profile.firstName} ${profile.lastName}`;
  };

  const getAvatarInitials = () => {
    if (profile.profileType === 'Company') {
      return (profile.name || profile.companyName)?.charAt(0)?.toUpperCase() || 'C';
    }
    return `${profile.firstName?.charAt(0)}${profile.lastName?.charAt(0)}`;
  };

  const getCompanyDetails = () => {
    if (profile.profileType !== 'Company') return null;

    const details = [];
    if (profile.industry) details.push({ label: 'Industry', value: profile.industry });
    if (profile.size || profile.companySize) details.push({ label: 'Size', value: profile.size || profile.companySize });
    if (profile.location) details.push({ label: 'Location', value: profile.location });
    if (profile.employmentType) details.push({ label: 'Type', value: profile.employmentType });
    if (profile.requiredExperienceLevel) details.push({ label: 'Experience', value: profile.requiredExperienceLevel });

    return details;
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
      <Box sx={{ position: 'relative' }}>
        <Avatar
          src={profile.avatar}
          alt={getDisplayName()}
          sx={{
            width: 100,
            height: 100,
            border: '4px solid #8310FF',
            boxShadow: '0 4px 12px rgba(131, 16, 255, 0.2)',
          }}
        >
          {getAvatarInitials()}
        </Avatar>
        <input
          accept="image/*"
          style={{ display: 'none' }}
          id="profile-picture-upload"
          type="file"
          onChange={onImageUpload}
          disabled={uploadingImage}
        />
        <label htmlFor="profile-picture-upload">
          <IconButton
            component="span"
            disabled={uploadingImage}
            sx={{
              position: 'absolute',
              bottom: -5,
              right: -5,
              backgroundColor: '#8310FF',
              color: 'white',
              width: 36,
              height: 36,
              '&:hover': {
                backgroundColor: '#6a0dd4',
              },
              '&.Mui-disabled': {
                backgroundColor: '#9ca3af',
              },
            }}
          >
            {uploadingImage ? (
              <CircularProgress size={18} sx={{ color: 'white' }} />
            ) : (
              <PhotoCameraIcon sx={{ fontSize: 18 }} />
            )}
          </IconButton>
        </label>
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
          {getDisplayName()}
        </Typography>
        <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
          {profile.email}
        </Typography>

        {/* Company-specific details */}
        {profile.profileType === 'Company' && getCompanyDetails() && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 1 }}>
            {getCompanyDetails()?.map((detail, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="caption" sx={{ color: '#9ca3af', fontWeight: 500 }}>
                  {detail.label}:
                </Typography>
                <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600 }}>
                  {detail.value}
                </Typography>
              </Box>
            ))}
          </Box>
        )}

        <Button
          variant="outlined"
          size="small"
          startIcon={<EditIcon />}
          onClick={onEditClick}
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
    </Box>
  );
};

export default React.memo(ProfilePictureSection);
