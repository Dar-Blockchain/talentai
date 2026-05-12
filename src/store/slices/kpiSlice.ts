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

export interface PostStatusRow {
  id:          string;
  title:       string;
  shortlisted: number;
  velocity:    number | null;
  coverage:    number;
  deadline:    number | null;
}

interface PostsStatusState {
  rows:        PostStatusRow[];
  loading:     boolean;
  currentPage: number;
  totalPages:  number;
  totalCount:  number;
}

export interface SourcingCandidate {
  rank:      number;
  firstName: string;
  lastName:  string;
  postTitle: string;
  score:     number;
  status:    'shortlisted' | 'completed';
}

interface SourcingState {
  avgCurrent: number | null;
  avgDelta:   number | null;
  byPost:     Array<{ label: string; score: number; color: string }>;
  top10:      SourcingCandidate[];
  loading:    boolean;
}

interface TrendPoint {
  period: string;
  tts:    number | null;
  tth:    number | null;
}

interface VelocityState {
  tts:      number | null;
  ttsDelta: number | null;
  tth:      number | null;
  tthDelta: number | null;
  trend:    TrendPoint[];
  loading:  boolean;
}

interface FunnelState {
  applied:     number | null;
  invited:     number | null;
  completed:   number | null;
  shortlisted: number | null;
  loading:     boolean;
}

interface RoiTrendPoint {
  month: string;
  tth:   number | null;
}

interface RoiState {
  savedHours:          number | null;
  completedInterviews: number | null;
  subscriptionCost:    number | null;
  costPerHire:         number | null;
  costPerShortlisted:  number | null;
  shortlisted:         number | null;
  trend:               RoiTrendPoint[];
  loading:             boolean;
}

interface KpiFilterState {
  postId:         string | null;
  dateFrom:       string | null;
  availablePosts: Array<{ id: string; title: string }>;
  postsLoading:   boolean;
}

interface KpiState {
  pendingShortlists:    KpiCountState;
  unreviewedInterviews: UnreviewedState;
  noshows:              KpiCountState;
  postsInAlert:         KpiCountState;
  postsStatus:          PostsStatusState;
  funnel:               FunnelState;
  velocity:             VelocityState;
  sourcing:             SourcingState;
  roi:                  RoiState;
  filters:              KpiFilterState;
}

const initialState: KpiState = {
  pendingShortlists:    { count: null, loading: false },
  unreviewedInterviews: { count: null, urgent: null, loading: false },
  noshows:              { count: null, loading: false },
  postsInAlert:         { count: null, loading: false },
  postsStatus:          { rows: [], loading: false, currentPage: 1, totalPages: 1, totalCount: 0 },
  funnel:               { applied: null, invited: null, completed: null, shortlisted: null, loading: false },
  velocity:             { tts: null, ttsDelta: null, tth: null, tthDelta: null, trend: [], loading: false },
  sourcing:             { avgCurrent: null, avgDelta: null, byPost: [], top10: [], loading: false },
  roi:                  { savedHours: null, completedInterviews: null, subscriptionCost: null, costPerHire: null, costPerShortlisted: null, shortlisted: null, trend: [], loading: false },
  filters:              { postId: null, dateFrom: null, availablePosts: [], postsLoading: false },
};

// ── Thunks ─────────────────────────────────────────────────────────────────────

export const fetchMyPostsForFilter = createAsyncThunk(
  'kpi/fetchMyPostsForFilter',
  async () => {
    return await kpiService.fetchMyPostsForFilter();
  }
);

export const fetchPendingShortlists = createAsyncThunk(
  'kpi/fetchPendingShortlists',
  async (params: { postId?: string; dateFrom?: string; page?: number; limit?: number } = {}) => {
    return await kpiService.fetchPendingShortlists(params);
  }
);

export const fetchUnreviewedInterviews = createAsyncThunk(
  'kpi/fetchUnreviewedInterviews',
  async (params: { postId?: string; dateFrom?: string } = {}) => {
    return await kpiService.fetchUnreviewedInterviews(params);
  }
);

export const fetchNoshows = createAsyncThunk(
  'kpi/fetchNoshows',
  async (params: { postId?: string; dateFrom?: string } = {}) => {
    return await kpiService.fetchNoshows(params);
  }
);

export const fetchPostsInAlert = createAsyncThunk(
  'kpi/fetchPostsInAlert',
  async () => {
    return await kpiService.fetchPostsInAlert();
  }
);

export const fetchSourcing = createAsyncThunk(
  'kpi/fetchSourcing',
  async (params: { postId?: string; dateFrom?: string } = {}) => {
    return await kpiService.fetchSourcing(params);
  }
);

export const fetchVelocity = createAsyncThunk(
  'kpi/fetchVelocity',
  async (params: { postId?: string; dateFrom?: string } = {}) => {
    return await kpiService.fetchVelocity(params);
  }
);

export const fetchFunnel = createAsyncThunk(
  'kpi/fetchFunnel',
  async (params: { postId?: string; dateFrom?: string } = {}) => {
    return await kpiService.fetchFunnel(params);
  }
);

export const fetchRoi = createAsyncThunk(
  'kpi/fetchRoi',
  async () => {
    return await kpiService.fetchRoi();
  }
);

export const fetchPostsStatus = createAsyncThunk(
  'kpi/fetchPostsStatus',
  async (params: { page?: number; limit?: number; postId?: string } = {}) => {
    return await kpiService.fetchPostsStatusKPI(params);
  }
);

// ── Slice ──────────────────────────────────────────────────────────────────────

const kpiSlice = createSlice({
  name: 'kpi',
  initialState,
  reducers: {
    setKpiFilter: (state, action: { payload: { postId?: string | null; dateFrom?: string | null } }) => {
      if (action.payload.postId !== undefined)   state.filters.postId   = action.payload.postId;
      if (action.payload.dateFrom !== undefined) state.filters.dateFrom = action.payload.dateFrom;
    },
  },
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
      })

      .addCase(fetchNoshows.pending, (state) => {
        state.noshows.loading = true;
      })
      .addCase(fetchNoshows.fulfilled, (state, action) => {
        state.noshows.loading = false;
        state.noshows.count   = action.payload?.count ?? 0;
      })
      .addCase(fetchNoshows.rejected, (state) => {
        state.noshows.loading = false;
      })

      .addCase(fetchPostsInAlert.pending, (state) => {
        state.postsInAlert.loading = true;
      })
      .addCase(fetchPostsInAlert.fulfilled, (state, action) => {
        state.postsInAlert.loading = false;
        state.postsInAlert.count   = action.payload?.count ?? 0;
      })
      .addCase(fetchPostsInAlert.rejected, (state) => {
        state.postsInAlert.loading = false;
      })

      .addCase(fetchPostsStatus.pending, (state) => {
        state.postsStatus.loading = true;
      })
      .addCase(fetchPostsStatus.fulfilled, (state, action) => {
        state.postsStatus.loading     = false;
        state.postsStatus.rows        = action.payload?.data        ?? [];
        state.postsStatus.currentPage = action.payload?.pagination?.currentPage ?? 1;
        state.postsStatus.totalPages  = action.payload?.pagination?.totalPages  ?? 1;
        state.postsStatus.totalCount  = action.payload?.pagination?.totalCount  ?? 0;
      })
      .addCase(fetchPostsStatus.rejected, (state) => {
        state.postsStatus.loading = false;
      })

      .addCase(fetchSourcing.pending, (state) => {
        state.sourcing.loading = true;
      })
      .addCase(fetchSourcing.fulfilled, (state, action) => {
        state.sourcing.loading     = false;
        state.sourcing.avgCurrent  = action.payload?.avgCurrent ?? null;
        state.sourcing.avgDelta    = action.payload?.avgDelta   ?? null;
        state.sourcing.byPost      = action.payload?.byPost     ?? [];
        state.sourcing.top10       = action.payload?.top10      ?? [];
      })
      .addCase(fetchSourcing.rejected, (state) => {
        state.sourcing.loading = false;
      })

      .addCase(fetchVelocity.pending, (state) => {
        state.velocity.loading = true;
      })
      .addCase(fetchVelocity.fulfilled, (state, action) => {
        state.velocity.loading  = false;
        state.velocity.tts      = action.payload?.tts      ?? null;
        state.velocity.ttsDelta = action.payload?.ttsDelta ?? null;
        state.velocity.tth      = action.payload?.tth      ?? null;
        state.velocity.tthDelta = action.payload?.tthDelta ?? null;
        state.velocity.trend    = action.payload?.trend    ?? [];
      })
      .addCase(fetchVelocity.rejected, (state) => {
        state.velocity.loading = false;
      })

      .addCase(fetchFunnel.pending, (state) => {
        state.funnel.loading = true;
      })
      .addCase(fetchFunnel.fulfilled, (state, action) => {
        state.funnel.loading     = false;
        state.funnel.applied     = action.payload?.applied     ?? 0;
        state.funnel.invited     = action.payload?.invited     ?? 0;
        state.funnel.completed   = action.payload?.completed   ?? 0;
        state.funnel.shortlisted = action.payload?.shortlisted ?? 0;
      })
      .addCase(fetchFunnel.rejected, (state) => {
        state.funnel.loading = false;
      })

      .addCase(fetchRoi.pending, (state) => {
        state.roi.loading = true;
      })
      .addCase(fetchRoi.fulfilled, (state, action) => {
        state.roi.loading             = false;
        state.roi.savedHours          = action.payload?.savedHours          ?? null;
        state.roi.completedInterviews = action.payload?.completedInterviews ?? null;
        state.roi.subscriptionCost    = action.payload?.subscriptionCost    ?? null;
        state.roi.costPerHire         = action.payload?.costPerHire         ?? null;
        state.roi.costPerShortlisted  = action.payload?.costPerShortlisted  ?? null;
        state.roi.shortlisted         = action.payload?.shortlisted         ?? null;
        state.roi.trend               = action.payload?.trend               ?? [];
      })
      .addCase(fetchRoi.rejected, (state) => {
        state.roi.loading = false;
      })

      .addCase(fetchMyPostsForFilter.pending, (state) => {
        state.filters.postsLoading = true;
      })
      .addCase(fetchMyPostsForFilter.fulfilled, (state, action) => {
        state.filters.postsLoading  = false;
        state.filters.availablePosts = action.payload ?? [];
      })
      .addCase(fetchMyPostsForFilter.rejected, (state) => {
        state.filters.postsLoading = false;
      });
  },
});

export const { setKpiFilter } = kpiSlice.actions;
export default kpiSlice.reducer;

// ── Selectors ──────────────────────────────────────────────────────────────────

type S = { kpi: KpiState };

export const selectPendingShortlistsCount   = (s: S) => s.kpi.pendingShortlists.count;
export const selectPendingShortlistsLoading = (s: S) => s.kpi.pendingShortlists.loading;
export const selectUnreviewedCount   = (s: S) => s.kpi.unreviewedInterviews.count;
export const selectUnreviewedUrgent  = (s: S) => s.kpi.unreviewedInterviews.urgent;
export const selectUnreviewedLoading = (s: S) => s.kpi.unreviewedInterviews.loading;
export const selectNoshowsCount   = (s: S) => s.kpi.noshows.count;
export const selectNoshowsLoading = (s: S) => s.kpi.noshows.loading;
export const selectPostsInAlertCount   = (s: S) => s.kpi.postsInAlert.count;
export const selectPostsInAlertLoading = (s: S) => s.kpi.postsInAlert.loading;
export const selectSourcing        = (s: S) => s.kpi.sourcing;
export const selectSourcingLoading = (s: S) => s.kpi.sourcing.loading;
export const selectVelocity        = (s: S) => s.kpi.velocity;
export const selectVelocityLoading = (s: S) => s.kpi.velocity.loading;
export const selectFunnel          = (s: S) => s.kpi.funnel;
export const selectFunnelLoading   = (s: S) => s.kpi.funnel.loading;

export const selectRoi        = (s: S) => s.kpi.roi;
export const selectRoiLoading = (s: S) => s.kpi.roi.loading;

export const selectKpiPostId         = (s: S) => s.kpi.filters.postId;
export const selectKpiDateFrom       = (s: S) => s.kpi.filters.dateFrom;
export const selectKpiAvailablePosts = (s: S) => s.kpi.filters.availablePosts;
export const selectKpiPostsLoading   = (s: S) => s.kpi.filters.postsLoading;

export const selectPostsStatusRows        = (s: S) => s.kpi.postsStatus.rows;
export const selectPostsStatusLoading     = (s: S) => s.kpi.postsStatus.loading;
export const selectPostsStatusCurrentPage = (s: S) => s.kpi.postsStatus.currentPage;
export const selectPostsStatusTotalPages  = (s: S) => s.kpi.postsStatus.totalPages;
export const selectPostsStatusTotalCount  = (s: S) => s.kpi.postsStatus.totalCount;
