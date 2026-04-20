import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "@/utils/axiosInstance";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Department {
  _id: string;
  name: string;
  description: string;
  companyId: string;
  createdAt: string;
  updatedAt?: string;
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

interface DepartmentsResponse {
  data: Department[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchDepartments = createAsyncThunk<
  DepartmentsResponse,
  { page?: number; limit?: number; search?: string } | undefined,
  { rejectValue: string }
>("department/fetchAll", async (params, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get("departments", {
      params: {
        ...(params?.page ? { page: params.page } : {}),
        ...(params?.limit ? { limit: params.limit } : {}),
        ...(params?.search ? { search: params.search } : {}),
      },
    });
    return response.data as DepartmentsResponse;
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

export const createDepartment = createAsyncThunk<
  Department,
  CreateDepartmentPayload,
  { rejectValue: string }
>("department/create", async (payload, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post("departments", payload);
    return response.data.data as Department;
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

export const updateDepartment = createAsyncThunk<
  Department,
  UpdateDepartmentPayload,
  { rejectValue: string }
>("department/update", async ({ departmentId, ...body }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.put(`departments/${departmentId}`, body);
    return response.data.data as Department;
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

export const fetchDepartmentById = createAsyncThunk<
  Department,
  string,
  { rejectValue: string }
>("department/fetchById", async (departmentId, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(`departments/${departmentId}`);
    return (response.data.data || response.data) as Department;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Error fetching department");
  }
});

export interface FetchDepartmentMembersParams {
  departmentId: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const fetchDepartmentMembers = createAsyncThunk<
  { members: DepartmentMember[]; total: number },
  FetchDepartmentMembersParams,
  { rejectValue: string }
>("department/fetchMembers", async ({ departmentId, search, page, limit }, { rejectWithValue }) => {
  try {
    const params: Record<string, any> = {};
    if (search) params.search = search;
    if (page)   params.page   = page;
    if (limit)  params.limit  = limit;
    const response = await axiosInstance.get(
      `company-memberships/memberships/department/${departmentId}`,
      { params },
    );
    return {
      members: response.data.memberships || [],
      total: response.data.pagination?.total ?? 0,
    };
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Error fetching department members");
  }
});

export const deleteDepartment = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("department/delete", async (departmentId, { rejectWithValue }) => {
  try {
    await axiosInstance.delete(`departments/${departmentId}`);
    return departmentId;
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

export interface DepartmentStats {
  total: number;
  trend: { date: string; count: number }[];
  byDepartment: { name: string; members: number }[];
}

export const fetchDepartmentStats = createAsyncThunk<
  DepartmentStats,
  void,
  { rejectValue: string }
>("department/fetchStats", async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get("departments/stats");
    return response.data.data as DepartmentStats;
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

// ─── State ────────────────────────────────────────────────────────────────────

interface DepartmentState {
  departments: Department[];
  loading: boolean;
  error: string | null;
  creating: boolean;
  createError: string | null;
  createSuccess: boolean;
  updating: boolean;
  updateError: string | null;
  updateSuccess: boolean;
  deleting: boolean;
  deleteError: string | null;
  deleteSuccess: boolean;
  page: number;
  limit: number;
  total: number;
  currentDepartment: Department | null;
  loadingCurrent: boolean;
  currentError: string | null;
  departmentMembers: DepartmentMember[];
  membersTotal: number;
  loadingMembers: boolean;
  membersError: string | null;
  deptStats: DepartmentStats | null;
  deptStatsLoading: boolean;
}

const initialState: DepartmentState = {
  departments: [],
  loading: false,
  error: null,
  creating: false,
  createError: null,
  createSuccess: false,
  updating: false,
  updateError: null,
  updateSuccess: false,
  deleting: false,
  deleteError: null,
  deleteSuccess: false,
  page: 1,
  limit: 10,
  total: 0,
  currentDepartment: null,
  loadingCurrent: false,
  currentError: null,
  departmentMembers: [],
  membersTotal: 0,
  loadingMembers: false,
  membersError: null,
  deptStats: null,
  deptStatsLoading: false,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const departmentSlice = createSlice({
  name: "department",
  initialState,
  reducers: {
    clearCreateStatus(state) {
      state.createSuccess = false;
      state.createError = null;
    },
    clearUpdateStatus(state) {
      state.updateSuccess = false;
      state.updateError = null;
    },
    clearDeleteStatus(state) {
      state.deleteSuccess = false;
      state.deleteError = null;
    },
    clearError(state) {
      state.error = null;
    },
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },
  },
  extraReducers: (builder) => {
    // fetchDepartments
    builder
      .addCase(fetchDepartments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.loading = false;
        state.departments = action.payload.data;
        state.page = action.payload.pagination.page;
        state.limit = action.payload.pagination.limit;
        state.total = action.payload.pagination.total;
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error fetching departments";
      });

    // createDepartment
    builder
      .addCase(createDepartment.pending, (state) => {
        state.creating = true;
        state.createError = null;
        state.createSuccess = false;
      })
      .addCase(createDepartment.fulfilled, (state, action) => {
        state.creating = false;
        state.createSuccess = true;
        state.departments.unshift(action.payload);
        state.total += 1;
      })
      .addCase(createDepartment.rejected, (state, action) => {
        state.creating = false;
        state.createError = action.payload || "Error creating department";
      });

    // updateDepartment
    builder
      .addCase(updateDepartment.pending, (state) => {
        state.updating = true;
        state.updateError = null;
        state.updateSuccess = false;
      })
      .addCase(updateDepartment.fulfilled, (state, action) => {
        state.updating = false;
        state.updateSuccess = true;
        const idx = state.departments.findIndex((d) => d._id === action.payload._id);
        if (idx !== -1) state.departments[idx] = action.payload;
      })
      .addCase(updateDepartment.rejected, (state, action) => {
        state.updating = false;
        state.updateError = action.payload || "Error updating department";
      });

    // fetchDepartmentById
    builder
      .addCase(fetchDepartmentById.pending, (state) => {
        state.loadingCurrent = true;
        state.currentError = null;
        state.currentDepartment = null;
      })
      .addCase(fetchDepartmentById.fulfilled, (state, action) => {
        state.loadingCurrent = false;
        state.currentDepartment = action.payload;
      })
      .addCase(fetchDepartmentById.rejected, (state, action) => {
        state.loadingCurrent = false;
        state.currentError = action.payload || "Error fetching department";
      });

    // fetchDepartmentMembers
    builder
      .addCase(fetchDepartmentMembers.pending, (state) => {
        state.loadingMembers = true;
        state.membersError = null;
      })
      .addCase(fetchDepartmentMembers.fulfilled, (state, action) => {
        state.loadingMembers = false;
        state.departmentMembers = action.payload.members;
        state.membersTotal = action.payload.total;
      })
      .addCase(fetchDepartmentMembers.rejected, (state, action) => {
        state.loadingMembers = false;
        state.membersError = action.payload || "Error fetching members";
      });

    // deleteDepartment
    builder
      .addCase(deleteDepartment.pending, (state) => {
        state.deleting = true;
        state.deleteError = null;
        state.deleteSuccess = false;
      })
      .addCase(deleteDepartment.fulfilled, (state, action) => {
        state.deleting = false;
        state.deleteSuccess = true;
        state.departments = state.departments.filter((d) => d._id !== action.payload);
        state.total -= 1;
      })
      .addCase(deleteDepartment.rejected, (state, action) => {
        state.deleting = false;
        state.deleteError = action.payload || "Error deleting department";
      });

    // fetchDepartmentStats
    builder
      .addCase(fetchDepartmentStats.pending, (state) => { state.deptStatsLoading = true; })
      .addCase(fetchDepartmentStats.fulfilled, (state, action) => {
        state.deptStatsLoading = false;
        state.deptStats = action.payload;
      })
      .addCase(fetchDepartmentStats.rejected, (state) => { state.deptStatsLoading = false; });
  },
});

export const { clearCreateStatus, clearUpdateStatus, clearDeleteStatus, clearError, setPage } =
  departmentSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectDepartments = (state: any) =>
  state.department.departments as Department[];
export const selectDepartmentsLoading = (state: any) =>
  state.department.loading as boolean;
export const selectDepartmentsError = (state: any) =>
  state.department.error as string | null;
export const selectDepartmentCreating = (state: any) =>
  state.department.creating as boolean;
export const selectDepartmentCreateSuccess = (state: any) =>
  state.department.createSuccess as boolean;
export const selectDepartmentCreateError = (state: any) =>
  state.department.createError as string | null;
export const selectDepartmentUpdating = (state: any) =>
  state.department.updating as boolean;
export const selectDepartmentUpdateSuccess = (state: any) =>
  state.department.updateSuccess as boolean;
export const selectDepartmentUpdateError = (state: any) =>
  state.department.updateError as string | null;
export const selectDepartmentDeleting = (state: any) =>
  state.department.deleting as boolean;
export const selectDepartmentDeleteSuccess = (state: any) =>
  state.department.deleteSuccess as boolean;
export const selectDepartmentDeleteError = (state: any) =>
  state.department.deleteError as string | null;
export const selectDepartmentTotal = (state: any) =>
  state.department.total as number;
export const selectDepartmentPage = (state: any) =>
  state.department.page as number;
export const selectDepartmentLimit = (state: any) =>
  state.department.limit as number;
export const selectCurrentDepartment = (state: any) =>
  state.department.currentDepartment as Department | null;
export const selectCurrentDepartmentLoading = (state: any) =>
  state.department.loadingCurrent as boolean;
export const selectCurrentDepartmentError = (state: any) =>
  state.department.currentError as string | null;
export const selectDepartmentMembers = (state: any) =>
  state.department.departmentMembers as DepartmentMember[];
export const selectDepartmentMembersTotal = (state: any) =>
  state.department.membersTotal as number;
export const selectDepartmentMembersLoading = (state: any) =>
  state.department.loadingMembers as boolean;
export const selectDepartmentMembersError = (state: any) =>
  state.department.membersError as string | null;
export const selectDepartmentStats = (state: any) =>
  state.department.deptStats as DepartmentStats | null;
export const selectDepartmentStatsLoading = (state: any) =>
  state.department.deptStatsLoading as boolean;

export default departmentSlice.reducer;
