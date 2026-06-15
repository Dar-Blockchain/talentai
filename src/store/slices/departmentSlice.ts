import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { departmentService } from "@/services/departmentService";
import {
  DEPARTMENT_API_ERROR_I18N,
  extractAxiosErrorMessage,
} from "@/modules/company/departments/utils/departmentI18n";

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
    return await departmentService.fetchDepartments(params) as DepartmentsResponse;
  } catch (err: unknown) {
    return rejectWithValue(
      extractAxiosErrorMessage(err) ?? DEPARTMENT_API_ERROR_I18N.fetchList,
    );
  }
});

export const createDepartment = createAsyncThunk<
  Department,
  CreateDepartmentPayload,
  { rejectValue: string }
>("department/create", async (payload, { rejectWithValue }) => {
  try {
    return await departmentService.createDepartment(payload) as Department;
  } catch (err: unknown) {
    return rejectWithValue(
      extractAxiosErrorMessage(err) ?? DEPARTMENT_API_ERROR_I18N.create,
    );
  }
});

export const updateDepartment = createAsyncThunk<
  Department,
  UpdateDepartmentPayload,
  { rejectValue: string }
>("department/update", async ({ departmentId, ...body }, { rejectWithValue }) => {
  try {
    return await departmentService.updateDepartment(departmentId, body) as Department;
  } catch (err: unknown) {
    return rejectWithValue(
      extractAxiosErrorMessage(err) ?? DEPARTMENT_API_ERROR_I18N.update,
    );
  }
});

export const fetchDepartmentById = createAsyncThunk<
  Department,
  string,
  { rejectValue: string }
>("department/fetchById", async (departmentId, { rejectWithValue }) => {
  try {
    return await departmentService.fetchDepartmentById(departmentId) as Department;
  } catch (err: unknown) {
    return rejectWithValue(
      extractAxiosErrorMessage(err) ?? "Error fetching department",
    );
  }
});

export const deleteDepartment = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("department/delete", async (departmentId, { rejectWithValue }) => {
  try {
    await departmentService.deleteDepartment(departmentId);
    return departmentId;
  } catch (err: unknown) {
    return rejectWithValue(
      extractAxiosErrorMessage(err) ?? DEPARTMENT_API_ERROR_I18N.delete,
    );
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
    return await departmentService.fetchDepartmentStats() as DepartmentStats;
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
        state.error = (action.payload as string | undefined) ?? DEPARTMENT_API_ERROR_I18N.fetchList;
      });

    builder
      .addCase(createDepartment.pending, (state) => {
        state.creating = true; state.createError = null; state.createSuccess = false;
      })
      .addCase(createDepartment.fulfilled, (state, action) => {
        state.creating = false; state.createSuccess = true;
        state.departments.unshift(action.payload); state.total += 1;
      })
      .addCase(createDepartment.rejected, (state, action) => {
        state.creating = false;
        state.createError = (action.payload as string | undefined) ?? DEPARTMENT_API_ERROR_I18N.create;
      });

    builder
      .addCase(updateDepartment.pending, (state) => {
        state.updating = true; state.updateError = null; state.updateSuccess = false;
      })
      .addCase(updateDepartment.fulfilled, (state, action) => {
        state.updating = false; state.updateSuccess = true;
        const idx = state.departments.findIndex((d) => d._id === action.payload._id);
        if (idx !== -1) state.departments[idx] = action.payload;
      })
      .addCase(updateDepartment.rejected, (state, action) => {
        state.updating = false;
        state.updateError = (action.payload as string | undefined) ?? DEPARTMENT_API_ERROR_I18N.update;
      });

    builder
      .addCase(fetchDepartmentById.pending, (state) => {
        state.loadingCurrent = true; state.currentError = null; state.currentDepartment = null;
      })
      .addCase(fetchDepartmentById.fulfilled, (state, action) => {
        state.loadingCurrent = false; state.currentDepartment = action.payload;
      })
      .addCase(fetchDepartmentById.rejected, (state, action) => {
        state.loadingCurrent = false;
        state.currentError = action.payload || "Error fetching department";
      });

    builder
      .addCase(deleteDepartment.pending, (state) => {
        state.deleting = true; state.deleteError = null; state.deleteSuccess = false;
      })
      .addCase(deleteDepartment.fulfilled, (state, action) => {
        state.deleting = false; state.deleteSuccess = true;
        state.departments = state.departments.filter((d) => d._id !== action.payload);
        state.total -= 1;
      })
      .addCase(deleteDepartment.rejected, (state, action) => {
        state.deleting = false;
        state.deleteError = (action.payload as string | undefined) ?? DEPARTMENT_API_ERROR_I18N.delete;
      });

    builder
      .addCase(fetchDepartmentStats.pending, (state) => { state.deptStatsLoading = true; })
      .addCase(fetchDepartmentStats.fulfilled, (state, action) => {
        state.deptStatsLoading = false; state.deptStats = action.payload;
      })
      .addCase(fetchDepartmentStats.rejected, (state) => { state.deptStatsLoading = false; });
  },
});

export const { clearCreateStatus, clearUpdateStatus, clearDeleteStatus, clearError, setPage } =
  departmentSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectDepartments            = (s: any) => s.department.departments       as Department[];
export const selectDepartmentsLoading     = (s: any) => s.department.loading           as boolean;
export const selectDepartmentsError       = (s: any) => s.department.error             as string | null;
export const selectDepartmentCreating     = (s: any) => s.department.creating          as boolean;
export const selectDepartmentCreateSuccess = (s: any) => s.department.createSuccess    as boolean;
export const selectDepartmentCreateError  = (s: any) => s.department.createError       as string | null;
export const selectDepartmentUpdating     = (s: any) => s.department.updating          as boolean;
export const selectDepartmentUpdateSuccess = (s: any) => s.department.updateSuccess    as boolean;
export const selectDepartmentUpdateError  = (s: any) => s.department.updateError       as string | null;
export const selectDepartmentDeleting     = (s: any) => s.department.deleting          as boolean;
export const selectDepartmentDeleteSuccess = (s: any) => s.department.deleteSuccess    as boolean;
export const selectDepartmentDeleteError  = (s: any) => s.department.deleteError       as string | null;
export const selectDepartmentTotal        = (s: any) => s.department.total             as number;
export const selectDepartmentPage         = (s: any) => s.department.page              as number;
export const selectDepartmentLimit        = (s: any) => s.department.limit             as number;
export const selectCurrentDepartment      = (s: any) => s.department.currentDepartment as Department | null;
export const selectCurrentDepartmentLoading = (s: any) => s.department.loadingCurrent  as boolean;
export const selectCurrentDepartmentError = (s: any) => s.department.currentError      as string | null;
export const selectDepartmentMembers      = (s: any) => s.department.departmentMembers as DepartmentMember[];
export const selectDepartmentMembersTotal = (s: any) => s.department.membersTotal      as number;
export const selectDepartmentMembersLoading = (s: any) => s.department.loadingMembers  as boolean;
export const selectDepartmentMembersError = (s: any) => s.department.membersError      as string | null;
export const selectDepartmentStats        = (s: any) => s.department.deptStats         as DepartmentStats | null;
export const selectDepartmentStatsLoading = (s: any) => s.department.deptStatsLoading  as boolean;

export default departmentSlice.reducer;
