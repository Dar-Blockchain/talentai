import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { departmentsApi } from "../api";
import { departmentKeys } from "./keys";
import type {
  CreateDepartmentPayload,
  DepartmentsQueryParams,
  UpdateDepartmentPayload,
} from "../types";

// ── List ──────────────────────────────────────────────────────────────────────

export const useDepartmentsQuery = (params?: DepartmentsQueryParams) =>
  useQuery({
    queryKey: departmentKeys.list(params),
    queryFn:  () => departmentsApi.list(params),
    staleTime: 30_000,
  });

// ── Single ────────────────────────────────────────────────────────────────────

export const useDepartmentQuery = (id: string | null) =>
  useQuery({
    queryKey: departmentKeys.detail(id ?? ""),
    queryFn:  () => departmentsApi.getById(id!),
    enabled:  !!id,
    staleTime: 30_000,
  });

// ── Stats ─────────────────────────────────────────────────────────────────────

export const useDepartmentStatsQuery = () =>
  useQuery({
    queryKey: departmentKeys.stats(),
    queryFn:  () => departmentsApi.stats(),
    staleTime: 60_000,
  });

// ── Create ────────────────────────────────────────────────────────────────────

export const useCreateDepartmentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateDepartmentPayload) => departmentsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.lists() });
    },
  });
};

// ── Update ────────────────────────────────────────────────────────────────────

export const useUpdateDepartmentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ departmentId, ...body }: UpdateDepartmentPayload) =>
      departmentsApi.update(departmentId, body),
    onSuccess: (dept) => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.lists() });
      queryClient.setQueryData(departmentKeys.detail(dept._id), dept);
    },
  });
};

// ── Delete ────────────────────────────────────────────────────────────────────

export const useDeleteDepartmentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => departmentsApi.delete(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.lists() });
      queryClient.removeQueries({ queryKey: departmentKeys.detail(id) });
    },
  });
};
