import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/store/store';
import { setConnectedUser } from '@/store/slices/userSlice';
import { profileKeys } from '@/modules/settings/shared';
import { employeeApi } from '../api';

export const useEmployeeProfile = () =>
  useQuery({
    queryKey: profileKeys.me,
    queryFn:  () => employeeApi.fetchProfile(),
    staleTime: 5 * 60 * 1000,
  });

export const useUpdateEmployeeUsername = () => {
  const queryClient = useQueryClient();
  const dispatch    = useDispatch<AppDispatch>();
  return useMutation({
    mutationFn: ({ userId, username }: { userId: string; username: string }) =>
      employeeApi.updateUsername(userId, username),
    onSuccess: (data) => {
      if (data?.user) {
        dispatch(setConnectedUser({
          user:              data.user,
          profile:           data?.profile           ?? null,
          planLimits:        data?.planLimits         ?? null,
          companyMembership: data?.companyMembership  ?? null,
        }));
      }
      queryClient.invalidateQueries({ queryKey: profileKeys.me });
    },
  });
};

export const useUploadEmployeeAvatar = () => {
  const queryClient = useQueryClient();
  const dispatch    = useDispatch<AppDispatch>();
  return useMutation({
    mutationFn: ({ userId, file }: { userId: string; file: File }) =>
      employeeApi.uploadAvatar(userId, file),
    onSuccess: (data) => {
      if (data?.user) {
        dispatch(setConnectedUser({
          user:              data.user,
          profile:           data?.profile           ?? null,
          planLimits:        data?.planLimits         ?? null,
          companyMembership: data?.companyMembership  ?? null,
        }));
      }
      queryClient.invalidateQueries({ queryKey: profileKeys.me });
    },
  });
};
