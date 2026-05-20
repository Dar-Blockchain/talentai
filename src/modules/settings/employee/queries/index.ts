import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/store/store';
import { setConnectedUser } from '@/store/slices/userSlice';
import { employeeApi } from '../api';
import { employeeSettingsKeys } from './keys';

export const useEmployeeProfile = () => {
  const dispatch = useDispatch<AppDispatch>();
  return useQuery({
    queryKey: employeeSettingsKeys.profile,
    queryFn: async () => {
      const data = await employeeApi.fetchProfile();
      if (data) dispatch(setConnectedUser(data));
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useUpdateEmployeeUsername = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch<AppDispatch>();
  return useMutation({
    mutationFn: ({ userId, username }: { userId: string; username: string }) =>
      employeeApi.updateUsername(userId, username),
    onSuccess: (data) => {
      if (data) dispatch(setConnectedUser(data));
      queryClient.invalidateQueries({ queryKey: employeeSettingsKeys.profile });
    },
  });
};

export const useUploadEmployeeAvatar = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch<AppDispatch>();
  return useMutation({
    mutationFn: ({ userId, file }: { userId: string; file: File }) =>
      employeeApi.uploadAvatar(userId, file),
    onSuccess: (data) => {
      if (data) dispatch(setConnectedUser(data));
      queryClient.invalidateQueries({ queryKey: employeeSettingsKeys.profile });
    },
  });
};
