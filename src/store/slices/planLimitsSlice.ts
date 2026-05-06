import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { planLimitsService } from "@/services/planLimitsService";

// ─── Types ───────────────────────────────────────────────

export interface PlanLimit {
  _id: string;
  name: string;
  postsLimit: number;
  monthlyInterviewLimit: number;
  priceUsd?: number;
  stripePriceId?: string;
  isActive: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface PlanLimitsState {
  plans: PlanLimit[];
  currentPlanLimit: PlanLimit | null;
  loading: boolean;
  error: string | null;
  updating: boolean;
  updateError: string | null;
}

// ─── Initial State ───────────────────────────────────────

const initialState: PlanLimitsState = {
  plans: [],
  currentPlanLimit: null,
  loading: false,
  error: null,
  updating: false,
  updateError: null,
};

// ─── Thunks ──────────────────────────────────────────────

export const fetchPlanLimits = createAsyncThunk<
  PlanLimit[],
  void,
  { rejectValue: string }
>("planLimits/fetchAll", async (_, { rejectWithValue }) => {
  try {
    return await planLimitsService.fetchAll() as PlanLimit[];
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || error.message || "Error fetching plan limits");
  }
});

export const fetchPlanLimitById = createAsyncThunk<
  PlanLimit,
  string,
  { rejectValue: string }
>("planLimits/fetchById", async (planLimitId, { rejectWithValue }) => {
  try {
    return await planLimitsService.fetchById(planLimitId) as PlanLimit;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || error.message || "Error fetching plan limit");
  }
});

export const updatePlanLimits = createAsyncThunk<
  PlanLimit,
  { id: string; updates: Partial<PlanLimit> },
  { rejectValue: string }
>("planLimits/update", async ({ id, updates }, { rejectWithValue }) => {
  try {
    return await planLimitsService.update(id, updates) as PlanLimit;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || error.message || "Error updating plan limits");
  }
});

// ─── Slice ───────────────────────────────────────────────

const planLimitsSlice = createSlice({
  name: "planLimits",
  initialState,
  reducers: {},
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

    // Fetch plan limit by ID
    builder
      .addCase(fetchPlanLimitById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlanLimitById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPlanLimit = action.payload;
      })
      .addCase(fetchPlanLimitById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error fetching plan limit";
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
export const selectCurrentPlanLimit = (state: RootState) => state.planLimits.currentPlanLimit;
export const selectPlanLimitsLoading = (state: RootState) => state.planLimits.loading;
export const selectPlanLimitsError = (state: RootState) => state.planLimits.error;
export const selectPlanLimitsUpdating = (state: RootState) => state.planLimits.updating;
export const selectPlanLimitsUpdateError = (state: RootState) => state.planLimits.updateError;

export default planLimitsSlice.reducer;
