import axiosInstance from '@/utils/axiosInstance';

export const adminService = {
  fetchStats: async () => {
    const res = await axiosInstance.get('dashboard/getCounts');
    const data = res.data;
    if (data.success && data.data) {
      return {
        users: data.data.users || 0,
        posts: data.data.posts || 0,
        jobAssessments: data.data.jobAssessments || 0,
        jobAssessmentsWithScore: data.data.jobAssessmentsWithScore || 0,
        jobAssessmentsWithScorePercentage: data.data.jobAssessmentsWithScorePercentage || 0,
        feedback: data.data.feedback || 0,
        avgOverallScore: data.data.avgOverallScore || 0,
        totalSkills: data.data.totalSkills || 0,
        totalHardSkills: data.data.totalHardSkills || 0,
        totalSoftSkills: data.data.totalSoftSkills || 0,
        hardSkillsPercentage: data.data.hardSkillsPercentage || 0,
        softSkillsPercentage: data.data.softSkillsPercentage || 0,
        topSkills: data.data.topSkills || [],
      };
    }
    return null;
  },

  fetchAllUsersForMap: async () => {
    const res = await axiosInstance.get('dashboard/getAllUsers', { params: { limit: 1000 } });
    return res.data?.users || [];
  },

  fetchUserGrowthData: async () => {
    const res = await axiosInstance.get('dashboard/getUserCountsByDay');
    const data = res.data;
    if (!data.success || !data.data) return [];

    const processedData = data.data.usersCreatedByDay.map((item: any) => ({
      day: new Date(item.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      users: item.userCount,
      posts: 0,
      assessments: 0,
      fullDate: item.day,
    }));

    (data.data.postsCreatedByDay || []).forEach((postItem: any) => {
      const existing = processedData.find((i: any) => i.fullDate === postItem.day);
      if (existing) {
        existing.posts = postItem.postCount;
      } else {
        processedData.push({
          day: new Date(postItem.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          users: 0, posts: postItem.postCount, assessments: 0, fullDate: postItem.day,
        });
      }
    });

    (data.data.jobAssessmentsCreatedByDay || []).forEach((a: any) => {
      const existing = processedData.find((i: any) => i.fullDate === a.day);
      if (existing) {
        existing.assessments = a.jobAssessmentCount;
      } else {
        processedData.push({
          day: new Date(a.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          users: 0, posts: 0, assessments: a.jobAssessmentCount, fullDate: a.day,
        });
      }
    });

    processedData.sort((a: any, b: any) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());
    return processedData;
  },

  fetchPostAssessments: async (params: { page?: number; limit?: number; company?: string }) => {
    const { page = 1, limit = 10, company } = params;
    const res = await axiosInstance.get('post-interview-assessments', {
      params: { page, limit, ...(company ? { company } : {}) },
    });
    const data = res.data;
    const items = data.data || data.results || [];
    const total = data.pagination?.totalCount || data.total || data.count || data.totalCount || items.length;
    return { items, total };
  },

  fetchSkillAssessments: async (params: { page: number; limit: number; skill?: string }) => {
    const { page, limit, skill } = params;
    const res = await axiosInstance.get('skill-interview-assessments', {
      params: { page: page + 1, limit, ...(skill ? { skill } : {}) },
    });
    const data = res.data;
    const results = data.data || data.results || [];
    const total = data.pagination?.totalCount || data.total || data.count || data.totalCount || results.length;
    return { results, total };
  },

  fetchUsers: async (params: { page?: number; limit?: number; username?: string; email?: string; role?: string; status?: string }) => {
    const res = await axiosInstance.get('dashboard/getAllUsers', {
      params: {
        page: params.page ?? 1,
        limit: params.limit ?? 10,
        ...(params.username ? { username: params.username } : {}),
        ...(params.email ? { email: params.email } : {}),
        ...(params.role ? { role: params.role } : {}),
        ...(params.status ? { status: params.status } : {}),
      },
    });
    const data = res.data;
    return { users: data.users || [], total: data.pagination?.totalUsers ?? data.total ?? 0 };
  },

  saveCompanyPermissions: async (companyId: string, permissions: any) => {
    const res = await axiosInstance.post(`admin/companies/${companyId}/permissions`, permissions);
    return res.data;
  },
};
