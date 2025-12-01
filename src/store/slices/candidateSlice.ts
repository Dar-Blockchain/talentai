import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from '../store';

export interface UnlockResponse {
  success: boolean;
  message: string;
}

export interface CandidateState {
  loading: boolean;
  error: string | null;
  unlockResult: UnlockResponse | null; 
}

const initialState: CandidateState = {
  loading: false,
  error: null,
  unlockResult: null,
};

export const unlockCandidate = createAsyncThunk<
  UnlockResponse,
  { idCandidate: string; idJob: string; },
  { state: RootState }
>(
  'candidate/unlock',
  async ({ idCandidate, idJob }, { rejectWithValue }) => {
    try {
      const token =
        localStorage.getItem('token') ||
        localStorage.getItem('api_token');

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}unlock-candidate/create`,
        {
          idCandidate,
          idJob,
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
      state.unlockResult = null;
    })
    .addCase(unlockCandidate.fulfilled, (state, action) => {
      state.loading = false;
      state.unlockResult = action.payload;
    })
    .addCase(unlockCandidate.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      state.unlockResult = null;
    });
  },
});


export const { clearCandidateError, resetCandidateState } =
  candidateSlice.actions;

export default candidateSlice.reducer;
