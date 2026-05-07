import axiosInstance from '@/utils/axiosInstance';

export const campaignService = {
  fetchCampaigns: async (params: { status?: string; page?: number; limit?: number; search?: string; period?: string }) => {
    const p: Record<string, any> = {};
    if (params?.status) p.status = params.status;
    if (params?.page)   p.page   = params.page;
    if (params?.limit)  p.limit  = params.limit;
    if (params?.search) p.search = params.search;
    if (params?.period) p.period = params.period;
    const res = await axiosInstance.get('internal-campaigns', { params: p });
    return res.data;
  },

  createCampaign: async (payload: any) => {
    const res = await axiosInstance.post('internal-campaigns', payload);
    return res.data.data;
  },

  updateCampaignStatus: async (campaignId: string, status: string) => {
    const res = await axiosInstance.patch(`internal-campaigns/${campaignId}/status`, { status });
    return res.data.data;
  },

  deleteCampaign: async (campaignId: string) => {
    await axiosInstance.delete(`internal-campaigns/${campaignId}`);
    return campaignId;
  },

  fetchCampaignById: async (campaignId: string, userId?: string) => {
    const url = userId
      ? `internal-campaigns/${campaignId}?userId=${userId}`
      : `internal-campaigns/${campaignId}`;
    const res = await axiosInstance.get(url);
    return res.data.data;
  },

  updateCampaign: async (campaignId: string, updatePayload: any) => {
    const res = await axiosInstance.put(`internal-campaigns/${campaignId}`, { ...updatePayload });
    return res.data.data;
  },

  fetchMetrics: async () => {
    const res = await axiosInstance.get('internal-campaigns/metrics');
    return res.data.data;
  },

  fetchParticipants: async (campaignId: string, params: { search?: string; page?: number; limit?: number }) => {
    const res = await axiosInstance.get(`internal-campaigns/${campaignId}/participants`, { params });
    const payload = res.data.data;
    return { data: payload.data, total: payload.total ?? payload.data?.length ?? 0 };
  },

  fetchSessions: async (campaignId: string, params: { search?: string; page?: number; limit?: number }) => {
    const res = await axiosInstance.get(`internal-campaigns/${campaignId}/sessions`, { params });
    return { data: res.data.data, total: res.data.total ?? res.data.data?.length ?? 0 };
  },

  fetchEmployeeCampaigns: async (params: {
    userId: string;
    search?: string;
    participantStatus?: string;
    period?: string;
    page?: number;
    limit?: number;
  }) => {
    const { userId, search, participantStatus, period, page = 1, limit = 10 } = params;
    const p: Record<string, string> = { page: String(page), limit: String(limit) };
    if (search)            p.search            = search;
    if (participantStatus) p.participantStatus = participantStatus;
    if (period)            p.period            = period;
    const res = await axiosInstance.get(`internal-campaigns/employee/${userId}`, { params: p });
    const json = res.data;
    return {
      data:  json.data,
      total: json.pagination?.total ?? json.data?.length ?? 0,
      pages: json.pagination?.pages ?? 1,
      page:  json.pagination?.page  ?? page,
      limit: json.pagination?.limit ?? limit,
    };
  },

  fetchEmployeeCampaignMetrics: async (userId: string) => {
    const res = await axiosInstance.get(`internal-campaigns/employee/${userId}/metrics`);
    return res.data.data;
  },

  fetchNonParticipants: async (campaignId: string, params: any) => {
    const res = await axiosInstance.get(`internal-campaigns/${campaignId}/non-participants`, { params });
    const payload = res.data.data;
    return { data: payload.data, total: payload.total ?? 0 };
  },

  addParticipant: async (campaignId: string, employeeId: string) => {
    const res = await axiosInstance.post(`internal-campaigns/${campaignId}/participate/${employeeId}`);
    const data = res.data.data;
    if (data.anonymousToken) {
      localStorage.setItem(`anon_token_${campaignId}`, data.anonymousToken);
    }
    return data;
  },

  removeParticipant: async (campaignId: string, participantId: string) => {
    await axiosInstance.delete(`internal-campaigns/${campaignId}/participate/${participantId}`);
    return participantId;
  },

  fetchParticipantResults: async (campaignId: string, participantId: string) => {
    const res = await axiosInstance.get(`internal-campaigns/${campaignId}/results/${participantId}`);
    return res.data.data;
  },

  fetchByLinkToken: async (token: string) => {
    const res = await axiosInstance.get(`internal-campaigns/link/${token}`);
    return res.data.data;
  },

  joinByLink: async (token: string, name?: string, email?: string) => {
    const body: Record<string, string> = {};
    if (name)  body.name  = name;
    if (email) body.email = email;
    const res = await axiosInstance.post(`internal-campaigns/link/${token}/join`, body);
    const data = res.data.data;
    if (data.anonymousToken) localStorage.setItem(`anon_token_${data.campaignId}`, data.anonymousToken);
    if (data.linkAccessToken) localStorage.setItem(`link_token_${data.campaignId}`, data.linkAccessToken);
    return data;
  },
};
