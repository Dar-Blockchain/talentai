import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { postService } from "../api/postService";
import type { JobDetail } from "../types";

// ── Types ─────────────────────────────────────────────────────────────────────

interface UpdatePostResult {
  success: boolean;
  jobData: JobDetail;
}

interface PostDetailsState {
  steps: unknown[];
  currentJob: JobDetail | null;
  currentJobLoading: boolean;
  currentJobError: string | null;
  savePost: { loading: boolean; error: string | null; savedPost: UpdatePostResult | null };
  assessmentDetails:    { assessment: unknown | null; stepsData: unknown | null; loading: boolean; error: string | null };
}

// ── Initial state ─────────────────────────────────────────────────────────────

const initialState: PostDetailsState = {
  steps: [],
  currentJob: null,
  currentJobLoading: false,
  currentJobError: null,
  savePost: { loading: false, error: null, savedPost: null },
  assessmentDetails:    { assessment: null, stepsData: null, loading: false, error: null },
};

// ── Thunks ────────────────────────────────────────────────────────────────────

interface ApiErrorLike {
  response?: { data?: { message?: string } };
  message?: string;
}

export const fetchJobById = createAsyncThunk(
  "postDetails/fetchJobById",
  async (jobId: string, { rejectWithValue }) => {
    try { return await postService.fetchJobById(jobId); }
    catch (e: unknown) { const err = e as ApiErrorLike; return rejectWithValue(err.response?.data?.message || err.message || "Error fetching job"); }
  }
);

export const updateJobDetails = createAsyncThunk(
  "postDetails/updatePost",
  async ({ jobId, jobData }: { jobId: string | number; jobData: Partial<JobDetail> }, { rejectWithValue }) => {
    try { return await postService.updatePost(jobId, jobData); }
    catch (e: unknown) { const err = e as ApiErrorLike; return rejectWithValue(err.response?.data?.message || err.message || "Error updating post"); }
  }
);

export const fetchAssessmentDetails = createAsyncThunk<{ assessment: unknown; stepsData: unknown | null }, string>(
  "postDetails/fetchAssessmentDetails",
  async (id, { rejectWithValue }) => {
    try { return await postService.fetchAssessmentDetails(id); }
    catch (e: unknown) { const err = e as ApiErrorLike; return rejectWithValue(err.response?.data?.message || err.message || "Error fetching assessment details"); }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const postDetailsSlice = createSlice({
  name: "postDetails",
  initialState,
  reducers: {
    clearDetailsError:     (state) => { state.currentJobError = null; },
    clearAssessmentDetails:(state) => { state.assessmentDetails = { assessment: null, stepsData: null, loading: false, error: null }; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobById.pending,   (state) => { state.currentJobLoading = true;  state.currentJobError = null; state.currentJob = null; })
      .addCase(fetchJobById.fulfilled, (state, action: PayloadAction<JobDetail>) => { state.currentJobLoading = false; state.currentJob = action.payload; })
      .addCase(fetchJobById.rejected,  (state, action) => { state.currentJobLoading = false; state.currentJobError = action.payload as string; })

      .addCase(updateJobDetails.pending,   (state) => { state.savePost.loading = true;  state.savePost.error = null; })
      .addCase(updateJobDetails.fulfilled, (state, action) => { state.savePost.loading = false; state.savePost.savedPost = action.payload; })
      .addCase(updateJobDetails.rejected,  (state, action) => { state.savePost.loading = false; state.savePost.error = action.payload as string; })

      .addCase(fetchAssessmentDetails.pending,   (state) => { state.assessmentDetails.loading = true;  state.assessmentDetails.error = null; })
      .addCase(fetchAssessmentDetails.fulfilled, (state, action) => { state.assessmentDetails.loading = false; state.assessmentDetails.assessment = action.payload.assessment; state.assessmentDetails.stepsData = action.payload.stepsData; })
      .addCase(fetchAssessmentDetails.rejected,  (state, action) => { state.assessmentDetails.loading = false; state.assessmentDetails.error = action.payload as string; });
  },
});

export const { clearDetailsError, clearAssessmentDetails } = postDetailsSlice.actions;
export default postDetailsSlice.reducer;

// ── Selectors ─────────────────────────────────────────────────────────────────

type S = { postDetails: PostDetailsState };

export const selectCurrentJob          = (s: S) => s.postDetails.currentJob;
export const selectCurrentJobLoading   = (s: S) => s.postDetails.currentJobLoading;
export const selectCurrentJobError     = (s: S) => s.postDetails.currentJobError;
export const selectSteps               = (s: S) => s.postDetails.steps;

export const selectAssessmentDetails              = (s: S) => s.postDetails.assessmentDetails.assessment;
export const selectAssessmentStepsData            = (s: S) => s.postDetails.assessmentDetails.stepsData;
export const selectAssessmentDetailsLoading       = (s: S) => s.postDetails.assessmentDetails.loading;
export const selectAssessmentDetailsError         = (s: S) => s.postDetails.assessmentDetails.error;

export const selectSavePostLoading                = (s: S) => s.postDetails.savePost.loading;
export const selectSavedPostId                    = (s: S) => {
  // `savedPost` is `{ success, jobData }` — this selector predates that shape and has
  // never matched it at runtime; kept as-is (always resolves to null) to avoid behavior changes.
  const saved = s.postDetails.savePost.savedPost as unknown as { data?: { _id?: string } } | null;
  return saved?.data?._id ?? null;
};
