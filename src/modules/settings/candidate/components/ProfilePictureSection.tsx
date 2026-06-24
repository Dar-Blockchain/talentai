import React from 'react';
import { Box, Avatar, IconButton, Typography, CircularProgress } from '@mui/material';
import { PhotoCamera as PhotoCameraIcon } from '@mui/icons-material';
import { UserProfile } from '@/types/profile';

const T    = "#0D9488";
const NAVY = "#0D1B2A";

interface ProfilePictureSectionProps {
  profile: UserProfile;
  uploadingImage: boolean;
  isEditing: boolean;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onEditClick: () => void;
}

const ProfilePictureSection: React.FC<ProfilePictureSectionProps> = ({
  profile, uploadingImage, isEditing, onImageUpload,
}) => {
  const displayName = profile.profileType === 'Company'
    ? (profile.name || profile.companyName || 'Company')
    : `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || profile.username || '';

  const initials = profile.profileType === 'Company'
    ? (profile.name || profile.companyName)?.charAt(0)?.toUpperCase() || 'C'
    : `${profile.firstName?.charAt(0) || ''}${profile.lastName?.charAt(0) || ''}`.toUpperCase();

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Box sx={{ position: 'relative', flexShrink: 0 }}>
        <Avatar
          src={profile.avatar}
          alt={displayName}
          sx={{ width: 72, height: 72, bgcolor: T, fontSize: "1.4rem", fontWeight: 700, border: "2.5px solid #fff", boxShadow: "0 2px 8px rgba(13,148,136,0.18)" }}
        >
          {initials}
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
              position: 'absolute', bottom: -4, right: -4,
              bgcolor: T, color: '#fff', width: 26, height: 26,
              '&:hover': { bgcolor: '#0F766E' },
              '&.Mui-disabled': { bgcolor: '#9CA3AF' },
            }}
          >
            {uploadingImage
              ? <CircularProgress size={13} sx={{ color: '#fff' }} />
              : <PhotoCameraIcon sx={{ fontSize: 13 }} />
            }
          </IconButton>
        </label>
      </Box>

      <Box>
        <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: NAVY }}>{displayName}</Typography>
        {profile.email && (
          <Typography sx={{ fontSize: "0.75rem", color: "#94A3B8", mt: 0.25 }}>{profile.email}</Typography>
        )}
        <Typography sx={{ fontSize: "0.72rem", color: "#CBD5E1", mt: 0.5 }}>
          {isEditing ? "Click the camera icon to change your photo" : "Click Edit to update your photo"}
        </Typography>
      </Box>
    </Box>
  );
};

export default React.memo(ProfilePictureSection);
