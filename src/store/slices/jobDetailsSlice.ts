import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Job, transformJobData } from '@/utils/jobHelpers';

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
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
      const query = new URLSearchParams({
        page: (params.page || 1).toString(),
        limit: (params.limit || 6).toString(),
      });

      if (params.search) query.append('search', params.search);
      if (params.location && params.location !== 'All Locations') {
        query.append('location', params.location);
      }

      const response = await fetch(`${baseUrl}post/search?${query}`);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch jobs: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      if (data.success) {
        const jobs = (data.results || []).map(transformJobData);
        return {
          jobs,
          totalPages: data.totalPages || 1,
          total: data.total || 0,
        };
      } else {
        return rejectWithValue(data.message || 'Failed to fetch jobs');
      }
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
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
      const apiUrl = `${baseUrl}post/details/${jobId}`;

      console.log('🔍 Fetching job details from:', apiUrl);

      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error('Failed to fetch job details');
      }

      const data = await response.json();

      if (data.success) {
        return data.data;
      } else {
        return rejectWithValue(data.error || 'Failed to fetch job details');
      }
    } catch (err: any) {
      return rejectWithValue(err.message || 'Error loading job details. Please try again later.');
    }
  }
);

const jobDetailsSlice = createSlice({
  name: 'jobDetails',
  initialState,
  reducers: {
    clearJobDetails: (state) => {
      state.jobDetails = null;
      state.error = null;
    },
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

export const { clearJobDetails, clearError } = jobDetailsSlice.actions;
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
