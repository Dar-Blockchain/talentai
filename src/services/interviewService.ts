import axiosInstance from '@/utils/axiosInstance';

export const interviewService = {
  fetchAssessments: async (params: { type: string; page: number; limit: number; candidateId: string }) => {
    const res = await axiosInstance.get('skill-interview-assessments/my', {
      params: { page: params.page + 1, limit: params.limit, candidateId: params.candidateId },
    });
    const json = res.data;
    const results = Array.isArray(json.results) ? json.results : Array.isArray(json.data) ? json.data : [];
    const total =
      typeof json.total === 'number' && json.total >= 0 ? json.total
      : typeof json.count === 'number' && json.count >= 0 ? json.count
      : typeof json.totalCount === 'number' && json.totalCount >= 0 ? json.totalCount
      : results.length;
    return { results, total };
  },

  fetchSkillAssessmentsByType: async (params: { skillType: 'technical' | 'soft'; limit?: number }) => {
    const res = await axiosInstance.get('skill-interview-assessments/my', {
      params: { skillType: params.skillType, limit: params.limit ?? 20 },
    });
    const data = res.data;
    const results = data.data || data.results || [];
    const total = data.pagination?.totalCount || data.total || results.length;
    return { results, total, skillType: params.skillType };
  },

  fetchReport: async (id: string) => {
    const res = await axiosInstance.get(`skill-interview-assessments/${id}`);
    return res.data.data;
  },

  fetchInterviewById: async (id: string) => {
    const res = await axiosInstance.get(`post-interview-assessments/${id}`);
    const d = res.data?.data;
    return { assessment: d?.assessment || d, stepsData: d?.stepsData || null, hasSteps: d?.hasSteps || false };
  },
};
