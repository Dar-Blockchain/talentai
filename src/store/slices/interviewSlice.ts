import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { interviewService } from '@/services/interviewService';

export interface SkillInterviewAssessment {
  _id: string;
  id?: string;
  skill: string;
  proficiency: string;
  candidateId?: any;
  interviewerId?: any;
  interviewData?: {
    finalReport?: {
      summary?: string;
      coverage?: {
        overall: number;
        areas?: {
          technical_depth?: AreaData;
          problem_approach?: AreaData;
          learning_ability?: AreaData;
          practical_experience?: AreaData;
        };
        completedAreas?: string[];
        nextRecommendedArea?: string | null;
        lastUpdated?: string;
      };
      recommendations?: string[];
      scores?: Record<string, number>;
      timestamp?: string;
    };
    analytics?: {
      duration?: number;
      messageCount?: number;
      silenceEvents?: number;
      coveragePercentage?: number;
      completedAreas?: number;
      totalAreas?: number;
      averageResponseLength?: number;
      interactionStyle?: string;
    };
    sessionId?: string;
    interviewType?: string;
    timestamp?: string;
  };
  exportedAt?: string;
  type?: string;
  role?: string;
  category?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

interface AreaData {
  percentage: number;
  indicators: Array<{
    name: string;
    covered: boolean;
    evidence: string[];
    quality: number;
  }>;
  weight: number;
  depth?: string;
  completed: boolean;
}

interface SkillTypeAssessments {
  data: SkillInterviewAssessment[];
  loading: boolean;
  error: string | null;
  total: number;
}

interface InterviewReportState {
  data: any | null;
  loading: boolean;
  error: string | null;
}

interface CompanyInterviewsState {
  items: any[];
  total: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
}

interface CompanyInterviewMetrics {
  total: number;
  needWork: number;
  excellent: number;
  avgScore: number;
  loading: boolean;
  error: string | null;
}

interface InterviewDetailState {
  data: any | null;
  stepsData: any | null;
  hasSteps: boolean;
  loading: boolean;
  error: string | null;
}

interface InterviewState {
  data: SkillInterviewAssessment[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  rowsPerPage: number;
  currentTab: string;
  technicalAssessments: SkillTypeAssessments;
  softAssessments: SkillTypeAssessments;
  report: InterviewReportState;
  companyInterviews: CompanyInterviewsState;
  companyMetrics: CompanyInterviewMetrics;
  interviewDetail: InterviewDetailState;
}

const initialState: InterviewState = {
  data: [],
  loading: false,
  error: null,
  total: 0,
  page: 0,
  rowsPerPage: 3,
  currentTab: 'post_interview',
  technicalAssessments: { data: [], loading: false, error: null, total: 0 },
  softAssessments: { data: [], loading: false, error: null, total: 0 },
  report: { data: null, loading: false, error: null },
  companyInterviews: { items: [], total: 0, totalPages: 1, loading: false, error: null },
  companyMetrics: { total: 0, needWork: 0, excellent: 0, avgScore: 0, loading: false, error: null },
  interviewDetail: { data: null, stepsData: null, hasSteps: false, loading: false, error: null },
};

/**
 * Save skill interview assessment
 */
export const saveInterviewAssessment = createAsyncThunk<
  any,
  { skill: string; proficiency: string; interviewData: any; skillType?: string },
  { rejectValue: string }
>(
  'interview/saveAssessment',
  async (params, { rejectWithValue }) => {
    try {
      return await interviewService.saveAssessment(params);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error saving interview assessment');
    }
  }
);

/**
 * Fetch skill interview assessments
 */
export const fetchInterviewAssessments = createAsyncThunk<
  { results: SkillInterviewAssessment[]; total: number },
  { type: string; page: number; limit: number; candidateId: string },
  { rejectValue: string }
>(
  'interview/fetchAssessments',
  async (params, { rejectWithValue }) => {
    try {
      return await interviewService.fetchAssessments(params);
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred while fetching data');
    }
  }
);

/**
 * Fetch skill interview assessments by skill type (technical or soft)
 */
export const fetchSkillAssessmentsByType = createAsyncThunk<
  { results: SkillInterviewAssessment[]; total: number; skillType: string },
  { skillType: 'technical' | 'soft'; limit?: number },
  { rejectValue: string }
>(
  'interview/fetchSkillAssessmentsByType',
  async (params, { rejectWithValue }) => {
    try {
      return await interviewService.fetchSkillAssessmentsByType(params);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error fetching skill assessments');
    }
  }
);

/**
 * Fetch a single interview report by ID
 */
export const fetchInterviewReport = createAsyncThunk<
  any,
  string,
  { rejectValue: string }
>(
  'interview/fetchReport',
  async (id, { rejectWithValue }) => {
    try {
      return await interviewService.fetchReport(id);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error fetching data');
    }
  }
);

/**
 * Fetch interview details by ID (interview-details endpoint)
 */
export const fetchInterviewDetailsById = createAsyncThunk<
  any,
  string,
  { rejectValue: string }
>(
  'interview/fetchDetailsById',
  async (interviewId, { rejectWithValue }) => {
    try {
      return await interviewService.fetchDetailsById(interviewId);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error fetching interview details');
    }
  }
);

/**
 * Fetch company interview metrics
 */
export const fetchCompanyInterviewMetrics = createAsyncThunk<
  { total: number; needWork: number; excellent: number; avgScore: number },
  void,
  { rejectValue: string }
>(
  'interview/fetchCompanyInterviewMetrics',
  async (_, { rejectWithValue }) => {
    try {
      return await interviewService.fetchCompanyInterviewMetrics();
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error fetching interview metrics');
    }
  }
);

/**
 * Check if candidate already completed an assessment for a given post
 */
export const checkPostInterviewAssessment = createAsyncThunk<
  { exists: boolean; isCompanyBlocked?: boolean; isArchived?: boolean; underThreshold?: boolean; thresholdScore?: number; matchScore?: number },
  string,
  { rejectValue: string }
>(
  'interview/checkPostAssessment',
  async (postId, { rejectWithValue }) => {
    try {
      return await interviewService.checkPostAssessment(postId);
    } catch (error: any) {
      const msg: string = error?.response?.data?.message || error.message || '';
      if (msg.toLowerCase().includes('company')) {
        return { exists: false, isCompanyBlocked: true };
      }
      if (msg.toLowerCase().includes('archived')) {
        return { exists: false, isArchived: true };
      }
      return rejectWithValue(msg || 'Error checking assessment');
    }
  }
);

/**
 * Fetch company post-interview assessments
 */
export const fetchCompanyInterviews = createAsyncThunk<
  { items: any[]; total: number; totalPages: number },
  { search?: string; page?: number; limit?: number },
  { rejectValue: string }
>(
  'interview/fetchCompanyInterviews',
  async (params, { rejectWithValue }) => {
    try {
      return await interviewService.fetchCompanyInterviews(params);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error fetching company interviews');
    }
  }
);

/**
 * Fetch a single post-interview assessment by ID
 */
export const fetchInterviewById = createAsyncThunk<
  any,
  string,
  { rejectValue: string }
>(
  'interview/fetchInterviewById',
  async (id, { rejectWithValue }) => {
    try {
      return await interviewService.fetchInterviewById(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Error fetching interview');
    }
  }
);

const interviewSlice = createSlice({
  name: 'interview',
  initialState,
  reducers: {
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setRowsPerPage: (state, action: PayloadAction<number>) => {
      state.rowsPerPage = action.payload;
      state.page = 0; // Reset to first page when changing rows per page
    },
    clearError: (state) => {
      state.error = null;
    },
    clearReport: (state) => {
      state.report = { data: null, loading: false, error: null };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInterviewAssessments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInterviewAssessments.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.results;
        state.total = action.payload.total;
      })
      .addCase(fetchInterviewAssessments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'An error occurred';
      })
      // fetchSkillAssessmentsByType
      .addCase(fetchSkillAssessmentsByType.pending, (state, action) => {
        const skillType = action.meta.arg.skillType;
        const target = skillType === 'technical' ? 'technicalAssessments' : 'softAssessments';
        state[target].loading = true;
        state[target].error = null;
      })
      .addCase(fetchSkillAssessmentsByType.fulfilled, (state, action) => {
        const target = action.payload.skillType === 'technical' ? 'technicalAssessments' : 'softAssessments';
        state[target].loading = false;
        state[target].data = action.payload.results;
        state[target].total = action.payload.total;
      })
      .addCase(fetchSkillAssessmentsByType.rejected, (state, action) => {
        const skillType = action.meta.arg.skillType;
        const target = skillType === 'technical' ? 'technicalAssessments' : 'softAssessments';
        state[target].loading = false;
        state[target].error = action.payload || 'An error occurred';
      })
      // ---- INTERVIEW REPORT ----
      .addCase(fetchInterviewReport.pending, (state) => {
        state.report.loading = true;
        state.report.error = null;
      })
      .addCase(fetchInterviewReport.fulfilled, (state, action) => {
        state.report.loading = false;
        state.report.data = action.payload;
      })
      .addCase(fetchInterviewReport.rejected, (state, action) => {
        state.report.loading = false;
        state.report.error = action.payload || 'An error occurred';
      })
      // ---- COMPANY INTERVIEWS ----
      .addCase(fetchCompanyInterviews.pending, (state) => {
        state.companyInterviews.loading = true;
        state.companyInterviews.error = null;
      })
      .addCase(fetchCompanyInterviews.fulfilled, (state, action) => {
        state.companyInterviews.loading = false;
        state.companyInterviews.items = action.payload.items;
        state.companyInterviews.total = action.payload.total;
        state.companyInterviews.totalPages = action.payload.totalPages ?? 1;
      })
      .addCase(fetchCompanyInterviews.rejected, (state, action) => {
        state.companyInterviews.loading = false;
        state.companyInterviews.error = (action.payload as string) || 'An error occurred';
      })
      // ---- COMPANY METRICS ----
      .addCase(fetchCompanyInterviewMetrics.pending, (state) => {
        state.companyMetrics.loading = true;
        state.companyMetrics.error = null;
      })
      .addCase(fetchCompanyInterviewMetrics.fulfilled, (state, action) => {
        state.companyMetrics.loading = false;
        state.companyMetrics.total    = action.payload.total;
        state.companyMetrics.needWork = action.payload.needWork;
        state.companyMetrics.excellent = action.payload.excellent;
        state.companyMetrics.avgScore  = action.payload.avgScore;
      })
      .addCase(fetchCompanyInterviewMetrics.rejected, (state, action) => {
        state.companyMetrics.loading = false;
        state.companyMetrics.error = action.payload || 'An error occurred';
      })
      // ---- INTERVIEW DETAIL ----
      .addCase(fetchInterviewById.pending, (state) => {
        state.interviewDetail.loading = true;
        state.interviewDetail.error = null;
        state.interviewDetail.data = null;
        state.interviewDetail.stepsData = null;
        state.interviewDetail.hasSteps = false;
      })
      .addCase(fetchInterviewById.fulfilled, (state, action) => {
        state.interviewDetail.loading = false;
        state.interviewDetail.data = action.payload.assessment;
        state.interviewDetail.stepsData = action.payload.stepsData;
        state.interviewDetail.hasSteps = action.payload.hasSteps;
      })
      .addCase(fetchInterviewById.rejected, (state, action) => {
        state.interviewDetail.loading = false;
        state.interviewDetail.error = action.payload || 'An error occurred';
      });
  },
});

export const {
  setPage,
  setRowsPerPage,
  clearError,
  clearReport,
} = interviewSlice.actions;

export const selectInterview = (state: RootState) => state.interview;
export const selectTechnicalAssessments = (state: RootState) => state.interview.technicalAssessments;
export const selectSoftAssessments = (state: RootState) => state.interview.softAssessments;
export const selectInterviewReport = (state: RootState) => state.interview.report.data;
export const selectInterviewReportLoading = (state: RootState) => state.interview.report.loading;
export const selectInterviewReportError = (state: RootState) => state.interview.report.error;
export const selectCompanyInterviews = (state: RootState) => state.interview.companyInterviews.items;
export const selectCompanyInterviewsLoading = (state: RootState) => state.interview.companyInterviews.loading;
export const selectCompanyInterviewsTotal = (state: RootState) => state.interview.companyInterviews.total;
export const selectCompanyInterviewsTotalPages = (state: RootState) => state.interview.companyInterviews.totalPages;
export const selectCompanyMetrics = (state: RootState) => state.interview.companyMetrics;

export default interviewSlice.reducer;
