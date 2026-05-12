import axiosInstance from '@/utils/axiosInstance';

export const jobApplicationService = {
  fetchCompanyApplications: async (params: {
    candidateName?: string;
    skill?: string;
    postId?: string;
    scoreMin?: number;
    scoreMax?: number;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
    page?: number;
  } = {}) => {
    const query = new URLSearchParams();
    if (params.candidateName) query.set('candidateName', params.candidateName);
    if (params.skill) query.set('skill', params.skill);
    if (params.postId) query.set('postId', params.postId);
    if (params.scoreMin !== undefined && params.scoreMin > 0) query.set('scoreMin', String(params.scoreMin));
    if (params.scoreMax !== undefined && params.scoreMax < 100) query.set('scoreMax', String(params.scoreMax));
    if (params.dateFrom) query.set('dateFrom', params.dateFrom);
    if (params.dateTo) query.set('dateTo', params.dateTo);
    if (params.limit !== undefined) query.set('limit', String(params.limit));
    if (params.page !== undefined) query.set('page', String(params.page));
    const url = `job-applications/company/my${query.toString() ? `?${query}` : ''}`;
    const res = await axiosInstance.get(url);
    return (Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : []) as any[];
  },

  fetchPostApplicationsSummary: async (params: {
    postId: string;
    status?: string;
    search?: string;
    matchScoreMin?: number;
    matchScoreMax?: number;
    interviewScoreMin?: number;
    interviewScoreMax?: number;
    dateFrom?: string;
    dateTo?: string;
    sort?: string;
    page?: number;
    limit?: number;
  }) => {
    const { postId, ...rest } = params;
    const query = new URLSearchParams();
    Object.entries(rest).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.set(k, String(v));
    });
    const url = `job-applications/post/${postId}/summary${query.toString() ? `?${query}` : ''}`;
    const res = await axiosInstance.get(url);
    return { data: res.data?.data ?? [], pagination: res.data?.pagination ?? {} };
  },

  fetchCompanyApplicationsSummary: async (params: {
    status?: string;
    search?: string;
    postId?: string;
    matchScoreMin?: number;
    matchScoreMax?: number;
    interviewScoreMin?: number;
    interviewScoreMax?: number;
    dateFrom?: string;
    dateTo?: string;
    sort?: string;
    page?: number;
    limit?: number;
  } = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.set(k, String(v));
    });
    const res = await axiosInstance.get(`job-applications/company/my/summary${query.toString() ? `?${query}` : ''}`);
    return { data: res.data?.data ?? [], pagination: res.data?.pagination ?? {} };
  },

  inviteToInterview: async (applicationId: string, interviewLink: string) => {
    const res = await axiosInstance.post(`job-applications/${applicationId}/invite-to-interview`, { interviewLink });
    return res.data;
  },

  fetchCompanyApplicationMetrics: async () => {
    const res = await axiosInstance.get('job-applications/company/my/metrics');
    return res.data?.data;
  },

  fetchCandidateApplications: async (params: { page?: number; limit?: number } = {}) => {
    const query = new URLSearchParams();
    if (params.page)  query.set('page',  String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    const res = await axiosInstance.get(`job-applications/candidate/my${query.toString() ? `?${query}` : ''}`);
    return { data: Array.isArray(res.data?.data) ? res.data.data : [], pagination: res.data?.pagination ?? {} };
  },

  fetchCandidateStats: async () => {
    const res = await axiosInstance.get('job-applications/candidate/my/stats');
    return res.data;
  },

  createApplication: async (postId: string) => {
    const res = await axiosInstance.post('job-applications/', { post: postId });
    return res.data;
  },

};
