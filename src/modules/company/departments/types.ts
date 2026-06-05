export interface Department {
  _id: string;
  name: string;
  description: string;
  companyId: string;
  createdAt: string;
  updatedAt?: string;
}

export interface DepartmentMember {
  _id: string;
  firstName?: string;
  lastName?: string;
  username: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

export interface DepartmentStats {
  total: number;
  trend: { date: string; count: number }[];
  byDepartment: { name: string; members: number }[];
}

export interface DepartmentsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface DepartmentsResponse {
  data: Department[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface CreateDepartmentPayload {
  name: string;
  description: string;
}

export interface UpdateDepartmentPayload {
  departmentId: string;
  name?: string;
  description?: string;
}
