import axiosInstance from '@/utils/axiosInstance';

const qs = (params: Record<string, string | undefined>) => {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v) q.set(k, v); });
  return q.toString() ? `?${q}` : '';
};

export const kpiService = {
  fetchPendingShortlists: async (params: { postId?: string; dateFrom?: string; page?: number; limit?: number } = {}) => {
    const q = new URLSearchParams();
    if (params.postId)   q.set('postId',   params.postId);
    if (params.dateFrom) q.set('dateFrom', params.dateFrom);
    if (params.page)     q.set('page',     String(params.page));
    if (params.limit)    q.set('limit',    String(params.limit));
    const res = await axiosInstance.get(`job-applications/company/my/kpi/pending-shortlists${q.toString() ? `?${q}` : ''}`);
    return res.data?.data as { pendingShortlistsCount: number; threshold: number; filters: Record<string, any> };
  },

  fetchPendingShortlistsDetails: async (params: { postId?: string; page?: number; limit?: number } = {}) => {
    const res = await axiosInstance.get(`job-applications/company/my/kpi/pending-shortlists/details${qs({ postId: params.postId, page: params.page ? String(params.page) : undefined, limit: params.limit ? String(params.limit) : undefined })}`);
    return { data: res.data?.data ?? [], pagination: res.data?.pagination ?? {} };
  },

  fetchUnreviewedInterviews: async (params: { postId?: string; dateFrom?: string } = {}) => {
    const res = await axiosInstance.get(`post-interview-assessments/company/mine/kpi/unreviewed-48h${qs({ postId: params.postId, dateFrom: params.dateFrom })}`);
    return res.data?.data as { count: number; urgent: number; lastCheck: string; description: string };
  },

  fetchUnreviewedInterviewsDetails: async (params: { page?: number; limit?: number } = {}) => {
    const res = await axiosInstance.get(`post-interview-assessments/company/mine/kpi/unreviewed-48h/details${qs({ page: params.page ? String(params.page) : undefined, limit: params.limit ? String(params.limit) : undefined })}`);
    return { data: res.data?.data ?? [], pagination: res.data?.pagination ?? {} };
  },

  fetchSourcing: async (params: { postId?: string; dateFrom?: string } = {}) => {
    const res = await axiosInstance.get(`job-applications/company/my/kpi/sourcing${qs({ postId: params.postId, dateFrom: params.dateFrom })}`);
    return res.data?.data as {
      avgCurrent: number | null;
      avgDelta:   number | null;
      byPost: Array<{ label: string; score: number; color: string }>;
      top10:  Array<{ rank: number; firstName: string; lastName: string; postTitle: string; score: number; status: 'shortlisted' | 'completed' }>;
    };
  },

  fetchVelocity: async (params: { postId?: string; dateFrom?: string } = {}) => {
    const res = await axiosInstance.get(`job-applications/company/my/kpi/velocity${qs({ postId: params.postId, dateFrom: params.dateFrom })}`);
    return res.data?.data as {
      tts:      number | null;
      ttsDelta: number | null;
      tth:      number | null;
      tthDelta: number | null;
      trend: Array<{ period: string; tts: number | null; tth: number | null }>;
    };
  },

  fetchFunnel: async (params: { postId?: string; dateFrom?: string } = {}) => {
    const res = await axiosInstance.get(`job-applications/company/my/kpi/funnel${qs({ postId: params.postId, dateFrom: params.dateFrom })}`);
    return res.data?.data as { invited: number; started: number; completed: number; shortlisted: number };
  },

  fetchNoshows: async (params: { postId?: string; dateFrom?: string } = {}) => {
    const res = await axiosInstance.get(`job-applications/company/my/kpi/noshows${qs({ postId: params.postId, dateFrom: params.dateFrom })}`);
    return res.data?.data as { count: number };
  },

  fetchPostsInAlert: async () => {
    const res = await axiosInstance.get('post/kpi/posts-in-alert');
    return res.data?.data as { count: number };
  },

  fetchMyPostsForFilter: async () => {
    const res = await axiosInstance.get('post/my-posts?limit=100');
    const posts = res.data?.results ?? res.data?.data ?? res.data ?? [];
    return (posts as any[]).map((p: any) => ({
      id:    String(p._id),
      title: p.jobDetails?.title || p.title || 'Untitled',
    })) as Array<{ id: string; title: string }>;
  },

  fetchRoi: async () => {
    const res = await axiosInstance.get('job-applications/company/my/kpi/roi');
    return res.data?.data as {
      savedHours:          number;
      completedInterviews: number;
      subscriptionCost:    number;
      costPerHire:         number | null;
      costPerShortlisted:  number | null;
      shortlisted:         number;
      trend: Array<{ month: string; tth: number | null }>;
    };
  },

  fetchPostsStatusKPI: async (params: { page?: number; limit?: number; postId?: string } = {}) => {
    const res = await axiosInstance.get(`post/kpi/status-by-post${qs({ page: params.page ? String(params.page) : undefined, limit: params.limit ? String(params.limit) : undefined, postId: params.postId })}`);
    return {
      data: res.data?.data as Array<{ id: string; title: string; shortlisted: number; velocity: number | null; coverage: number; deadline: number | null }>,
      pagination: res.data?.pagination as { currentPage: number; totalPages: number; totalCount: number },
    };
  },
};
