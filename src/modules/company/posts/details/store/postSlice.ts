import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { postService } from "../api/postService";

// ── Types ─────────────────────────────────────────────────────────────────────

interface PaginationState {
  total: number; page: number; limit: number;
  totalPages: number; hasNextPage: boolean; hasPrevPage: boolean;
}

interface PostDetailsState {
  steps: any[];
  postStepsLoading: boolean;
  postStepsError: string | null;
  currentJob: any | null;
  currentJobLoading: boolean;
  currentJobError: string | null;
  recruitmentFlow: { nodes: any[]; edges: any[] };
  savePost: { loading: boolean; error: string | null; savedPost: any };
  assessmentDetails:    { assessment: any | null; stepsData: any | null; loading: boolean; error: string | null };
}

// ── Initial state ─────────────────────────────────────────────────────────────

const defaultPagination: PaginationState = {
  total: 0, page: 1, limit: 10, totalPages: 0, hasNextPage: false, hasPrevPage: false,
};

const initialState: PostDetailsState = {
  steps: [],
  postStepsLoading: false,
  postStepsError: null,
  currentJob: null,
  currentJobLoading: false,
  currentJobError: null,
  recruitmentFlow: { nodes: [], edges: [] },
  savePost: { loading: false, error: null, savedPost: null },
  assessmentDetails:    { assessment: null, stepsData: null, loading: false, error: null },
};

// ── Thunks ────────────────────────────────────────────────────────────────────

export const fetchJobById = createAsyncThunk(
  "postDetails/fetchJobById",
  async (jobId: string, { rejectWithValue }) => {
    try { return await postService.fetchJobById(jobId); }
    catch (err: any) { return rejectWithValue(err.response?.data?.message || err.message || "Error fetching job"); }
  }
);

export const updateJobDetails = createAsyncThunk(
  "postDetails/updatePost",
  async ({ jobId, jobData }: { jobId: string | number; jobData: any }, { rejectWithValue }) => {
    try { return await postService.updatePost(jobId, jobData); }
    catch (err: any) { return rejectWithValue(err.response?.data?.message || err.message || "Error updating post"); }
  }
);

export const fetchAssessmentDetails = createAsyncThunk<{ assessment: any; stepsData: any | null }, string>(
  "postDetails/fetchAssessmentDetails",
  async (id, { rejectWithValue }) => {
    try { return await postService.fetchAssessmentDetails(id); }
    catch (err: any) { return rejectWithValue(err.response?.data?.message || err.message || "Error fetching assessment details"); }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const postDetailsSlice = createSlice({
  name: "postDetails",
  initialState,
  reducers: {
    clearDetailsError:     (state) => { state.currentJobError = null; state.postStepsError = null; },
    setFlowNodes:          (state, action) => { state.recruitmentFlow.nodes = action.payload; },
    setFlowEdges:          (state, action) => { state.recruitmentFlow.edges = action.payload; },
    resetFlow:             (state) => { state.recruitmentFlow.nodes = []; state.recruitmentFlow.edges = []; },
    clearAssessmentDetails:(state) => { state.assessmentDetails = { assessment: null, stepsData: null, loading: false, error: null }; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobById.pending,   (state) => { state.currentJobLoading = true;  state.currentJobError = null; state.currentJob = null; })
      .addCase(fetchJobById.fulfilled, (state, action: PayloadAction<any>) => { state.currentJobLoading = false; state.currentJob = action.payload; })
      .addCase(fetchJobById.rejected,  (state, action) => { state.currentJobLoading = false; state.currentJobError = action.payload as string; })

      .addCase(updateJobDetails.pending,   (state) => { state.savePost.loading = true;  state.savePost.error = null; })
      .addCase(updateJobDetails.fulfilled, (state, action) => { state.savePost.loading = false; state.savePost.savedPost = action.payload; })
      .addCase(updateJobDetails.rejected,  (state, action) => { state.savePost.loading = false; state.savePost.error = action.payload as string; })

      .addCase(fetchAssessmentDetails.pending,   (state) => { state.assessmentDetails.loading = true;  state.assessmentDetails.error = null; })
      .addCase(fetchAssessmentDetails.fulfilled, (state, action) => { state.assessmentDetails.loading = false; state.assessmentDetails.assessment = action.payload.assessment; state.assessmentDetails.stepsData = action.payload.stepsData; })
      .addCase(fetchAssessmentDetails.rejected,  (state, action) => { state.assessmentDetails.loading = false; state.assessmentDetails.error = action.payload as string; });
  },
});

export const { clearDetailsError, setFlowNodes, setFlowEdges, resetFlow, clearAssessmentDetails } = postDetailsSlice.actions;
export default postDetailsSlice.reducer;

// ── Selectors ─────────────────────────────────────────────────────────────────

type S = { postDetails: PostDetailsState };

export const selectCurrentJob          = (s: S) => s.postDetails.currentJob;
export const selectCurrentJobLoading   = (s: S) => s.postDetails.currentJobLoading;
export const selectCurrentJobError     = (s: S) => s.postDetails.currentJobError;
export const selectSteps               = (s: S) => s.postDetails.steps;
export const selectRecruitmentFlow     = (s: S) => s.postDetails.recruitmentFlow;

export const selectAssessmentDetails              = (s: S) => s.postDetails.assessmentDetails.assessment;
export const selectAssessmentStepsData            = (s: S) => s.postDetails.assessmentDetails.stepsData;
export const selectAssessmentDetailsLoading       = (s: S) => s.postDetails.assessmentDetails.loading;
export const selectAssessmentDetailsError         = (s: S) => s.postDetails.assessmentDetails.error;

export const selectSavePostLoading                = (s: S) => s.postDetails.savePost.loading;
export const selectSavedPostId                    = (s: S) => (s.postDetails.savePost.savedPost?.data?._id as string) ?? null;
