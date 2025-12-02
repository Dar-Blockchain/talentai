import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "../store";

export interface UnlockResponse {
  success: boolean;
  message: string;
}

export interface CandidateState {
  loading: boolean;
  error: string | null;
  unlockResult: UnlockResponse | null;
  unlockedData: {
    loading: boolean;
    error: string | null;
    candidates: any;
  };
}

const initialState: CandidateState = {
  loading: false,
  error: null,
  unlockResult: null,

  unlockedData: {
    loading: false,
    error: null,
    candidates: [],
  },
};

export const unlockCandidate = createAsyncThunk<
  UnlockResponse,
  { idCandidate: string; idJob: string },
  { state: RootState }
>("candidate/unlock", async ({ idCandidate, idJob }, { rejectWithValue }) => {
  try {
    const token =
      localStorage.getItem("token") || localStorage.getItem("api_token");

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}unlock-candidate/create`,
      { idCandidate, idJob },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.data.success) {
      return rejectWithValue(response.data.message || "Unlock failed");
    }

    return response.data;
  } catch (error: any) {
    if (error.response) {
      return rejectWithValue(error.response.data?.message);
    } else if (error.request) {
      return rejectWithValue("Network error: Unable to connect to server");
    } else {
      return rejectWithValue(error.message);
    }
  }
});

export const fetchUnlockedCandidates = createAsyncThunk<
  any[],
  void,
  { state: RootState }
>(
  "candidate/fetchUnlocked",
  async (_, { rejectWithValue }) => {
    try {
      const token =
        localStorage.getItem("token") || localStorage.getItem("api_token");

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}unlock-candidate/unlocked`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.data.success) {
        return rejectWithValue(
          response.data.message || "Failed to load list"
        );
      }

      return response.data.data;
    } catch (error: any) {
      if (error.response) {
        return rejectWithValue(error.response.data?.message);
      } else if (error.request) {
        return rejectWithValue("Network error: Unable to connect to server");
      } else {
        return rejectWithValue(error.message);
      }
    }
  }
);

const candidateSlice = createSlice({
  name: "candidate",
  initialState,
  reducers: {
    clearCandidateError: (state) => {
      state.error = null;
    },
    // Reset ONLY unlockCandidate related state
    resetCandidateState: (state) => {
      state.loading = false;
      state.error = null;
      state.unlockResult = null;
    },

    // Reset ONLY the unlockedData state
    resetUnlockedData: (state) => {
      state.unlockedData = {
        loading: false,
        error: null,
        candidates: [],
      };
    },
  },
  extraReducers: (builder) => {
    /* -------------------------
       Unlock Candidate
    ------------------------- */
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

    /* -------------------------
       Fetch Unlocked Candidates
    ------------------------- */
    builder
      .addCase(fetchUnlockedCandidates.pending, (state) => {
        state.unlockedData.loading = true;
        state.unlockedData.error = null;
      })
      .addCase(fetchUnlockedCandidates.fulfilled, (state, action) => {
        state.unlockedData.loading = false;
        state.unlockedData.candidates = action.payload;
      })
      .addCase(fetchUnlockedCandidates.rejected, (state, action) => {
        state.unlockedData.loading = false;
        state.unlockedData.error = action.payload as string;
      });
  },
});

/* -------------------------------------------------------------
   Exports
------------------------------------------------------------- */

export const { clearCandidateError, resetCandidateState, resetUnlockedData } =
  candidateSlice.actions;

export default candidateSlice.reducer;
