import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

export interface InterviewAssessment {
  _id: string;
  id?: string;
  type: string;
  metadata?: any;
  interviewData?: any;
  skillDetails?: any[];
  post?: any;
  candidateId?: any;
  createdAt?: string;
  updatedAt?: string;
  overallScore?: number;
  [key: string]: any;
}

interface InterviewState {
  data: InterviewAssessment[];
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
 * Fetch interview assessments by type
 */
export const fetchInterviewAssessments = createAsyncThunk<
  { results: InterviewAssessment[]; total: number },
  { type: string; page: number; limit: number; candidateId: string },
  { rejectValue: string }
>(
  'interview/fetchAssessments',
  async ({ type, page, limit, candidateId }, { rejectWithValue }) => {
    console.log('🔄 [InterviewSlice] fetchInterviewAssessments CALLED:', { type, page, limit, candidateId });

    const token = localStorage.getItem('api_token');

    try {
      const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}InterviewAssessment/?page=${page + 1}&limit=${limit}&type=${type}&candidateId=${candidateId}`;

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
