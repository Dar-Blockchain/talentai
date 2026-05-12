import axiosInstance from '@/utils/axiosInstance';

const qs = (params: Record<string, string | undefined>) => {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v) q.set(k, v); });
  return q.toString() ? `?${q}` : '';
};

export const kpiService = {
  fetchActions: async (params: { postId?: string; dateFrom?: string } = {}) => {
    const res = await axiosInstance.get(`job-applications/company/my/kpi/actions${qs({ postId: params.postId, dateFrom: params.dateFrom })}`);
    return res.data?.data as {
      pendingShortlists: number;
      unreviewed:        number;
      unreviewedUrgent:  number;
      noshows:           number;
      postsInAlert:      number;
    };
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
