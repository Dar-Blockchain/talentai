import axiosInstance from '@/utils/axiosInstance';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

export const jobDetailsService = {
  searchJobs: async (params: { page?: number; limit?: number; search?: string; location?: string }) => {
    const res = await axiosInstance.get('post/search', {
      params: {
        page: params.page || 1,
        limit: params.limit || 6,
        ...(params.search ? { search: params.search } : {}),
        ...(params.location && params.location !== 'All Locations' ? { location: params.location } : {}),
      },
    });
    const data = res.data;
    if (data.success) {
      return { jobs: data.results || [], totalPages: data.totalPages || 1, total: data.total || 0 };
    }
    throw new Error(data.message || 'Failed to fetch jobs');
  },

  fetchJobDetails: async (jobId: string) => {
    const apiUrl = `${API_BASE_URL}post/details/${jobId}`;
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error('Failed to fetch job details');
    const data = await response.json();
    if (data.success) return data.data;
    throw new Error(data.error || 'Failed to fetch job details');
  },
};
