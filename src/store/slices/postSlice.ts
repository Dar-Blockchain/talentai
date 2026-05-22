import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { postService } from "@/modules/posts/api/postService";

// ── Types ─────────────────────────────────────────────────────────────────────

interface PaginationState {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface PostMetrics {
  total: number;
  active: number;
  draft: number;
  closed: number;
}

interface PostState {
  steps: any[];
  loading: boolean;
  error: string | null;
  postStepsLoading: boolean;
  postStepsError: string | null;
  myPosts: any[];
  myPostsLoading: boolean;
  myPostsError: string | null;
  myPostsPagination: PaginationState;
  deletePostLoading: boolean;
  deletePostError: string | null;
  currentJob: any | null;
  currentJobLoading: boolean;
  currentJobError: string | null;
  recommended: {
    items: any[];
    loading: boolean;
    error: string | null;
    pagination: PaginationState;
  };
  savePost: {
    loading: boolean;
    error: string | null;
    savedPost: any;
  };
  recruitmentFlow: {
    nodes: any[];
    edges: any[];
  };
  updatePostStatus: {
    loading: boolean;
    error: string | null;
  };
  candidateAssessments: {
    items: any[];
    loading: boolean;
    error: string | null;
    pagination: PaginationState;
  };
  companyAssessments: {
    items: any[];
    loading: boolean;
    error: string | null;
    pagination: PaginationState;
  };
  assessmentDetails: {
    assessment: any | null;
    stepsData: any | null;
    loading: boolean;
    error: string | null;
  };
  postMetrics: {
    data: PostMetrics | null;
    loading: boolean;
    error: string | null;
  };
}

// ── Initial state ─────────────────────────────────────────────────────────────

const defaultPagination: PaginationState = {
  total: 0, page: 1, limit: 10, totalPages: 0, hasNextPage: false, hasPrevPage: false,
};

const initialState: PostState = {
  steps: [],
  loading: false,
  error: null,
  postStepsLoading: false,
  postStepsError: null,
  myPosts: [],
  myPostsLoading: false,
  myPostsError: null,
  myPostsPagination: { ...defaultPagination },
  deletePostLoading: false,
  deletePostError: null,
  currentJob: null,
  currentJobLoading: false,
  currentJobError: null,
  recommended: { items: [], loading: false, error: null, pagination: { ...defaultPagination, limit: 3 } },
  savePost: { loading: false, error: null, savedPost: null },
  recruitmentFlow: { nodes: [], edges: [] },
  updatePostStatus: { loading: false, error: null },
  candidateAssessments: { items: [], loading: false, error: null, pagination: { ...defaultPagination } },
  companyAssessments: { items: [], loading: false, error: null, pagination: { ...defaultPagination } },
  assessmentDetails: { assessment: null, stepsData: null, loading: false, error: null },
  postMetrics: { data: null, loading: false, error: null },
};

// ── Thunks ────────────────────────────────────────────────────────────────────

export const savePost = createAsyncThunk(
  "post/savePost",
  async (jobData: any, { rejectWithValue }) => {
    try { return await postService.savePost(jobData); }
    catch (err: any) { return rejectWithValue(err.response?.data?.message || err.message || "Error saving job"); }
  }
);

export const updatePost = createAsyncThunk(
  "post/updatePost",
  async ({ jobId, jobData }: { jobId: string | number; jobData: any }, { rejectWithValue }) => {
    try { return await postService.updatePost(jobId, jobData); }
    catch (err: any) { return rejectWithValue(err.response?.data?.message || err.message || "Error updating job"); }
  }
);

export const fetchRecommendedPosts = createAsyncThunk(
  "post/fetchRecommendedPosts",
  async (params: { page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try { return await postService.fetchRecommendedPosts(params); }
    catch (error: any) { return rejectWithValue(error.response?.data?.message || error.message || "An error occurred while fetching recommended posts"); }
  }
);

export const postRecruitmentSteps = createAsyncThunk(
  "post/postRecruitmentSteps",
  async ({ postId, steps }: { postId: string; steps: any[] }, { rejectWithValue }) => {
    try { return await postService.postRecruitmentSteps(postId, steps); }
    catch (error: any) { return rejectWithValue(error.response?.data?.message || error.message || "An error occurred while posting recruitment steps"); }
  }
);

export const fetchMyPosts = createAsyncThunk(
  "post/fetchMyPosts",
  async (params: { page?: number; limit?: number; search?: string; sort?: string; status?: string; creationType?: string } = {}, { rejectWithValue }) => {
    try { return await postService.fetchMyPosts(params); }
    catch (error: any) { return rejectWithValue(error.response?.data?.message || error.message || "An error occurred while fetching posts"); }
  }
);

export const deletePost = createAsyncThunk(
  "post/deletePost",
  async (jobId: string, { rejectWithValue }) => {
    try { return await postService.deletePost(jobId); }
    catch (error: any) { return rejectWithValue(error.response?.data?.message || error.message || "An error occurred while deleting post"); }
  }
);

export const fetchJobById = createAsyncThunk(
  "post/fetchJobById",
  async (jobId: string, { rejectWithValue }) => {
    try { return await postService.fetchJobById(jobId); }
    catch (error: any) { return rejectWithValue(error.response?.data?.message || error.message || "An error occurred while fetching the job"); }
  }
);

export const updatePostStatus = createAsyncThunk(
  "post/updatePostStatus",
  async ({ postId, status }: { postId: string; status: string }, { rejectWithValue }) => {
    try { return await postService.updatePostStatus(postId, status); }
    catch (error: any) { return rejectWithValue(error.response?.data?.message || error.message || "Error updating post status"); }
  }
);

export const savePostInterviewAssessment = createAsyncThunk(
  "post/savePostInterviewAssessment",
  async ({ postId, interviewData }: { postId: string; interviewData: any }, { rejectWithValue }) => {
    try { return await postService.savePostInterviewAssessment(postId, interviewData); }
    catch (error: any) { return rejectWithValue(error.response?.data?.message || error.message || "Error saving assessment"); }
  }
);

export const fetchCandidateAssessments = createAsyncThunk(
  "post/fetchCandidateAssessments",
  async (params: { page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try { return await postService.fetchCandidateAssessments(params); }
    catch (error: any) { return rejectWithValue(error.response?.data?.message || error.message || "Error fetching candidate assessments"); }
  }
);

export const fetchCompanyAssessments = createAsyncThunk(
  "post/fetchCompanyAssessments",
  async (params: { page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try { return await postService.fetchCompanyAssessments(params); }
    catch (error: any) { return rejectWithValue(error.response?.data?.message || error.message || "Error fetching company assessments"); }
  }
);

export const fetchAssessmentDetails = createAsyncThunk<
  { assessment: any; stepsData: any | null },
  string
>(
  "post/fetchAssessmentDetails",
  async (id: string, { rejectWithValue }) => {
    try { return await postService.fetchAssessmentDetails(id); }
    catch (error: any) { return rejectWithValue(error.response?.data?.message || error.message || "Error fetching assessment details"); }
  }
);

export const fetchPostMetrics = createAsyncThunk(
  "post/fetchPostMetrics",
  async (_, { rejectWithValue }) => {
    try { return await postService.fetchPostMetrics() as PostMetrics; }
    catch (error: any) { return rejectWithValue(error.response?.data?.message || error.message || "Failed to fetch post metrics"); }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const postSlice = createSlice({
  name: "post",
  initialState,
  reducers: {
    resetSavePost: (state) => {
      state.savePost = { loading: false, error: null, savedPost: null };
    },
    clearError: (state) => {
      state.error = null;
      state.postStepsError = null;
      state.currentJobError = null;
      state.recommended.error = null;
    },
    setFlowNodes(state, action) { state.recruitmentFlow.nodes = action.payload; },
    setFlowEdges(state, action) { state.recruitmentFlow.edges = action.payload; },
    resetFlow(state) { state.recruitmentFlow.nodes = []; state.recruitmentFlow.edges = []; },
    clearAssessmentDetails(state) {
      state.assessmentDetails = { assessment: null, stepsData: null, loading: false, error: null };
    },
  },
  extraReducers: (builder) => {
    builder
      // savePost
      .addCase(savePost.pending,   (state) => { state.savePost.loading = true;  state.savePost.error = null; })
      .addCase(savePost.fulfilled, (state, action) => { state.savePost.loading = false; state.savePost.savedPost = action.payload; })
      .addCase(savePost.rejected,  (state, action) => { state.savePost.loading = false; state.savePost.error = action.payload as string; })
      // updatePost
      .addCase(updatePost.pending,   (state) => { state.savePost.loading = true;  state.savePost.error = null; })
      .addCase(updatePost.fulfilled, (state, action) => { state.savePost.loading = false; state.savePost.savedPost = action.payload; })
      .addCase(updatePost.rejected,  (state, action) => { state.savePost.loading = false; state.savePost.error = action.payload as string; })
      // postRecruitmentSteps
      .addCase(postRecruitmentSteps.pending,   (state) => { state.postStepsLoading = true;  state.postStepsError = null; })
      .addCase(postRecruitmentSteps.fulfilled, (state, action) => {
        state.postStepsLoading = false;
        if (action.payload.data) { state.steps = action.payload.data; if (state.currentJob) state.currentJob.PostSteps = action.payload.data; }
      })
      .addCase(postRecruitmentSteps.rejected,  (state, action) => { state.postStepsLoading = false; state.postStepsError = action.payload as string; })
      // fetchMyPosts
      .addCase(fetchMyPosts.pending,   (state) => { state.myPostsLoading = true;  state.myPostsError = null; })
      .addCase(fetchMyPosts.fulfilled, (state, action: PayloadAction<any>) => { state.myPostsLoading = false; state.myPosts = action.payload.posts || []; state.myPostsPagination = action.payload.pagination; })
      .addCase(fetchMyPosts.rejected,  (state, action) => { state.myPostsLoading = false; state.myPostsError = action.payload as string; })
      // deletePost
      .addCase(deletePost.pending,   (state) => { state.deletePostLoading = true;  state.deletePostError = null; })
      .addCase(deletePost.fulfilled, (state, action: PayloadAction<string>) => { state.deletePostLoading = false; state.myPosts = state.myPosts.filter((p: any) => (p._id || p.id) !== action.payload); })
      .addCase(deletePost.rejected,  (state, action) => { state.deletePostLoading = false; state.deletePostError = action.payload as string; })
      // fetchJobById
      .addCase(fetchJobById.pending,   (state) => { state.currentJobLoading = true;  state.currentJobError = null; state.currentJob = null; })
      .addCase(fetchJobById.fulfilled, (state, action: PayloadAction<any>) => { state.currentJobLoading = false; state.currentJob = action.payload; })
      .addCase(fetchJobById.rejected,  (state, action) => { state.currentJobLoading = false; state.currentJobError = action.payload as string; })
      // fetchRecommendedPosts
      .addCase(fetchRecommendedPosts.pending,   (state) => { state.recommended.loading = true;  state.recommended.error = null; })
      .addCase(fetchRecommendedPosts.fulfilled, (state, action) => { state.recommended.loading = false; state.recommended.items = action.payload.data || []; state.recommended.pagination = action.payload.pagination; })
      .addCase(fetchRecommendedPosts.rejected,  (state, action) => { state.recommended.loading = false; state.recommended.error = action.payload as string; })
      // updatePostStatus
      .addCase(updatePostStatus.pending,   (state) => { state.updatePostStatus.loading = true;  state.updatePostStatus.error = null; })
      .addCase(updatePostStatus.fulfilled, (state, action) => { state.updatePostStatus.loading = false; if (state.currentJob) state.currentJob.status = action.payload.data?.status; })
      .addCase(updatePostStatus.rejected,  (state, action) => { state.updatePostStatus.loading = false; state.updatePostStatus.error = action.payload as string; })
      // savePostInterviewAssessment — fire and forget, no state update needed
      .addCase(savePostInterviewAssessment.pending,   () => {})
      .addCase(savePostInterviewAssessment.fulfilled, () => {})
      .addCase(savePostInterviewAssessment.rejected,  () => {})
      // fetchCandidateAssessments
      .addCase(fetchCandidateAssessments.pending,   (state) => { state.candidateAssessments.loading = true;  state.candidateAssessments.error = null; })
      .addCase(fetchCandidateAssessments.fulfilled, (state, action) => { state.candidateAssessments.loading = false; state.candidateAssessments.items = action.payload.items; state.candidateAssessments.pagination = action.payload.pagination; })
      .addCase(fetchCandidateAssessments.rejected,  (state, action) => { state.candidateAssessments.loading = false; state.candidateAssessments.error = action.payload as string; })
      // fetchCompanyAssessments
      .addCase(fetchCompanyAssessments.pending,   (state) => { state.companyAssessments.loading = true;  state.companyAssessments.error = null; })
      .addCase(fetchCompanyAssessments.fulfilled, (state, action) => { state.companyAssessments.loading = false; state.companyAssessments.items = action.payload.items; state.companyAssessments.pagination = action.payload.pagination; })
      .addCase(fetchCompanyAssessments.rejected,  (state, action) => { state.companyAssessments.loading = false; state.companyAssessments.error = action.payload as string; })
      // fetchAssessmentDetails
      .addCase(fetchAssessmentDetails.pending,   (state) => { state.assessmentDetails.loading = true;  state.assessmentDetails.error = null; })
      .addCase(fetchAssessmentDetails.fulfilled, (state, action) => { state.assessmentDetails.loading = false; state.assessmentDetails.assessment = action.payload.assessment; state.assessmentDetails.stepsData = action.payload.stepsData; })
      .addCase(fetchAssessmentDetails.rejected,  (state, action) => { state.assessmentDetails.loading = false; state.assessmentDetails.error = action.payload as string; })
      // fetchPostMetrics
      .addCase(fetchPostMetrics.pending,   (state) => { state.postMetrics.loading = true;  state.postMetrics.error = null; })
      .addCase(fetchPostMetrics.fulfilled, (state, action) => { state.postMetrics.loading = false; state.postMetrics.data = action.payload; })
      .addCase(fetchPostMetrics.rejected,  (state, action) => { state.postMetrics.loading = false; state.postMetrics.error = action.payload as string; });
  },
});

export const { resetSavePost, clearError, setFlowNodes, setFlowEdges, resetFlow, clearAssessmentDetails } = postSlice.actions;

export default postSlice.reducer;

// ── Selectors ─────────────────────────────────────────────────────────────────

export const selectSteps               = (state: { post: PostState }) => state.post.steps;
export const selectPostStepsLoading    = (state: { post: PostState }) => state.post.postStepsLoading;
export const selectPostStepsError      = (state: { post: PostState }) => state.post.postStepsError;

export const selectMyPosts             = (state: { post: PostState }) => state.post.myPosts;
export const selectMyPostsLoading      = (state: { post: PostState }) => state.post.myPostsLoading;
export const selectMyPostsError        = (state: { post: PostState }) => state.post.myPostsError;
export const selectMyPostsPagination   = (state: { post: PostState }) => state.post.myPostsPagination;
export const selectDeletePostLoading   = (state: { post: PostState }) => state.post.deletePostLoading;
export const selectDeletePostError     = (state: { post: PostState }) => state.post.deletePostError;

export const selectCurrentJob          = (state: { post: PostState }) => state.post.currentJob;
export const selectCurrentJobLoading   = (state: { post: PostState }) => state.post.currentJobLoading;
export const selectCurrentJobError     = (state: { post: PostState }) => state.post.currentJobError;
export const selectJobById             = (jobId: string) => (state: { post: PostState }) => state.post.myPosts.find((job: any) => (job._id || job.id) === jobId);

export const selectRecommended         = (state: { post: PostState }) => state.post.recommended;

export const selectCandidateAssessments           = (state: { post: PostState }) => state.post.candidateAssessments.items;
export const selectCandidateAssessmentsLoading    = (state: { post: PostState }) => state.post.candidateAssessments.loading;
export const selectCandidateAssessmentsError      = (state: { post: PostState }) => state.post.candidateAssessments.error;
export const selectCandidateAssessmentsPagination = (state: { post: PostState }) => state.post.candidateAssessments.pagination;

export const selectCompanyAssessments             = (state: { post: PostState }) => state.post.companyAssessments.items;
export const selectCompanyAssessmentsLoading      = (state: { post: PostState }) => state.post.companyAssessments.loading;
export const selectCompanyAssessmentsError        = (state: { post: PostState }) => state.post.companyAssessments.error;
export const selectCompanyAssessmentsPagination   = (state: { post: PostState }) => state.post.companyAssessments.pagination;

export const selectAssessmentDetails              = (state: { post: PostState }) => state.post.assessmentDetails.assessment;
export const selectAssessmentStepsData            = (state: { post: PostState }) => state.post.assessmentDetails.stepsData;
export const selectAssessmentDetailsLoading       = (state: { post: PostState }) => state.post.assessmentDetails.loading;
export const selectAssessmentDetailsError         = (state: { post: PostState }) => state.post.assessmentDetails.error;

export const selectPostMetrics                    = (state: { post: PostState }) => state.post.postMetrics.data;
export const selectPostMetricsLoading             = (state: { post: PostState }) => state.post.postMetrics.loading;
export const selectPostMetricsError               = (state: { post: PostState }) => state.post.postMetrics.error;

export const selectSavePostLoading                = (state: { post: PostState }) => state.post.savePost.loading;
export const selectSavedPostId                    = (state: { post: PostState }) => (state.post.savePost.savedPost?.data?._id as string) ?? null;
