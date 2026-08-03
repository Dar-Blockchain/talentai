import { useQuery } from "@tanstack/react-query";
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
