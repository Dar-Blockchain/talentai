import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

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

interface DepartmentsResponse {
  data: Department[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getToken = () =>
  localStorage.getItem("api_token") ||
  document.cookie
    .split("; ")
    .find((r) => r.startsWith("api_token="))
    ?.split("=")[1] ||
  "";

const BASE = `${process.env.NEXT_PUBLIC_API_BASE_URL}departments`;

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchDepartments = createAsyncThunk<
  DepartmentsResponse,
  { page?: number; limit?: number; search?: string } | undefined,
  { rejectValue: string }
>("department/fetchAll", async (params, { rejectWithValue }) => {
  try {
    const token = getToken();
    const url = new URL(BASE);
    if (params?.page) url.searchParams.set("page", params.page.toString());
    if (params?.limit) url.searchParams.set("limit", params.limit.toString());
    if (params?.search) url.searchParams.set("search", params.search);

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to fetch departments");
    return data as DepartmentsResponse;
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
    const token = getToken();
    const res = await fetch(BASE, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to create department");
    return data.data as Department;
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
    const token = getToken();
    const res = await fetch(`${BASE}/${departmentId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to update department");
    return data.data as Department;
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

export const deleteDepartment = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("department/delete", async (departmentId, { rejectWithValue }) => {
  try {
    const token = getToken();
    const res = await fetch(`${BASE}/${departmentId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to delete department");
    return departmentId;
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

export default departmentSlice.reducer;
