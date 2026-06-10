import axiosInstance from "@/utils/axiosInstance";
import { apiCall } from "@/utils/apiCall";
import type { EmployeePermission } from "@/types/employeePermissions";
import type { FetchMembersFilters, AddMemberPayload, UpdateRolePayload } from "@/store/slices/memberSlice";

export const employeesApi = {
  fetchMembers: (filters: FetchMembersFilters) =>
    apiCall(() => axiosInstance.get("members", { params: filters }), "Failed to fetch members"),

  fetchMemberById: (userId: string) =>
    apiCall(() => axiosInstance.get(`members/${userId}`), "Failed to fetch member"),

  fetchStats: () =>
    apiCall(() => axiosInstance.get("members/stats"), "Failed to fetch member stats"),

  fetchDepartments: () =>
    apiCall(() => axiosInstance.get("departments"), "Failed to fetch departments"),

  fetchInvitations: () =>
    apiCall(() => axiosInstance.get("members/invitations"), "Failed to fetch invitations"),

  inviteEmployee: (payload: AddMemberPayload) =>
    apiCall(() => axiosInstance.post("members/invite", payload), "Failed to invite employee"),

  updateRole: (payload: UpdateRolePayload) =>
    apiCall(
      () => axiosInstance.patch(`members/${payload.membershipId}/role`, { role: payload.role, departmentId: payload.departmentId }),
      "Failed to update member role"
    ),

  removeMember: (membershipId: string) =>
    apiCall(() => axiosInstance.delete(`members/${membershipId}`), "Failed to remove member"),

  resendInvitation: (invitationId: string) =>
    apiCall(() => axiosInstance.post(`members/invitations/${invitationId}/resend`), "Failed to resend invitation"),

  cancelInvitation: (invitationId: string) =>
    apiCall(() => axiosInstance.delete(`members/invitations/${invitationId}`), "Failed to cancel invitation"),

  /** Direct call (no apiCall wrapper) — returns the permissions object, not the full axios response. */
  fetchPermissions: (userId: string): Promise<Partial<EmployeePermission>> =>
    axiosInstance
      .get(`employee-permissions/${userId}`)
      .then((res) => res.data?.data ?? res.data),

  updatePermissions: (memberId: string, permissions: Partial<EmployeePermission>) =>
    apiCall(() => axiosInstance.patch(`employee-permissions/${memberId}`, permissions), "Failed to update permissions"),
};
