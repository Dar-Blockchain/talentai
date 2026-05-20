import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/store/store';
import { setConnectedUser } from '@/store/slices/userSlice';
import { candidateApi } from '../api';
import { candidateSettingsKeys } from './keys';

export const useCandidateProfile = () => {
  const dispatch = useDispatch<AppDispatch>();
  return useQuery({
    queryKey: candidateSettingsKeys.profile,
    queryFn: async () => {
      const data = await candidateApi.fetchProfile();
      if (data) dispatch(setConnectedUser(data));
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useUpdateCandidateProfile = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch<AppDispatch>();
  return useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: Record<string, unknown> }) =>
      candidateApi.updateProfile(userId, payload),
    onSuccess: (data) => {
      if (data) dispatch(setConnectedUser(data));
      queryClient.invalidateQueries({ queryKey: candidateSettingsKeys.profile });
    },
  });
};

export const useUploadCandidateAvatar = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch<AppDispatch>();
  return useMutation({
    mutationFn: ({ userId, file }: { userId: string; file: File }) =>
      candidateApi.uploadAvatar(userId, file),
    onSuccess: (data) => {
      if (data) dispatch(setConnectedUser(data));
      queryClient.invalidateQueries({ queryKey: candidateSettingsKeys.profile });
    },
  });
};

export const useUpdateCandidateVisibility = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (isPublicProfile: boolean) => candidateApi.updateVisibility(isPublicProfile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: candidateSettingsKeys.profile });
    },
  });
};
