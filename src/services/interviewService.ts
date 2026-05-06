import axiosInstance from '@/utils/axiosInstance';

const INTERVIEW_TYPE_MAP: Record<string, string> = {
  TECHNICAL_SKILL:  'TECHNICAL_INTERVIEW',
  SOFT_SKILL:       'ASSESSMENT',
  SALARY_INTERVIEW: 'HR_INTERVIEW',
  PSYCHOTECHNIC:    'EVALUATION',
};

const normalizeInterviewType = (interviewData: any) =>
  interviewData?.interviewType
    ? { ...interviewData, interviewType: INTERVIEW_TYPE_MAP[interviewData.interviewType] ?? interviewData.interviewType }
    : interviewData;

export const interviewService = {
  saveAssessment: async (params: {
    skill: string;
    proficiency: string;
    interviewData: any;
    skillType?: string;
  }) => {
    const res = await axiosInstance.post('skill-interview-assessments/', {
      skill: params.skill,
      proficiency: params.proficiency,
      interviewData: normalizeInterviewType(params.interviewData),
      skillType: params.skillType,
    });
    return res.data;
  },

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

  fetchDetailsById: async (interviewId: string) => {
    const res = await axiosInstance.get(`interview-details/getInterviewDetailsById/${interviewId}`);
    const data = res.data;
    if (data.success && data.data) return data.data;
    throw new Error('No interview data found');
  },

  fetchCompanyInterviewMetrics: async () => {
    const res = await axiosInstance.get('post-interview-assessments/company/mine/metrics');
    const d = res.data.data ?? {};
    return {
      total:     typeof d.total    === 'number' ? d.total    : 0,
      needWork:  typeof d.needWork === 'number' ? d.needWork : 0,
      excellent: typeof d.excellent === 'number' ? d.excellent : 0,
      avgScore:  typeof d.avgScore  === 'number' ? d.avgScore  : 0,
    };
  },

  checkPostAssessment: async (postId: string) => {
    const res = await axiosInstance.get(`post-interview-assessments/check/${postId}`);
    return { exists: !!res.data?.exists };
  },

  fetchCompanyInterviews: async (params: { search?: string; page?: number; limit?: number }) => {
    const { search, page = 1, limit = 12 } = params;
    const res = await axiosInstance.get('post-interview-assessments/company/mine', {
      params: { page, limit, ...(search ? { search } : {}) },
    });
    const json = res.data;
    const items: any[] = [];
    if (Array.isArray(json.data)) {
      json.data.forEach((group: any) => {
        if (Array.isArray(group.assessments)) {
          group.assessments.forEach((entry: any) => {
            if (entry.assessment) items.push(entry.assessment);
          });
        }
      });
    }
    const total = typeof json.count === 'number' ? json.count : typeof json.total === 'number' ? json.total : items.length;
    const totalPages = json.pagination?.totalPages ?? (Math.ceil(total / limit) || 1);
    return { items, total, totalPages };
  },

  fetchInterviewById: async (id: string) => {
    const res = await axiosInstance.get(`post-interview-assessments/${id}`);
    const d = res.data?.data;
    return { assessment: d?.assessment || d, stepsData: d?.stepsData || null, hasSteps: d?.hasSteps || false };
  },
};
