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
  candidateAssessments: { items: any[]; loading: boolean; error: string | null; pagination: PaginationState };
  companyAssessments:   { items: any[]; loading: boolean; error: string | null; pagination: PaginationState };
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
  candidateAssessments: { items: [], loading: false, error: null, pagination: { ...defaultPagination } },
  companyAssessments:   { items: [], loading: false, error: null, pagination: { ...defaultPagination } },
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

export const postRecruitmentSteps = createAsyncThunk(
  "postDetails/postRecruitmentSteps",
  async ({ postId, steps }: { postId: string; steps: any[] }, { rejectWithValue }) => {
    try { return await postService.postRecruitmentSteps(postId, steps); }
    catch (err: any) { return rejectWithValue(err.response?.data?.message || err.message || "Error posting recruitment steps"); }
  }
);

export const savePostInterviewAssessment = createAsyncThunk(
  "postDetails/savePostInterviewAssessment",
  async ({ postId, interviewData }: { postId: string; interviewData: any }, { rejectWithValue }) => {
    try { return await postService.savePostInterviewAssessment(postId, interviewData); }
    catch (err: any) { return rejectWithValue(err.response?.data?.message || err.message || "Error saving assessment"); }
  }
);

export const fetchCandidateAssessments = createAsyncThunk(
  "postDetails/fetchCandidateAssessments",
  async (params: { page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try { return await postService.fetchCandidateAssessments(params); }
    catch (err: any) { return rejectWithValue(err.response?.data?.message || err.message || "Error fetching candidate assessments"); }
  }
);

export const fetchCompanyAssessments = createAsyncThunk(
  "postDetails/fetchCompanyAssessments",
  async (params: { page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try { return await postService.fetchCompanyAssessments(params); }
    catch (err: any) { return rejectWithValue(err.response?.data?.message || err.message || "Error fetching company assessments"); }
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

      .addCase(postRecruitmentSteps.pending,   (state) => { state.postStepsLoading = true;  state.postStepsError = null; })
      .addCase(postRecruitmentSteps.fulfilled, (state, action) => {
        state.postStepsLoading = false;
        if (action.payload.data) { state.steps = action.payload.data; if (state.currentJob) state.currentJob.PostSteps = action.payload.data; }
      })
      .addCase(postRecruitmentSteps.rejected,  (state, action) => { state.postStepsLoading = false; state.postStepsError = action.payload as string; })

      .addCase(savePostInterviewAssessment.pending,   () => {})
      .addCase(savePostInterviewAssessment.fulfilled, () => {})
      .addCase(savePostInterviewAssessment.rejected,  () => {})

      .addCase(fetchCandidateAssessments.pending,   (state) => { state.candidateAssessments.loading = true;  state.candidateAssessments.error = null; })
      .addCase(fetchCandidateAssessments.fulfilled, (state, action) => { state.candidateAssessments.loading = false; state.candidateAssessments.items = action.payload.items; state.candidateAssessments.pagination = action.payload.pagination; })
      .addCase(fetchCandidateAssessments.rejected,  (state, action) => { state.candidateAssessments.loading = false; state.candidateAssessments.error = action.payload as string; })

      .addCase(fetchCompanyAssessments.pending,   (state) => { state.companyAssessments.loading = true;  state.companyAssessments.error = null; })
      .addCase(fetchCompanyAssessments.fulfilled, (state, action) => { state.companyAssessments.loading = false; state.companyAssessments.items = action.payload.items; state.companyAssessments.pagination = action.payload.pagination; })
      .addCase(fetchCompanyAssessments.rejected,  (state, action) => { state.companyAssessments.loading = false; state.companyAssessments.error = action.payload as string; })

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

export const selectCandidateAssessments           = (s: S) => s.postDetails.candidateAssessments.items;
export const selectCandidateAssessmentsLoading    = (s: S) => s.postDetails.candidateAssessments.loading;
export const selectCandidateAssessmentsPagination = (s: S) => s.postDetails.candidateAssessments.pagination;

export const selectCompanyAssessments             = (s: S) => s.postDetails.companyAssessments.items;
export const selectCompanyAssessmentsLoading      = (s: S) => s.postDetails.companyAssessments.loading;
export const selectCompanyAssessmentsPagination   = (s: S) => s.postDetails.companyAssessments.pagination;

export const selectAssessmentDetails              = (s: S) => s.postDetails.assessmentDetails.assessment;
export const selectAssessmentStepsData            = (s: S) => s.postDetails.assessmentDetails.stepsData;
export const selectAssessmentDetailsLoading       = (s: S) => s.postDetails.assessmentDetails.loading;
export const selectAssessmentDetailsError         = (s: S) => s.postDetails.assessmentDetails.error;

export const selectSavePostLoading                = (s: S) => s.postDetails.savePost.loading;
export const selectSavedPostId                    = (s: S) => (s.postDetails.savePost.savedPost?.data?._id as string) ?? null;
