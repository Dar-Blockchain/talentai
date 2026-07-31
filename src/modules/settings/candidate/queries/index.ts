import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/store/store';
import { setConnectedUser } from '@/store/slices/userSlice';
import { profileKeys } from '@/modules/settings/shared';
import type { ProfileApiResponse } from '@/modules/settings/shared/types';
import { candidateApi } from '../api';

export const useCandidateProfile = () =>
  useQuery({
    queryKey: profileKeys.me,
    queryFn:  () => candidateApi.fetchProfile(),
    staleTime: 5 * 60 * 1000,
  });

export const useUpdateCandidateProfile = () => {
  const queryClient = useQueryClient();
  const dispatch    = useDispatch<AppDispatch>();
  return useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: Record<string, unknown> }) =>
      candidateApi.updateProfile(userId, payload),
    onSuccess: (data) => {
      if (!data?.profile) return;
      dispatch(setConnectedUser({ profile: data.profile }));
      queryClient.setQueryData(profileKeys.me, (old: ProfileApiResponse | undefined) =>
        old ? { ...old, profile: data.profile } : old
      );
    },
  });
};

export const useUploadCandidateAvatar = () => {
  const queryClient = useQueryClient();
  const dispatch    = useDispatch<AppDispatch>();
  return useMutation({
    mutationFn: ({ userId, file }: { userId: string; file: File }) =>
      candidateApi.uploadAvatar(userId, file),
    onSuccess: (data) => {
      if (!data?.profile) return;
      dispatch(setConnectedUser({ profile: data.profile }));
      queryClient.setQueryData(profileKeys.me, (old: ProfileApiResponse | undefined) =>
        old ? { ...old, profile: data.profile } : old
      );
    },
  });
};

export const useUpdateCandidateVisibility = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, isPublicProfile }: { userId: string; isPublicProfile: boolean }) =>
      candidateApi.updateVisibility(userId, isPublicProfile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.me });
    },
  });
};
