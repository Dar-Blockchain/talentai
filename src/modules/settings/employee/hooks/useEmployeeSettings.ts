import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/useToast';
import { useEmployeeProfile, useUpdateEmployeeUsername, useUploadEmployeeAvatar } from '../queries';

export const useEmployeeSettings = () => {
  const { showToast } = useToast();

  const { data: settingsData, isLoading } = useEmployeeProfile();
  const updateUsernameMutation = useUpdateEmployeeUsername();
  const uploadAvatarMutation   = useUploadEmployeeAvatar();

  const user              = settingsData?.user;
  const profile           = settingsData?.profile;
  const companyMembership = settingsData?.companyMembership;
  const userId            = user?._id || user?.id;

  const fileRef = useRef<HTMLInputElement>(null);

  const [username,     setUsername]     = useState('');
  const [nameSaved,    setNameSaved]    = useState(false);
  const [nameError,    setNameError]    = useState('');
  const [uploadingImg, setUploadingImg] = useState(false);

  // sync username from fetched data
  useEffect(() => {
    if (user?.username) setUsername(user.username);
  }, [user?.username]);

  const displayName = profile
    ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || user?.username || ''
    : user?.username || '';

  const avatarUrl = (profile?.user_image || user?.user_image)
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}uploads/images/${profile?.user_image || user?.user_image}`
    : null;

  const initials = displayName
    ? displayName.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
    : (user?.email?.[0] || 'E').toUpperCase();

  const savingName = updateUsernameMutation.isPending;

  const handleSaveName = useCallback(async () => {
    if (!username.trim()) { setNameError('Name cannot be empty'); return; }
    if (!userId)          { setNameError('User not found'); return; }
    setNameError('');
    try {
      await updateUsernameMutation.mutateAsync({ userId, username: username.trim() });
      setNameSaved(true);
      setTimeout(() => setNameSaved(false), 2500);
    } catch {
      setNameError('Failed to save. Please try again.');
    }
  }, [username, userId, updateUsernameMutation]);

  const handleAvatarChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    setUploadingImg(true);
    try {
      await uploadAvatarMutation.mutateAsync({ userId, file });
    } catch {
      showToast({ message: 'Failed to upload image', severity: 'error' });
    } finally {
      setUploadingImg(false);
    }
  }, [userId, uploadAvatarMutation, showToast]);

  return {
    user,
    profile,
    companyMembership,
    isInitialLoading: isLoading,
    fileRef,
    displayName,
    avatarUrl,
    initials,
    username,
    savingName,
    nameSaved,
    nameError,
    uploadingImg,
    setUsername,
    setNameError,
    handleSaveName,
    handleAvatarChange,
  };
};
