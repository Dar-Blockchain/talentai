import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { kpiService } from '@/services/kpiService';

// ── Types ──────────────────────────────────────────────────────────────────────

interface KpiCountState {
  count: number | null;
  loading: boolean;
}

interface KpiState {
  pendingShortlists:     KpiCountState;
  unreviewedInterviews:  KpiCountState;
}

const emptyCount = (): KpiCountState => ({ count: null, loading: false });

const initialState: KpiState = {
  pendingShortlists:    emptyCount(),
  unreviewedInterviews: emptyCount(),
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
  async () => {
    return await kpiService.fetchUnreviewedInterviews();
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
        state.unreviewedInterviews.count   = action.payload?.unreviewedCount ?? 0;
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
export const selectUnreviewedCount          = (s: S) => s.kpi.unreviewedInterviews.count;
export const selectUnreviewedLoading        = (s: S) => s.kpi.unreviewedInterviews.loading;
