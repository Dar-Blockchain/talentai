import axiosInstance from '@/utils/axiosInstance';

export const kpiService = {
  fetchPendingShortlists: async (params: { postId?: string; page?: number; limit?: number } = {}) => {
    const query = new URLSearchParams();
    if (params.postId) query.set('postId', params.postId);
    if (params.page)   query.set('page',   String(params.page));
    if (params.limit)  query.set('limit',  String(params.limit));
    const res = await axiosInstance.get(`job-applications/company/my/kpi/pending-shortlists${query.toString() ? `?${query}` : ''}`);
    return res.data?.data as { pendingShortlistsCount: number; threshold: number; filters: Record<string, any> };
  },

  fetchPendingShortlistsDetails: async (params: { postId?: string; page?: number; limit?: number } = {}) => {
    const query = new URLSearchParams();
    if (params.postId) query.set('postId', params.postId);
    if (params.page)   query.set('page',   String(params.page));
    if (params.limit)  query.set('limit',  String(params.limit));
    const res = await axiosInstance.get(`job-applications/company/my/kpi/pending-shortlists/details${query.toString() ? `?${query}` : ''}`);
    return { data: res.data?.data ?? [], pagination: res.data?.pagination ?? {} };
  },

  fetchUnreviewedInterviews: async () => {
    const res = await axiosInstance.get('post-interview-assessments/company/mine/kpi/unreviewed-48h');
    return res.data?.data as { unreviewedCount: number; threshold: number; filters: Record<string, any> };
  },

  fetchUnreviewedInterviewsDetails: async (params: { page?: number; limit?: number } = {}) => {
    const query = new URLSearchParams();
    if (params.page)  query.set('page',  String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    const res = await axiosInstance.get(`post-interview-assessments/company/mine/kpi/unreviewed-48h/details${query.toString() ? `?${query}` : ''}`);
    return { data: res.data?.data ?? [], pagination: res.data?.pagination ?? {} };
  },
};
