import axiosInstance from "@/utils/axiosInstance";
import type {
  CreateDepartmentPayload,
  Department,
  DepartmentsQueryParams,
  DepartmentsResponse,
  DepartmentStats,
  UpdateDepartmentPayload,
} from "../types";

export const departmentsApi = {
  list: async (params?: DepartmentsQueryParams): Promise<DepartmentsResponse> => {
    const res = await axiosInstance.get("departments", {
      params: {
        ...(params?.page   ? { page: params.page }     : {}),
        ...(params?.limit  ? { limit: params.limit }   : {}),
        ...(params?.search ? { search: params.search } : {}),
      },
    });
    return res.data as DepartmentsResponse;
  },

  getById: async (id: string): Promise<Department> => {
    const res = await axiosInstance.get(`departments/${id}`);
    return (res.data.data ?? res.data) as Department;
  },

  create: async (payload: CreateDepartmentPayload): Promise<Department> => {
    const res = await axiosInstance.post("departments", payload);
    return res.data.data as Department;
  },

  update: async (
    id: string,
    payload: Omit<UpdateDepartmentPayload, "departmentId">,
  ): Promise<Department> => {
    const res = await axiosInstance.put(`departments/${id}`, payload);
    return res.data.data as Department;
  },

  delete: async (id: string): Promise<string> => {
    await axiosInstance.delete(`departments/${id}`);
    return id;
  },

  stats: async (): Promise<DepartmentStats> => {
    const res = await axiosInstance.get("departments/stats");
    return res.data.data as DepartmentStats;
  },
};
