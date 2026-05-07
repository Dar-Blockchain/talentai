import axiosInstance from '@/utils/axiosInstance';

export const departmentService = {
  fetchDepartments: async (params?: { page?: number; limit?: number; search?: string }) => {
    const res = await axiosInstance.get('departments', {
      params: {
        ...(params?.page   ? { page: params.page }     : {}),
        ...(params?.limit  ? { limit: params.limit }   : {}),
        ...(params?.search ? { search: params.search } : {}),
      },
    });
    return res.data;
  },

  createDepartment: async (payload: { name: string; description: string }) => {
    const res = await axiosInstance.post('departments', payload);
    return res.data.data;
  },

  updateDepartment: async (departmentId: string, body: { name?: string; description?: string }) => {
    const res = await axiosInstance.put(`departments/${departmentId}`, body);
    return res.data.data;
  },

  fetchDepartmentById: async (departmentId: string) => {
    const res = await axiosInstance.get(`departments/${departmentId}`);
    return res.data.data || res.data;
  },

  fetchDepartmentMembers: async (params: {
    departmentId: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const { departmentId, search, page, limit } = params;
    const p: Record<string, any> = {};
    if (search) p.search = search;
    if (page)   p.page   = page;
    if (limit)  p.limit  = limit;
    const res = await axiosInstance.get(`company-memberships/memberships/department/${departmentId}`, { params: p });
    return {
      members: res.data.memberships || [],
      total: res.data.pagination?.total ?? 0,
    };
  },

  deleteDepartment: async (departmentId: string) => {
    await axiosInstance.delete(`departments/${departmentId}`);
    return departmentId;
  },

  fetchDepartmentStats: async () => {
    const res = await axiosInstance.get('departments/stats');
    return res.data.data;
  },
};
