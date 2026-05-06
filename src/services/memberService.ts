import axiosInstance from '@/utils/axiosInstance';

export const memberService = {
  addEmployee: async (payload: { email: string; role: string; departmentId?: string }) => {
    const apiPayload: { email: string; role: string; departmentId?: string } = {
      email: payload.email,
      role: payload.role,
      ...(payload.departmentId && { departmentId: payload.departmentId }),
    };
    const res = await axiosInstance.post('company-invitations/sentInvitation', apiPayload);
    return res.data;
  },

  updateMemberRole: async (payload: { membershipId: string; role: string; departmentId?: string }) => {
    const apiPayload: { role: string; departmentId?: string } = { role: payload.role };
    if (payload.departmentId !== undefined) apiPayload.departmentId = payload.departmentId || undefined;
    const res = await axiosInstance.patch(`company-memberships/${payload.membershipId}`, apiPayload);
    return res.data.updated || res.data;
  },

  deleteMember: async (membershipId: string) => {
    await axiosInstance.delete(`company-memberships/${membershipId}`);
    return { membershipId };
  },

  fetchMemberById: async (userId: string) => {
    const res = await axiosInstance.get(`company-memberships/user/${userId}`);
    return res.data.membership || res.data;
  },

  fetchMembers: async (params?: {
    search?: string;
    departmentId?: string;
    role?: string;
    sortBy?: string;
    order?: string;
    page?: number;
    limit?: number;
  }) => {
    const query = new URLSearchParams();
    if (params?.search)       query.set('search',       params.search);
    if (params?.departmentId) query.set('departmentId', params.departmentId);
    if (params?.role)         query.set('role',         params.role);
    if (params?.sortBy)       query.set('sortBy',       params.sortBy);
    if (params?.order)        query.set('order',        params.order);
    if (params?.page)         query.set('page',         String(params.page));
    if (params?.limit)        query.set('limit',        String(params.limit));
    const qs = query.toString();
    const res = await axiosInstance.get(`company-memberships/memberships${qs ? `?${qs}` : ''}`);
    return {
      members: res.data.memberships || res.data.members || [],
      total: res.data.total ?? res.data.pagination?.total ?? 0,
    };
  },

  fetchMembersPage: async (params: { page: number; limit: number; search?: string; departmentIds?: string[] }) => {
    const query = new URLSearchParams();
    query.set('page', String(params.page));
    query.set('limit', String(params.limit));
    if (params.search) query.set('search', params.search);
    if (params.departmentIds?.length) query.set('departmentId', params.departmentIds.join(','));
    const res = await axiosInstance.get(`company-memberships/memberships?${query.toString()}`);
    return {
      members: res.data.memberships || res.data.members || [],
      total: res.data.total ?? res.data.pagination?.total ?? 0,
    };
  },

  fetchInvitations: async () => {
    const res = await axiosInstance.get('company-invitations/myInvitations');
    return res.data.invitations || [];
  },

  resendInvitation: async (invitationId: string) => {
    const res = await axiosInstance.post(`company-invitations/resendInvitation/${invitationId}`);
    return res.data.updated;
  },

  cancelInvitation: async (invitationId: string) => {
    await axiosInstance.delete(`company-invitations/deleteInvitation/${invitationId}`);
    return invitationId;
  },

  respondToInvitation: async (params: {
    invitationId: string;
    action: 'accept' | 'reject';
    token?: string;
    firstName?: string;
    lastName?: string;
  }) => {
    const { invitationId, action, token, firstName, lastName } = params;
    const res = await axiosInstance.post(`company-invitations/respondInvitation/${invitationId}`, {
      action,
      ...(token     && { token }),
      ...(firstName && { firstName }),
      ...(lastName  && { lastName }),
    });
    return res.data;
  },

  fetchInvitationsByDepartment: async (departmentId: string) => {
    const res = await axiosInstance.get(`company-invitations/byDepartment/${departmentId}`);
    return res.data.invitations || [];
  },

  fetchMemberStats: async () => {
    const res = await axiosInstance.get('company-memberships/memberships/stats');
    return res.data.stats;
  },

  fetchInvitationDetails: async (invitationId: string) => {
    const res = await axiosInstance.get(`company-invitations/details/${invitationId}`);
    return res.data.invitation || res.data;
  },

  fetchEmployeePermissions: async (memberId: string) => {
    const res = await axiosInstance.get(`employee-permissions/${memberId}`);
    return res.data.data || res.data;
  },

  updateEmployeePermissions: async (memberId: string, permissions: any) => {
    const res = await axiosInstance.put(`employee-permissions/${memberId}`, permissions);
    return res.data.data || res.data;
  },

  acceptInvitationAsNewUser: async (params: {
    invitationId: string;
    token: string;
    firstName: string;
    lastName: string;
  }) => {
    const { invitationId, token, firstName, lastName } = params;
    const res = await axiosInstance.post(`company-invitations/registerAndAccept/${invitationId}`, { token, firstName, lastName });
    return res.data;
  },
};
