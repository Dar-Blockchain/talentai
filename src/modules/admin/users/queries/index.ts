import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminUsersApi } from "../api";
import { FetchUsersParams } from "../types";

export const ADMIN_USERS_QUERY_KEY = ["admin", "users"] as const;

export const useAdminUsersQuery = (params: FetchUsersParams) =>
  useQuery({
    queryKey: [...ADMIN_USERS_QUERY_KEY, params],
    queryFn:  () => adminUsersApi.fetchUsers(params),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });

export const useSaveCompanyPermissionsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ companyId, permissions }: { companyId: string; permissions: any }) =>
      adminUsersApi.saveCompanyPermissions(companyId, permissions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY });
    },
  });
};
