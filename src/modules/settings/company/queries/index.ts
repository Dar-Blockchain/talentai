import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { settingsApi, apiKeysApi } from '../api';
import { apiKeysKeys } from './keys';
import { profileKeys } from '@/modules/settings/shared';
import { setConnectedUser } from '@/store/slices/userSlice';
import type { AppDispatch } from '@/store/store';
import type { UpdateProfilePayload, CreateApiKeyPayload, UpdateApiKeyPayload } from '../types';

// ─── Fetch profile ────────────────────────────────────────────────────────────

export const useSettingsProfile = () =>
  useQuery({
    queryKey: profileKeys.me,
    queryFn:  () => settingsApi.fetchProfile(),
    staleTime: 5 * 60 * 1000,
  });

// ─── Update profile ───────────────────────────────────────────────────────────

export const useUpdateSettingsProfile = () => {
  const queryClient = useQueryClient();
  const dispatch    = useDispatch<AppDispatch>();

  return useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: UpdateProfilePayload }) =>
      settingsApi.updateProfile(userId, payload),
    onSuccess: (data) => {
      if (!data?.profile) return;
      dispatch(setConnectedUser({ profile: data.profile }));
      queryClient.setQueryData(profileKeys.me, (old: any) =>
        old ? { ...old, profile: data.profile } : old
      );
    },
  });
};

// ─── Upload avatar ────────────────────────────────────────────────────────────

export const useUploadSettingsAvatar = () => {
  const queryClient = useQueryClient();
  const dispatch    = useDispatch<AppDispatch>();

  return useMutation({
    mutationFn: ({ userId, file }: { userId: string; file: File }) =>
      settingsApi.uploadAvatar(userId, file),
    onSuccess: (data) => {
      if (!data?.profile) return;
      dispatch(setConnectedUser({ profile: data.profile }));
      queryClient.setQueryData(profileKeys.me, (old: any) =>
        old ? { ...old, profile: data.profile } : old
      );
    },
  });
};

// ─── API Keys ─────────────────────────────────────────────────────────────────

export const useApiKeys = () =>
  useQuery({
    queryKey: apiKeysKeys.list,
    queryFn:  apiKeysApi.fetchAll,
    staleTime: 60 * 1000,
  });

export const useCreateApiKey = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateApiKeyPayload) => apiKeysApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: apiKeysKeys.list }),
  });
};

export const useDeleteApiKey = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiKeysApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: apiKeysKeys.list }),
  });
};

export const useToggleApiKey = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiKeysApi.toggle(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: apiKeysKeys.list }),
  });
};

export const useUpdateApiKey = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateApiKeyPayload }) => apiKeysApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: apiKeysKeys.list }),
  });
};

export const useRegenerateApiKey = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiKeysApi.regenerate(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: apiKeysKeys.list }),
  });
};
