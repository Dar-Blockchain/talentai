import React from 'react';
import { Camera } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/modules/shared/ui/shadcn/avatar';
import { Spinner } from '@/modules/settings/shared/components';
import { UserProfile } from '../../shared';

interface ProfilePictureSectionProps {
  profile:        UserProfile;
  uploadingImage: boolean;
  isEditing:      boolean;
  onImageUpload:  (event: React.ChangeEvent<HTMLInputElement>) => void;
  onEditClick:    () => void;
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
    <div className="flex items-center gap-3.5">
      <div className="relative shrink-0 group">
        <Avatar className="size-[72px] border-2 border-card shadow-md">
          <AvatarImage src={profile.avatar} alt={displayName} className="object-cover" />
          <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>

        <input
          accept="image/*"
          className="hidden"
          id="profile-picture-upload"
          type="file"
          onChange={onImageUpload}
          disabled={uploadingImage}
        />
        <label
          htmlFor="profile-picture-upload"
          className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-primary-dark/0 group-hover:bg-primary-dark/50 transition-all duration-200"
        >
          <span className="flex size-8 items-center justify-center rounded-full bg-primary-dark/80 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md">
            {uploadingImage
              ? <Spinner size={13} className="border-white/40 border-t-white" />
              : <Camera className="size-3.5" />
            }
          </span>
        </label>
      </div>

      <div className="flex flex-col">
        <p className="text-sm font-bold text-foreground leading-tight">{displayName}</p>
        {profile.email && (
          <p className="text-xs text-muted-foreground mt-0.5">{profile.email}</p>
        )}
        <p className="text-xs text-muted-foreground/60 mt-1">
          {isEditing ? "Click the camera to change your photo" : "Click Edit to update your photo"}
        </p>
      </div>
    </div>
  );
};

export default React.memo(ProfilePictureSection);
