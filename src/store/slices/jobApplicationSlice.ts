import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '@/utils/axiosInstance';

interface ApplicationMetrics {
  totalApplicants: number;
  totalJobPosts: number;
  avgCVScore: number;
  topCVScore: number;
}

interface JobApplicationState {
  applications: any[];
  allApplications: any[];
  metrics: ApplicationMetrics | null;
  loading: boolean;
  metricsLoading: boolean;
}

const initialState: JobApplicationState = {
  applications: [],
  allApplications: [],
  metrics: null,
  loading: false,
  metricsLoading: false,
};

export const fetchCompanyApplications = createAsyncThunk(
  'jobApplications/fetchCompany',
  async (params: { candidateName?: string; skill?: string; postId?: string } = {}) => {
    const query = new URLSearchParams();
    if (params.candidateName) query.set('candidateName', params.candidateName);
    if (params.skill) query.set('skill', params.skill);
    if (params.postId) query.set('postId', params.postId);
    const url = `job-applications/company/my${query.toString() ? `?${query}` : ''}`;
    const res = await axiosInstance.get(url);
    return Array.isArray(res.data) ? res.data : Array.isArray(res.data?.data) ? res.data.data : [];
  }
);

export const fetchCompanyApplicationMetrics = createAsyncThunk(
  'jobApplications/fetchMetrics',
  async () => {
    const res = await axiosInstance.get('job-applications/company/my/metrics');
    return res.data?.data as ApplicationMetrics;
  }
);

const jobApplicationSlice = createSlice({
  name: 'jobApplications',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCompanyApplications.pending, (state, action) => {
        state.loading = true;
        // Only update allApplications on the initial fetch (no params)
        const arg = action.meta.arg ?? {};
        const isInitial = !arg.candidateName && !arg.skill && !arg.postId;
        if (isInitial) state.allApplications = [];
      })
      .addCase(fetchCompanyApplications.fulfilled, (state, action) => {
        state.loading = false;
        state.applications = action.payload;
        const arg = action.meta.arg ?? {};
        const isInitial = !arg.candidateName && !arg.skill && !arg.postId;
        if (isInitial) state.allApplications = action.payload;
      })
      .addCase(fetchCompanyApplications.rejected, (state) => {
        state.loading = false;
      })
      .addCase(fetchCompanyApplicationMetrics.pending, (state) => {
        state.metricsLoading = true;
      })
      .addCase(fetchCompanyApplicationMetrics.fulfilled, (state, action) => {
        state.metricsLoading = false;
        state.metrics = action.payload;
      })
      .addCase(fetchCompanyApplicationMetrics.rejected, (state) => {
        state.metricsLoading = false;
      });
  },
});

export default jobApplicationSlice.reducer;
