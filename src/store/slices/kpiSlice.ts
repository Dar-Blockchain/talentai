import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { kpiService } from '@/services/kpiService';

// ── Types ──────────────────────────────────────────────────────────────────────

interface KpiCountState {
  count:   number | null;
  loading: boolean;
}

interface UnreviewedState {
  count:   number | null;
  urgent:  number | null;
  loading: boolean;
}

interface KpiState {
  pendingShortlists:    KpiCountState;
  unreviewedInterviews: UnreviewedState;
}

const initialState: KpiState = {
  pendingShortlists:    { count: null, loading: false },
  unreviewedInterviews: { count: null, urgent: null, loading: false },
};

// ── Thunks ─────────────────────────────────────────────────────────────────────

export const fetchPendingShortlists = createAsyncThunk(
  'kpi/fetchPendingShortlists',
  async (params: { postId?: string; page?: number; limit?: number } = {}) => {
    return await kpiService.fetchPendingShortlists(params);
  }
);

export const fetchUnreviewedInterviews = createAsyncThunk(
  'kpi/fetchUnreviewedInterviews',
  async (params: { postId?: string } = {}) => {
    return await kpiService.fetchUnreviewedInterviews(params);
  }
);

// ── Slice ──────────────────────────────────────────────────────────────────────

const kpiSlice = createSlice({
  name: 'kpi',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPendingShortlists.pending, (state) => {
        state.pendingShortlists.loading = true;
      })
      .addCase(fetchPendingShortlists.fulfilled, (state, action) => {
        state.pendingShortlists.loading = false;
        state.pendingShortlists.count   = action.payload?.pendingShortlistsCount ?? 0;
      })
      .addCase(fetchPendingShortlists.rejected, (state) => {
        state.pendingShortlists.loading = false;
      })

      .addCase(fetchUnreviewedInterviews.pending, (state) => {
        state.unreviewedInterviews.loading = true;
      })
      .addCase(fetchUnreviewedInterviews.fulfilled, (state, action) => {
        state.unreviewedInterviews.loading = false;
        state.unreviewedInterviews.count  = action.payload?.count  ?? 0;
        state.unreviewedInterviews.urgent = action.payload?.urgent ?? 0;
      })
      .addCase(fetchUnreviewedInterviews.rejected, (state) => {
        state.unreviewedInterviews.loading = false;
      });
  },
});

export default kpiSlice.reducer;

// ── Selectors ──────────────────────────────────────────────────────────────────

type S = { kpi: KpiState };

export const selectPendingShortlistsCount   = (s: S) => s.kpi.pendingShortlists.count;
export const selectPendingShortlistsLoading = (s: S) => s.kpi.pendingShortlists.loading;
export const selectUnreviewedCount   = (s: S) => s.kpi.unreviewedInterviews.count;
export const selectUnreviewedUrgent  = (s: S) => s.kpi.unreviewedInterviews.urgent;
export const selectUnreviewedLoading = (s: S) => s.kpi.unreviewedInterviews.loading;
