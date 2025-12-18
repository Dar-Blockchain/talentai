import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface JobDetailsState {
  jobDetails: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: JobDetailsState = {
  jobDetails: null,
  loading: false,
  error: null,
};

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
      });
  },
});

export const { clearJobDetails, clearError } = jobDetailsSlice.actions;
export default jobDetailsSlice.reducer;
