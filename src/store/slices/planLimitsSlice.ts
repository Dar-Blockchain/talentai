import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../store";

// ─── Types ───────────────────────────────────────────────

export interface PlanLimit {
  _id: string;
  name: string;
  postsLimit: number;
  candidateUnlockLimit: number;
  monthlyInterviewLimit: number;
  isActive: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface PlanLimitsState {
  plans: PlanLimit[];
  loading: boolean;
  error: string | null;
  updating: boolean;
  updateError: string | null;
}

// ─── Initial State ───────────────────────────────────────

const initialState: PlanLimitsState = {
  plans: [],
  loading: false,
  error: null,
  updating: false,
  updateError: null,
};

// ─── Helper ──────────────────────────────────────────────

const getToken = () => localStorage.getItem("api_token");

// ─── Thunks ──────────────────────────────────────────────

export const fetchPlanLimits = createAsyncThunk<
  PlanLimit[],
  void,
  { rejectValue: string }
>("planLimits/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const token = getToken();
    if (!token) throw new Error("Authentication token not found");

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}plan-limits`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    const data = await res.json();

    if (data.success && data.data) {
      return data.data as PlanLimit[];
    }

    return [];
  } catch (error: any) {
    return rejectWithValue(error.message || "Error fetching plan limits");
  }
});

export const updatePlanLimits = createAsyncThunk<
  PlanLimit,
  { id: string; updates: Partial<PlanLimit> },
  { rejectValue: string }
>("planLimits/update", async ({ id, updates }, { rejectWithValue }) => {
  try {
    const token = getToken();
    if (!token) throw new Error("Authentication token not found");

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}plan-limits`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...updates, _id: id }),
      }
    );

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    const data = await res.json();

    if (data.success && data.data) {
      return data.data as PlanLimit;
    }

    throw new Error("Failed to update plan limits");
  } catch (error: any) {
    return rejectWithValue(error.message || "Error updating plan limits");
  }
});

// ─── Slice ───────────────────────────────────────────────

const planLimitsSlice = createSlice({
  name: "planLimits",
  initialState,
  reducers: {
    clearPlanLimitsError: (state) => {
      state.error = null;
      state.updateError = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch plan limits
    builder
      .addCase(fetchPlanLimits.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlanLimits.fulfilled, (state, action) => {
        state.loading = false;
        state.plans = action.payload;
      })
      .addCase(fetchPlanLimits.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error fetching plan limits";
      });

    // Update plan limits
    builder
      .addCase(updatePlanLimits.pending, (state) => {
        state.updating = true;
        state.updateError = null;
      })
      .addCase(updatePlanLimits.fulfilled, (state, action) => {
        state.updating = false;
        // Update the plan in the array
        const index = state.plans.findIndex((p) => p._id === action.payload._id);
        if (index !== -1) {
          state.plans[index] = action.payload;
        }
      })
      .addCase(updatePlanLimits.rejected, (state, action) => {
        state.updating = false;
        state.updateError = action.payload || "Error updating plan limits";
      });
  },
});

// ─── Selectors ───────────────────────────────────────────

export const selectPlanLimits = (state: RootState) => state.planLimits.plans;
export const selectPlanLimitsLoading = (state: RootState) => state.planLimits.loading;
export const selectPlanLimitsError = (state: RootState) => state.planLimits.error;
export const selectPlanLimitsUpdating = (state: RootState) => state.planLimits.updating;
export const selectPlanLimitsUpdateError = (state: RootState) => state.planLimits.updateError;

export const { clearPlanLimitsError } = planLimitsSlice.actions;

export default planLimitsSlice.reducer;
