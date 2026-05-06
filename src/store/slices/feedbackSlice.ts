import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { feedbackService } from '@/services/feedbackService';

interface FeedbackState {
  submitting: boolean;
  submitted: boolean;
  error: string | null;
}

const initialState: FeedbackState = {
  submitting: false,
  submitted: false,
  error: null,
};

export const submitFeedback = createAsyncThunk(
  'feedback/submit',
  async (
    payload: { rating: number; comment: string; interviewId?: string },
    { rejectWithValue }
  ) => {
    try {
      return await feedbackService.submitFeedback(payload);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to submit feedback'
      );
    }
  }
);

const feedbackSlice = createSlice({
  name: 'feedback',
  initialState,
  reducers: {
    resetFeedback: (state) => {
      state.submitting = false;
      state.submitted = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitFeedback.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(submitFeedback.fulfilled, (state) => {
        state.submitting = false;
        state.submitted = true;
      })
      .addCase(submitFeedback.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetFeedback } = feedbackSlice.actions;
export default feedbackSlice.reducer;
