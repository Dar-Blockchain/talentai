import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminWebinarApi } from "../api";

const KEY = ["admin", "webinars"] as const;

export const useAdminWebinarsQuery = (params: { page?: number; limit?: number; status?: string } = {}) =>
  useQuery({
    queryKey: [...KEY, params],
    queryFn:  () => adminWebinarApi.list(params),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });

export const useAdminWebinarQuery = (id: string) =>
  useQuery({
    queryKey: [...KEY, id],
    queryFn:  () => adminWebinarApi.get(id),
    enabled:  !!id,
    staleTime: 30_000,
  });

const invalidate = (qc: ReturnType<typeof useQueryClient>) =>
  qc.invalidateQueries({ queryKey: KEY });

export const useCreateWebinarMutation = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: adminWebinarApi.create, onSuccess: () => invalidate(qc) });
};

export const useUpdateWebinarMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: Parameters<typeof adminWebinarApi.update>[1] }) =>
      adminWebinarApi.update(id, values),
    onSuccess: () => invalidate(qc),
  });
};

export const useDeleteWebinarMutation = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: adminWebinarApi.remove, onSuccess: () => invalidate(qc) });
};

export const useVerifyWebinarMutation = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: adminWebinarApi.verify, onSuccess: () => invalidate(qc) });
};

export const useRefreshStatsMutation = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: adminWebinarApi.refreshStats, onSuccess: () => invalidate(qc) });
};

export const useWebinarSubmissionsQuery = (id: string, params?: { page?: number; limit?: number; completed?: boolean }) =>
  useQuery({
    queryKey: [...KEY, id, "submissions", params],
    queryFn:  () => adminWebinarApi.listSubmissions(id, params),
    enabled:  !!id,
    staleTime: 20_000,
    placeholderData: (prev) => prev,
  });
