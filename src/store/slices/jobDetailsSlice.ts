import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Job, transformJobData } from '@/utils/jobHelpers';
import { jobDetailsService } from '@/services/jobDetailsService';

// ─── Search params ────────────────────────────────────────
export interface SearchJobsParams {
  page?: number;
  limit?: number;
  search?: string;
  location?: string;
}

interface JobSearchState {
  jobs: Job[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  totalJobs: number;
}

interface JobDetailsState {
  jobDetails: any | null;
  loading: boolean;
  error: string | null;
  // Job search / listing
  jobSearch: JobSearchState;
}

const initialState: JobDetailsState = {
  jobDetails: null,
  loading: false,
  error: null,
  jobSearch: {
    jobs: [],
    loading: false,
    error: null,
    totalPages: 1,
    totalJobs: 0,
  },
};

// Async thunk to search/list jobs
export const searchJobs = createAsyncThunk<
  { jobs: Job[]; totalPages: number; total: number },
  SearchJobsParams,
  { rejectValue: string }
>(
  'jobDetails/searchJobs',
  async (params, { rejectWithValue }) => {
    try {
      return await jobDetailsService.searchJobs(params) as { jobs: Job[]; totalPages: number; total: number };
    } catch (err: any) {
      return rejectWithValue(err.message || 'Error loading jobs. Please try again later.');
    }
  }
);

// Async thunk to fetch job details
export const fetchJobDetails = createAsyncThunk<
  any,
  string,
  { rejectValue: string }
>(
  'jobDetails/fetchJobDetails',
  async (jobId: string, { rejectWithValue }) => {
    try {
      return await jobDetailsService.fetchJobDetails(jobId);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Error loading job details. Please try again later.');
    }
  }
);

const jobDetailsSlice = createSlice({
  name: 'jobDetails',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobDetails.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.jobDetails = action.payload;
        state.error = null;
      })
      .addCase(fetchJobDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch job details';
      })
      // ---- SEARCH JOBS ----
      .addCase(searchJobs.pending, (state) => {
        state.jobSearch.loading = true;
        state.jobSearch.error = null;
      })
      .addCase(searchJobs.fulfilled, (state, action) => {
        state.jobSearch.loading = false;
        state.jobSearch.jobs = action.payload.jobs;
        state.jobSearch.totalPages = action.payload.totalPages;
        state.jobSearch.totalJobs = action.payload.total;
      })
      .addCase(searchJobs.rejected, (state, action) => {
        state.jobSearch.loading = false;
        state.jobSearch.error = action.payload || 'Error loading jobs';
      });
  },
});

export const { clearError } = jobDetailsSlice.actions;
export default jobDetailsSlice.reducer;

// ─── Selectors ───────────────────────────────────────────
export const selectJobSearchJobs = (state: { jobDetails: JobDetailsState }) =>
  state.jobDetails.jobSearch.jobs;
export const selectJobSearchLoading = (state: { jobDetails: JobDetailsState }) =>
  state.jobDetails.jobSearch.loading;
export const selectJobSearchError = (state: { jobDetails: JobDetailsState }) =>
  state.jobDetails.jobSearch.error;
export const selectJobSearchTotalPages = (state: { jobDetails: JobDetailsState }) =>
  state.jobDetails.jobSearch.totalPages;
export const selectJobSearchTotalJobs = (state: { jobDetails: JobDetailsState }) =>
  state.jobDetails.jobSearch.totalJobs;
