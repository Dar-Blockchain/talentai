import axiosInstance from "@/utils/axiosInstance";
import { apiCall } from "@/utils/apiCall";
import { FetchUsersParams, User } from "../types";

export const adminUsersApi = {
  fetchUsers: (params: FetchUsersParams) =>
    apiCall(
      async () => {
        const { data } = await axiosInstance.get("dashboard/getAllUsers", {
          params: {
            page: params.page ?? 1,
            limit: params.limit ?? 10,
            ...(params.username ? { username: params.username } : {}),
            ...(params.email ? { email: params.email } : {}),
            ...(params.role ? { role: params.role } : {}),
            ...(params.status ? { status: params.status } : {}),
          },
        });
        return {
          users: (data.users || []) as User[],
          total: data.pagination?.totalUsers ?? data.total ?? 0,
        };
      },
      "Failed to load users.",
    ),

  saveCompanyPermissions: (companyId: string, permissions: any) =>
    apiCall(
      async () => {
        const { data } = await axiosInstance.post(`admin/companies/${companyId}/permissions`, permissions);
        return data;
      },
      "Failed to save permissions.",
    ),
};
