import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { jobApplicationService } from '@/services/jobApplicationService';

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

interface CandidateStats {
  totalApplications: number;
  totalInterviews: number;
  statusCounts: Record<string, number>;
  monthly: { month: string; applications: number }[];
}

interface CandidateListState {
  data: any[];
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
  candidateList: CandidateListState;
  candidateStats: CandidateStats | null;
  candidateStatsLoading: boolean;
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
  candidateList: { data: [], loading: false, currentPage: 1, totalPages: 1, totalCount: 0 },
  candidateStats: null,
  candidateStatsLoading: false,
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
    return await jobApplicationService.fetchCompanyApplications(params);
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
    const result = await jobApplicationService.fetchPostApplicationsSummary(params);
    return { data: result.data as ApplicationSummaryItem[], pagination: result.pagination };
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
    const result = await jobApplicationService.fetchCompanyApplicationsSummary(params);
    return { data: result.data as ApplicationSummaryItem[], pagination: result.pagination };
  }
);

export const inviteToInterview = createAsyncThunk(
  'jobApplications/inviteToInterview',
  async (params: { applicationId: string; interviewLink: string }, { rejectWithValue }) => {
    try {
      return await jobApplicationService.inviteToInterview(params.applicationId, params.interviewLink);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error ?? 'Failed to send invitation');
    }
  }
);

export const fetchCompanyApplicationMetrics = createAsyncThunk(
  'jobApplications/fetchMetrics',
  async () => {
    return await jobApplicationService.fetchCompanyApplicationMetrics() as ApplicationMetrics;
  }
);

export const fetchCandidateApplications = createAsyncThunk(
  'jobApplications/fetchCandidateList',
  async (params: { page?: number; limit?: number } = {}) => {
    const result = await jobApplicationService.fetchCandidateApplications(params);
    return { data: result.data as any[], pagination: result.pagination };
  }
);

export const fetchCandidateStats = createAsyncThunk(
  'jobApplications/fetchCandidateStats',
  async () => {
    return await jobApplicationService.fetchCandidateStats() as CandidateStats & { success: boolean };
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
      })
      .addCase(fetchCandidateApplications.pending, (state) => {
        state.candidateList.loading = true;
      })
      .addCase(fetchCandidateApplications.fulfilled, (state, action) => {
        state.candidateList.loading = false;
        state.candidateList.data = action.payload.data;
        state.candidateList.currentPage = action.payload.pagination.currentPage ?? 1;
        state.candidateList.totalPages  = action.payload.pagination.totalPages  ?? 1;
        state.candidateList.totalCount  = action.payload.pagination.totalCount  ?? 0;
      })
      .addCase(fetchCandidateApplications.rejected, (state) => {
        state.candidateList.loading = false;
      })
      .addCase(fetchCandidateStats.pending, (state) => {
        state.candidateStatsLoading = true;
      })
      .addCase(fetchCandidateStats.fulfilled, (state, action) => {
        state.candidateStatsLoading = false;
        state.candidateStats = {
          totalApplications: action.payload.totalApplications,
          totalInterviews:   action.payload.totalInterviews,
          statusCounts:      action.payload.statusCounts,
          monthly:           action.payload.monthly,
        };
      })
      .addCase(fetchCandidateStats.rejected, (state) => {
        state.candidateStatsLoading = false;
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

export const selectCandidateApplications        = (state: { jobApplications: JobApplicationState }) => state.jobApplications.candidateList.data;
export const selectCandidateApplicationsLoading = (state: { jobApplications: JobApplicationState }) => state.jobApplications.candidateList.loading;
export const selectCandidateApplicationsPagination = (state: { jobApplications: JobApplicationState }) => ({
  currentPage: state.jobApplications.candidateList.currentPage,
  totalPages:  state.jobApplications.candidateList.totalPages,
  totalCount:  state.jobApplications.candidateList.totalCount,
});
export const selectCandidateStats        = (state: { jobApplications: JobApplicationState }) => state.jobApplications.candidateStats;
export const selectCandidateStatsLoading = (state: { jobApplications: JobApplicationState }) => state.jobApplications.candidateStatsLoading;
