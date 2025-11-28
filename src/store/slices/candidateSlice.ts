import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from '../store';

export interface UnlockResponse {
  success: boolean;
  message: string;
  candidateId: string;
  companyId: string;
  amount: number;
}

export interface CandidateState {
  loading: boolean;
  error: string | null;
}

const initialState: CandidateState = {
  loading: false,
  error: null,
};

export const unlockCandidate = createAsyncThunk<
  UnlockResponse,
  { candidateId: string; jobId: string; companyId: string; amount: number },
  { state: RootState }
>(
  'candidate/unlock',
  async ({ candidateId, jobId, companyId, amount }, { rejectWithValue }) => {
    try {
      const token =
        localStorage.getItem('token') ||
        localStorage.getItem('api_token');

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}candidates/unlock`,
        {
          candidateId,
          jobId,
          companyId,
          amount,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.data.success) {
        return rejectWithValue(response.data.message || 'Unlock failed');
      }

      return response.data;
    } catch (error: any) {
      console.error('❌ Unlock candidate failed:', error);

      if (error.response) {
        return rejectWithValue(
          error.response.data?.message || 'Failed to unlock candidate'
        );
      } else if (error.request) {
        return rejectWithValue('Network error: Unable to connect to server');
      } else {
        return rejectWithValue(error.message);
      }
    }
  }
);

const candidateSlice = createSlice({
  name: 'candidate',
  initialState,
  reducers: {
    clearCandidateError: (state) => {
      state.error = null;
    },
    resetCandidateState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(unlockCandidate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(unlockCandidate.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(unlockCandidate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});


export const { clearCandidateError, resetCandidateState } =
  candidateSlice.actions;

export default candidateSlice.reducer;
