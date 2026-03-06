import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

export interface InterviewApplicant {
  _id: string;
  jobId: string;
  firstName: string;
  lastName: string;
  email: string;
  ref: string | null;
  status: 'pending' | 'in_progress' | 'completed';
  interviewSessionId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface InterviewApplicantState {
  current: InterviewApplicant | null;   // the applicant registered in current session
  list: InterviewApplicant[];            // applicants for a job (company view)
  listLoading: boolean;
  listError: string | null;
  registerLoading: boolean;
  registerError: string | null;
}

const initialState: InterviewApplicantState = {
  current: null,
  list: [],
  listLoading: false,
  listError: null,
  registerLoading: false,
  registerError: null,
};

/** Register a new applicant when they open the interview link */
export const registerApplicant = createAsyncThunk<
  InterviewApplicant,
  { jobId: string; firstName: string; lastName: string; email: string; ref?: string },
  { rejectValue: string }
>(
  'interviewApplicant/register',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}interview-applicants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) return rejectWithValue(data.message || 'Registration failed');
      return data.data as InterviewApplicant;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Network error');
    }
  }
);

/** Fetch all applicants for a job (company dashboard) */
export const fetchApplicantsByJob = createAsyncThunk<
  InterviewApplicant[],
  string,
  { rejectValue: string }
>(
  'interviewApplicant/fetchByJob',
  async (jobId, { rejectWithValue }) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}interview-applicants/job/${jobId}`);
      const data = await res.json();
      if (!data.success) return rejectWithValue(data.message || 'Fetch failed');
      return data.data as InterviewApplicant[];
    } catch (err: any) {
      return rejectWithValue(err.message || 'Network error');
    }
  }
);

/** Update applicant status */
export const updateApplicantStatus = createAsyncThunk<
  InterviewApplicant,
  { id: string; status: InterviewApplicant['status']; interviewSessionId?: string },
  { rejectValue: string }
>(
  'interviewApplicant/updateStatus',
  async ({ id, status, interviewSessionId }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}interview-applicants/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, interviewSessionId }),
      });
      const data = await res.json();
      if (!data.success) return rejectWithValue(data.message || 'Update failed');
      return data.data as InterviewApplicant;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Network error');
    }
  }
);

const interviewApplicantSlice = createSlice({
  name: 'interviewApplicant',
  initialState,
  reducers: {
    clearCurrent: (state) => {
      state.current = null;
      state.registerError = null;
    },
    setCurrent: (state, action: PayloadAction<InterviewApplicant>) => {
      state.current = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // register
      .addCase(registerApplicant.pending, (state) => {
        state.registerLoading = true;
        state.registerError = null;
      })
      .addCase(registerApplicant.fulfilled, (state, action) => {
        state.registerLoading = false;
        state.current = action.payload;
      })
      .addCase(registerApplicant.rejected, (state, action) => {
        state.registerLoading = false;
        state.registerError = action.payload || 'Registration failed';
      })
      // fetchByJob
      .addCase(fetchApplicantsByJob.pending, (state) => {
        state.listLoading = true;
        state.listError = null;
      })
      .addCase(fetchApplicantsByJob.fulfilled, (state, action) => {
        state.listLoading = false;
        state.list = action.payload;
      })
      .addCase(fetchApplicantsByJob.rejected, (state, action) => {
        state.listLoading = false;
        state.listError = action.payload || 'Fetch failed';
      })
      // updateStatus — update in list + current if same id
      .addCase(updateApplicantStatus.fulfilled, (state, action) => {
        const updated = action.payload;
        if (state.current?._id === updated._id) state.current = updated;
        const idx = state.list.findIndex(a => a._id === updated._id);
        if (idx !== -1) state.list[idx] = updated;
      });
  },
});

export const { clearCurrent, setCurrent } = interviewApplicantSlice.actions;

export const selectCurrentApplicant = (state: RootState) => state.interviewApplicant.current;
export const selectApplicantList = (state: RootState) => state.interviewApplicant.list;
export const selectApplicantListLoading = (state: RootState) => state.interviewApplicant.listLoading;
export const selectRegisterLoading = (state: RootState) => state.interviewApplicant.registerLoading;

export default interviewApplicantSlice.reducer;
