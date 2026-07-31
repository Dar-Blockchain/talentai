import axiosInstance from "@/utils/axiosInstance";
import type { EmployeePermission } from "@/modules/company/employees/types/permissions";
import type {
  FetchMembersFilters,
  AddMemberPayload,
  UpdateRolePayload,
  Invitation,
} from "@/modules/company/members/types";

export const employeesApi = {
  fetchMembers: async (filters: FetchMembersFilters) => {
    const query = new URLSearchParams();
    if (filters?.search) query.set("search", filters.search);
    if (filters?.departmentId) query.set("departmentId", filters.departmentId);
    if (filters?.role) query.set("role", filters.role);
    if (filters?.sortBy) query.set("sortBy", filters.sortBy as string);
    if (filters?.order) query.set("order", filters.order as string);
    if (filters?.page) query.set("page", String(filters.page));
    if (filters?.limit) query.set("limit", String(filters.limit));
    const qs = query.toString();
    const res = await axiosInstance.get(
      `company-memberships/memberships${qs ? `?${qs}` : ""}`,
    );
    return {
      members: res.data.memberships || res.data.members || [],
      total: res.data.total ?? res.data.pagination?.total ?? 0,
    };
  },

  fetchMemberById: async (userId: string) => {
    const res = await axiosInstance.get(`company-memberships/user/${userId}`);
    return res.data.membership || res.data;
  },

  fetchStats: async () => {
    const res = await axiosInstance.get(
      "company-memberships/memberships/stats",
    );
    return res.data.stats ?? res.data;
  },

  fetchDepartments: async () => {
    const res = await axiosInstance.get("departments");
    return res.data;
  },

  fetchInvitations: async () => {
    const res = await axiosInstance.get("company-invitations/myInvitations");
    return res.data.invitations || [];
  },

  inviteEmployee: async (payload: AddMemberPayload) => {
    const res = await axiosInstance.post("company-invitations/sentInvitation", {
      email: payload.email,
      role: payload.role,
      ...(payload.departmentId && { departmentId: payload.departmentId }),
    });
    return res.data;
  },

  updateRole: async (payload: UpdateRolePayload) => {
    const apiPayload: { role: string; departmentId?: string } = {
      role: payload.role,
    };
    if (payload.departmentId !== undefined)
      apiPayload.departmentId = payload.departmentId || undefined;
    const res = await axiosInstance.patch(
      `company-memberships/${payload.membershipId}`,
      apiPayload,
    );
    return res.data.updated || res.data;
  },

  removeMember: async (membershipId: string) => {
    await axiosInstance.delete(`company-memberships/${membershipId}`);
    return membershipId;
  },

  resendInvitation: async (invitationId: string) => {
    const res = await axiosInstance.post(
      `company-invitations/resendInvitation/${invitationId}`,
    );
    return res.data.updated;
  },

  cancelInvitation: async (invitationId: string) => {
    await axiosInstance.delete(
      `company-invitations/deleteInvitation/${invitationId}`,
    );
    return invitationId;
  },

  fetchPermissions: async (
    userId: string,
  ): Promise<Partial<EmployeePermission>> => {
    const res = await axiosInstance.get(`employee-permissions/${userId}`);
    return res.data?.data ?? res.data;
  },

  updatePermissions: async (
    memberId: string,
    permissions: Partial<EmployeePermission>,
  ) => {
    const res = await axiosInstance.put(
      `employee-permissions/${memberId}`,
      permissions,
    );
    return res.data?.data ?? res.data;
  },

  fetchInvitationDetails: async (invitationId: string) => {
    const res = await axiosInstance.get(
      `company-invitations/details/${invitationId}`,
    );
    return res.data.invitation ?? res.data.data ?? res.data;
  },

  respondToInvitation: async (params: {
    invitationId: string;
    action: "accept" | "reject";
    token?: string;
    firstName?: string;
    lastName?: string;
  }) => {
    const { invitationId, ...body } = params;
    const res = await axiosInstance.post(
      `company-invitations/respondInvitation/${invitationId}`,
      body,
    );
    return res.data;
  },

  fetchInvitationsByDepartment: async (departmentId: string) => {
    const res = await axiosInstance.get(
      `company-invitations/byDepartment/${departmentId}`,
    );
    return (res.data.invitations || res.data) as Invitation[];
  },
};
