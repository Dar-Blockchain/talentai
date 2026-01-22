import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

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

interface InterviewState {
  data: SkillInterviewAssessment[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  rowsPerPage: number;
  currentTab: string;
}

const initialState: InterviewState = {
  data: [],
  loading: false,
  error: null,
  total: 0,
  page: 0,
  rowsPerPage: 3,
  currentTab: 'post_interview',
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
  async ({ skill, proficiency, interviewData, skillType }, { rejectWithValue }) => {
    const token = localStorage.getItem('api_token');

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}skill-interview-assessments/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ skill, proficiency, interviewData, skillType }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData.message || `Failed to save interview: ${response.status}`);
      }

      const data = await response.json();
      return data;
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
  async ({ type, page, limit, candidateId }, { rejectWithValue }) => {
    console.log('🔄 [InterviewSlice] fetchInterviewAssessments CALLED:', { type, page, limit, candidateId });

    const token = localStorage.getItem('api_token');

    try {
      const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}skill-interview-assessments/my?page=${page + 1}&limit=${limit}&candidateId=${candidateId}`;

      console.log('📡 [InterviewSlice] Making HTTP request to:', url);

      const response = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [InterviewSlice] API Error:', response.status, errorText);
        return rejectWithValue(`Failed to fetch interview details: ${response.status}`);
      }

      const json = await response.json();
      console.log('📦 [InterviewSlice] Raw API Response:', json);

      const results = Array.isArray(json.results)
        ? json.results
        : Array.isArray(json.data)
        ? json.data
        : [];

      const inferredTotal =
        typeof json.total === 'number' && json.total >= 0
          ? json.total
          : typeof json.count === 'number' && json.count >= 0
          ? json.count
          : typeof json.totalCount === 'number' && json.totalCount >= 0
          ? json.totalCount
          : results.length;

      console.log('✅ [InterviewSlice] Data loaded successfully:', results.length, 'items');

      return { results, total: inferredTotal };
    } catch (error: any) {
      console.error('❌ [InterviewSlice] Exception:', error);
      return rejectWithValue(error.message || 'An error occurred while fetching data');
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
    setCurrentTab: (state, action: PayloadAction<string>) => {
      state.currentTab = action.payload;
      state.page = 0; // Reset to first page when changing tab
    },
    clearError: (state) => {
      state.error = null;
    },
    clearInterviewData: (state) => {
      state.data = [];
      state.total = 0;
      state.error = null;
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
      });
  },
});

export const {
  setPage,
  setRowsPerPage,
  setCurrentTab,
  clearError,
  clearInterviewData,
} = interviewSlice.actions;

export const selectInterview = (state: RootState) => state.interview;

export default interviewSlice.reducer;
