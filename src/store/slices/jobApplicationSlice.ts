import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '@/utils/axiosInstance';

interface ApplicationMetrics {
  totalApplicants: number;
  totalJobPosts: number;
  avgCVScore: number;
  topCVScore: number;
}

export interface ApplicationSummaryItem {
  id: string;
  candidateUserId: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  userImage: string | null;
  matchScore: number | null;
  interviewScore: number | null;
  appliedAt: string | null;
  completedAt: string | null;
  status: string;
  postId?: string | null;
  postTitle?: string | null;
  resumeFile?: string | null;
}

interface SummaryState {
  data: ApplicationSummaryItem[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  totalCount: number;
}

interface JobApplicationState {
  applications: any[];
  allApplications: any[];
  metrics: ApplicationMetrics | null;
  loading: boolean;
  metricsLoading: boolean;
  postSummary: SummaryState;
  companySummary: SummaryState;
}

const emptySummary: SummaryState = { data: [], loading: false, currentPage: 1, totalPages: 1, totalCount: 0 };

const initialState: JobApplicationState = {
  applications: [],
  allApplications: [],
  metrics: null,
  loading: false,
  metricsLoading: false,
  postSummary: { ...emptySummary },
  companySummary: { ...emptySummary },
};

export const fetchCompanyApplications = createAsyncThunk(
  'jobApplications/fetchCompany',
  async (params: {
    candidateName?: string;
    skill?: string;
    postId?: string;
    scoreMin?: number;
    scoreMax?: number;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
    page?: number;
  } = {}) => {
    const query = new URLSearchParams();
    if (params.candidateName) query.set('candidateName', params.candidateName);
    if (params.skill) query.set('skill', params.skill);
    if (params.postId) query.set('postId', params.postId);
    if (params.scoreMin !== undefined && params.scoreMin > 0) query.set('scoreMin', String(params.scoreMin));
    if (params.scoreMax !== undefined && params.scoreMax < 100) query.set('scoreMax', String(params.scoreMax));
    if (params.dateFrom) query.set('dateFrom', params.dateFrom);
    if (params.dateTo) query.set('dateTo', params.dateTo);
    if (params.limit !== undefined) query.set('limit', String(params.limit));
    if (params.page !== undefined) query.set('page', String(params.page));
    const url = `job-applications/company/my${query.toString() ? `?${query}` : ''}`;
    const res = await axiosInstance.get(url);
    return (Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : []) as any[];
  }
);

export const fetchPostApplicationsSummary = createAsyncThunk(
  'jobApplications/fetchPostSummary',
  async (params: {
    postId: string;
    status?: string;
    search?: string;
    matchScoreMin?: number;
    matchScoreMax?: number;
    interviewScoreMin?: number;
    interviewScoreMax?: number;
    dateFrom?: string;
    dateTo?: string;
    sort?: string;
    page?: number;
    limit?: number;
  }) => {
    const { postId, ...rest } = params;
    const query = new URLSearchParams();
    Object.entries(rest).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.set(k, String(v));
    });
    const url = `job-applications/post/${postId}/summary${query.toString() ? `?${query}` : ''}`;
    const res = await axiosInstance.get(url);
    return {
      data: (res.data?.data ?? []) as ApplicationSummaryItem[],
      pagination: res.data?.pagination ?? {},
    };
  }
);

export const fetchCompanyApplicationsSummary = createAsyncThunk(
  'jobApplications/fetchCompanySummary',
  async (params: {
    status?: string;
    search?: string;
    postId?: string;
    matchScoreMin?: number;
    matchScoreMax?: number;
    interviewScoreMin?: number;
    interviewScoreMax?: number;
    dateFrom?: string;
    dateTo?: string;
    sort?: string;
    page?: number;
    limit?: number;
  } = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.set(k, String(v));
    });
    const res = await axiosInstance.get(`job-applications/company/my/summary${query.toString() ? `?${query}` : ''}`);
    return {
      data: (res.data?.data ?? []) as ApplicationSummaryItem[],
      pagination: res.data?.pagination ?? {},
    };
  }
);

export const inviteToInterview = createAsyncThunk(
  'jobApplications/inviteToInterview',
  async (params: { applicationId: string; interviewLink: string }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(
        `job-applications/${params.applicationId}/invite-to-interview`,
        { interviewLink: params.interviewLink }
      );
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error ?? 'Failed to send invitation');
    }
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
      .addCase(fetchPostApplicationsSummary.pending, (state) => {
        state.postSummary.loading = true;
      })
      .addCase(fetchPostApplicationsSummary.fulfilled, (state, action) => {
        state.postSummary.loading = false;
        state.postSummary.data = action.payload.data;
        state.postSummary.currentPage = action.payload.pagination.currentPage ?? 1;
        state.postSummary.totalPages = action.payload.pagination.totalPages ?? 1;
        state.postSummary.totalCount = action.payload.pagination.totalCount ?? 0;
      })
      .addCase(fetchPostApplicationsSummary.rejected, (state) => {
        state.postSummary.loading = false;
      })
      .addCase(fetchCompanyApplicationsSummary.pending, (state) => {
        state.companySummary.loading = true;
      })
      .addCase(fetchCompanyApplicationsSummary.fulfilled, (state, action) => {
        state.companySummary.loading = false;
        state.companySummary.data = action.payload.data;
        state.companySummary.currentPage = action.payload.pagination.currentPage ?? 1;
        state.companySummary.totalPages = action.payload.pagination.totalPages ?? 1;
        state.companySummary.totalCount = action.payload.pagination.totalCount ?? 0;
      })
      .addCase(fetchCompanyApplicationsSummary.rejected, (state) => {
        state.companySummary.loading = false;
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

// Selectors
export const selectApplications = (state: { jobApplications: JobApplicationState }) => state.jobApplications.applications;
export const selectApplicationMetrics = (state: { jobApplications: JobApplicationState }) => state.jobApplications.metrics;
export const selectApplicationMetricsLoading = (state: { jobApplications: JobApplicationState }) => state.jobApplications.metricsLoading;
export const selectAllApplications = (state: { jobApplications: JobApplicationState }) => state.jobApplications.allApplications;
export const selectApplicationsLoading = (state: { jobApplications: JobApplicationState }) => state.jobApplications.loading;
export const selectPostSummary = (state: { jobApplications: JobApplicationState }) => state.jobApplications.postSummary.data;
export const selectPostSummaryLoading = (state: { jobApplications: JobApplicationState }) => state.jobApplications.postSummary.loading;
export const selectPostSummaryPagination = (state: { jobApplications: JobApplicationState }) => ({
  currentPage: state.jobApplications.postSummary.currentPage,
  totalPages: state.jobApplications.postSummary.totalPages,
  totalCount: state.jobApplications.postSummary.totalCount,
});
export const selectCompanySummary = (state: { jobApplications: JobApplicationState }) => state.jobApplications.companySummary.data;
export const selectCompanySummaryLoading = (state: { jobApplications: JobApplicationState }) => state.jobApplications.companySummary.loading;
export const selectCompanySummaryPagination = (state: { jobApplications: JobApplicationState }) => ({
  currentPage: state.jobApplications.companySummary.currentPage,
  totalPages: state.jobApplications.companySummary.totalPages,
  totalCount: state.jobApplications.companySummary.totalCount,
});
