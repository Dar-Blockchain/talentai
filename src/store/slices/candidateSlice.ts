import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "../store";
import { broadcastSystemNotification } from "./notificationSlice";

export interface UnlockResponse {
  success: boolean;
  message: string;
}

interface PaginationState {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface CandidateState {
  loading: boolean;
  error: string | null;
  unlockResult: UnlockResponse | null;
  unlockedData: {
    loading: boolean;
    error: string | null;
    candidates: any;
    pagination: PaginationState;
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
    pagination: {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
      hasNextPage: false,
      hasPrevPage: false,
    },
  },
};

export const unlockCandidate = createAsyncThunk<
  UnlockResponse,
  { candidateIds: string[]; idJob: string },
  { state: RootState }
>("candidate/unlock", async ({ candidateIds, idJob }, { rejectWithValue, dispatch }) => {
  try {
    const token =
      localStorage.getItem("token") || localStorage.getItem("api_token");

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}unlock-candidate`,
      { candidateIds, idJob },
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

    // Send notification to unlocked candidates
    try {
      console.log('📢 [Unlock] Sending notification to candidates:', candidateIds);
      await dispatch(broadcastSystemNotification({
        content: "Great news! A company has unlocked your profile and is interested in your qualifications. Check your dashboard for more details! 🎉",
        recipientIds: candidateIds
      })).unwrap();
    } catch (notifError) {
      console.error('❌ [Unlock] Failed to send notification:', notifError);
      // Don't fail the unlock if notification fails
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
  { candidates: any[]; pagination: PaginationState },
  { page?: number; limit?: number; search?: string; sort?: string } | void,
  { state: RootState }
>(
  "candidate/fetchUnlocked",
  async (params, { rejectWithValue }) => {
    try {
      const { page = 1, limit = 10 } = params || {};
      const token =
        localStorage.getItem("token") || localStorage.getItem("api_token");

      // Build query parameters
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),

      });

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}unlock-candidate/?${queryParams}`,
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

      // Handle both paginated and non-paginated responses
      const data = response.data;
      console.log("Fetched unlocked candidates data:", data);

      // If response has pagination data at root level (new format)
      if (data.results && data.total !== undefined) {
        console.log("Paginated unlocked candidates data:", data);
        return {
          candidates: data.results || [],
          pagination: {
            total: data.total || 0,
            page: data.page || 1,
            limit: data.limit || 10,
            totalPages: data.totalPages || 1,
            hasNextPage: data.hasNextPage || false,
            hasPrevPage: data.hasPrevPage || false,
          }
        };
      }

      // If response has nested pagination object (alternative format)
      if (data.results && data.pagination) {
        console.log("Nested pagination unlocked candidates data:", data);
        return {
          candidates: data.results || [],
          pagination: {
            total: data.pagination.total || 0,
            page: data.pagination.page || 1,
            limit: data.pagination.limit || 10,
            totalPages: data.pagination.totalPages || 1,
            hasNextPage: data.pagination.hasNextPage || false,
            hasPrevPage: data.pagination.hasPrevPage || false,
          }
        };
      }

      // If response data is in data.data (old format)
      if (data.data) {
        const candidates = Array.isArray(data.data) ? data.data : [];
        return {
          candidates,
          pagination: {
            total: candidates.length,
            page: 1,
            limit: candidates.length,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false,
          }
        };
      }

      // If response is just an array (backward compatibility)
      const candidates = Array.isArray(data) ? data : [];
      return {
        candidates,
        pagination: {
          total: candidates.length,
          page: 1,
          limit: candidates.length,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        }
      };
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
        pagination: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
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
        state.unlockedData.candidates = action.payload.candidates;
        state.unlockedData.pagination = action.payload.pagination;
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
