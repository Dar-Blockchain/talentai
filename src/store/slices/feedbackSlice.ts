import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

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

const isMongoObjectId = (id?: string | null): boolean =>
  !!id && /^[a-f\d]{24}$/i.test(id);

export const submitFeedback = createAsyncThunk(
  'feedback/submit',
  async (
    payload: { rating: number; comment: string; interviewId?: string },
    { rejectWithValue }
  ) => {
    try {
      const token = localStorage.getItem('api_token') || Cookies.get('api_token');
      const body: { rating: number; comment: string; interviewId?: string } = {
        rating: payload.rating,
        comment: payload.comment,
      };
      if (isMongoObjectId(payload.interviewId)) {
        body.interviewId = payload.interviewId;
      }
      const response = await axios.post(
        `${API_BASE_URL}feedback/addFeedback`,
        body,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
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
