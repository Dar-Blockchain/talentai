import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "@/utils/axiosInstance";
// import { broadcastSystemNotification } from "./notificationSlice";

interface RecruitmentFlowState {
  nodes: any[];
  edges: any[];
}

interface SavePostState {
  loading: boolean;
  error: string | null;
  savedPost: any;
}

interface RecommendedState {
  items: any[];
  loading: boolean;
  error: string | null;
  pagination: PaginationState;
}

interface UpdatePostStatusState {
  loading: boolean;
  error: string | null;
}
interface PaginationState {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface CandidateAssessmentsState {
  items: any[];
  loading: boolean;
  error: string | null;
  pagination: PaginationState;
}

interface CompanyAssessmentsState {
  items: any[];
  loading: boolean;
  error: string | null;
  pagination: PaginationState;
}

interface AssessmentDetailsState {
  assessment: any | null;
  stepsData: any | null;
  loading: boolean;
  error: string | null;
}

interface PostMetrics {
  total: number;
  active: number;
  draft: number;
  closed: number;
}

interface PostMetricsState {
  data: PostMetrics | null;
  loading: boolean;
  error: string | null;
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
  recommended: RecommendedState;
  savePost: SavePostState;
  recruitmentFlow: RecruitmentFlowState;
  updatePostStatus: UpdatePostStatusState;
  candidateAssessments: CandidateAssessmentsState;
  companyAssessments: CompanyAssessmentsState;
  assessmentDetails: AssessmentDetailsState;
  postMetrics: PostMetricsState;
}

// Initial state
const initialState: PostState = {
  steps: [],
  loading: false,
  error: null,
  postStepsLoading: false,
  postStepsError: null,
  myPosts: [],
  myPostsLoading: false,
  myPostsError: null,
  myPostsPagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  },
  deletePostLoading: false,
  deletePostError: null,
  currentJob: null,
  currentJobLoading: false,
  currentJobError: null,
  recommended: {
    items: [],
    loading: false,
    error: null,
    pagination: {
      total: 0,
      page: 1,
      limit: 3,
      totalPages: 0,
      hasNextPage: false,
      hasPrevPage: false,
    }
  },
  savePost: {
    loading: false,
    error: null,
    savedPost: null,
  },
  recruitmentFlow: {
    nodes: [],
    edges: [],
  },
  updatePostStatus: {
    loading: false,
    error: null,
  },
  candidateAssessments: {
    items: [],
    loading: false,
    error: null,
    pagination: {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
      hasNextPage: false,
      hasPrevPage: false,
    },
  },
  companyAssessments: {
    items: [],
    loading: false,
    error: null,
    pagination: {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
      hasNextPage: false,
      hasPrevPage: false,
    },
  },
  assessmentDetails: {
    assessment: null,
    stepsData: null,
    loading: false,
    error: null,
  },
  postMetrics: {
    data: null,
    loading: false,
    error: null,
  },
};

export const savePost = createAsyncThunk(
  "post/savePost",
  async (jobData: any, { rejectWithValue }) => {
    try {
      if (!jobData) {
        throw new Error("No job data available");
      }

      const res = await axiosInstance.post("post/save-post", jobData);
      const saved = res.data;
      const job = saved.data || saved;
      return {
        success: true,
        jobData: job,
        planUsage: saved.planUsage || null,
      };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message || "Error saving job");
    }
  }
);

export const updatePost = createAsyncThunk(
  "post/updatePost",
  async (
    { jobId, jobData }: { jobId: string | number; jobData: any },
    { rejectWithValue }
  ) => {
    try {
      if (!jobData || !jobId) {
        throw new Error("Job ID or data is missing");
      }

      console.log("📤 updatePost - jobId:", jobId);
      console.log("📤 updatePost - jobData:", JSON.stringify(jobData, null, 2));

      const res = await axiosInstance.put(`post/updatePost/${jobId}`, jobData);
      const responseData = res.data;
      console.log("📥 updatePost - response:", responseData);

      const job = responseData.data || responseData;
      return {
        success: true,
        jobData: job,
      };
    } catch (err: any) {
      console.error("❌ updatePost - error:", err);
      return rejectWithValue(err.response?.data?.message || err.message || "Error updating job");
    }
  }
);

// Async thunk: Recommended posts
export const fetchRecommendedPosts = createAsyncThunk(
  "post/fetchRecommendedPosts",
  async (    params: {
      page?: number;
      limit?: number;
    } = {},
    { rejectWithValue }) => {
    try {
      const { page = 1, limit = 10} = params;
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await axiosInstance.get(`post/adsPost?${queryParams}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "An error occurred while fetching recommended posts"
      );
    }
  }
);

// Async thunk for posting recruitment steps
export const postRecruitmentSteps = createAsyncThunk(
  "post/postRecruitmentSteps",
  async (
    { postId, steps }: { postId: string; steps: any[] },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.post(`post-steps/post/${postId}/steps`, steps);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "An error occurred while posting recruitment steps"
      );
    }
  }
);

// Async thunk to fetch company posts (my posts)
export const fetchMyPosts = createAsyncThunk(
  "post/fetchMyPosts",
  async (
    params: {
      page?: number;
      limit?: number;
      search?: string;
      sort?: string;
      status?: string;
      creationType?: string;
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const { page = 1, limit = 12, search = "", sort = "newest", status, creationType } = params;

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        sort,
        ...(status && status !== "all" && { status }),
        ...(creationType && creationType !== "all" && { creationType }),
      });

      const response = await axiosInstance.get(`post/my-posts?${queryParams}`);
      const data = response.data;
      return {
        posts: data.results || [],
        pagination: {
          total: data.total || 0,
          page: data.page || 1,
          limit: data.limit || 10,
          totalPages: data.totalPages || 1,
          hasNextPage: data.hasNextPage || false,
          hasPrevPage: data.hasPrevPage || false,
        },
      };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "An error occurred while fetching posts"
      );
    }
  }
);

// Track ongoing fetches to prevent duplicates at thunk level
const ongoingFetches = new Map<string, Promise<any>>();

// Async thunk to delete a post by id
export const deletePost = createAsyncThunk(
  "post/deletePost",
  async (jobId: string, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`post/deletePost/${jobId}`);
      return jobId;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "An error occurred while deleting post"
      );
    }
  }
);


// Async thunk to fetch a single job by ID
export const fetchJobById = createAsyncThunk(
  "post/fetchJobById",
  async (jobId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`post/details/${jobId}`);
      return response.data?.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "An error occurred while fetching the job"
      );
    }
  }
);

export const updatePostStatus = createAsyncThunk(
  "post/updatePostStatus",
  async (
    { postId, status }: { postId: string; status: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.patch(`post/updatePostStatus/${postId}`, { status });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || "Error updating post status");
    }
  }
);

// Async thunk to save post interview assessment
export const savePostInterviewAssessment = createAsyncThunk(
  "post/savePostInterviewAssessment",
  async (
    { postId, interviewData }: { postId: string; interviewData: any },
    { rejectWithValue }
  ) => {
    try {
      // Normalise legacy interviewType values to the enum the backend model accepts
      const interviewTypeMap: Record<string, string> = {
        TECHNICAL_SKILL: "TECHNICAL_INTERVIEW",
        SOFT_SKILL:      "ASSESSMENT",
        SALARY_INTERVIEW: "HR_INTERVIEW",
        PSYCHOTECHNIC:   "EVALUATION",
      };
      const normalizedInterviewData = interviewData?.interviewType
        ? {
            ...interviewData,
            interviewType:
              interviewTypeMap[interviewData.interviewType] ??
              interviewData.interviewType,
          }
        : interviewData;

      const response = await axiosInstance.post("post-interview-assessments", {
        post: postId,
        interviewData: normalizedInterviewData,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || "Error saving post interview assessment");
    }
  }
);

// Async thunk to fetch candidate's post interview assessments
export const fetchCandidateAssessments = createAsyncThunk(
  "post/fetchCandidateAssessments",
  async (
    params: { page?: number; limit?: number } = {},
    { rejectWithValue }
  ) => {
    try {
      const { page = 1, limit = 10 } = params;

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await axiosInstance.get(`post-interview-assessments/candidate/my?${queryParams}`);
      const data = response.data;

      // Handle API response: { success, message, count, data: [{ post, assessments: [...], candidatePostStepProgress }] }
      // Keep the grouped structure as-is
      let results: any[] = [];
      if (Array.isArray(data?.data)) {
        results = data.data;
      } else if (Array.isArray(data)) {
        results = data;
      }

      return {
        items: results,
        pagination: {
          total: data.pagination?.totalCount || data.total || data.count || results.length,
          page: data.pagination?.page || page,
          limit: data.pagination?.limit || limit,
          totalPages: data.pagination?.totalPages || Math.ceil((data.count || results.length) / limit),
          hasNextPage: data.pagination?.hasNextPage || false,
          hasPrevPage: data.pagination?.hasPrevPage || false,
        },
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || "Error fetching candidate assessments");
    }
  }
);

// Async thunk to fetch company's post interview assessments (grouped by post)
export const fetchCompanyAssessments = createAsyncThunk(
  "post/fetchCompanyAssessments",
  async (
    params: { page?: number; limit?: number } = {},
    { rejectWithValue }
  ) => {
    try {
      const { page = 1, limit = 50 } = params;

      const response = await axiosInstance.get("post-interview-assessments/company/mine");
      const data = response.data;
      const rawData = data?.data || data;
      let normalized: any[] = [];

      if (Array.isArray(rawData)) {
        if (rawData.length > 0 && rawData[0]?.assessments && rawData[0]?.post) {
          // Grouped format: one row per post, using the latest assessment
          rawData.forEach((group: any) => {
            const post = group.post;
            const assessments = group.assessments || [];
            if (assessments.length === 0) return;

            const sorted = [...assessments].sort((a: any, b: any) => {
              const aDate = new Date(a.createdAt || a.assessment?.createdAt || 0).getTime();
              const bDate = new Date(b.createdAt || b.assessment?.createdAt || 0).getTime();
              return bDate - aDate;
            });

            const latest = sorted[0];
            const a = latest.assessment || latest;

            normalized.push({
              ...a,
              post: a.post || post,
              candidatePostStepProgress: latest.candidatePostStepProgress || null,
              assessmentsCount: assessments.length,
            });
          });
        } else {
          normalized = rawData;
        }
      } else if (Array.isArray(rawData?.results)) {
        normalized = rawData.results;
      } else if (Array.isArray(rawData?.assessments)) {
        normalized = rawData.assessments;
      }

      // Map to consistent format
      const mappedAssessments = normalized.map((a: any) => ({
        _id: a._id,
        candidate: a.candidate,
        candidateName: a.candidate?.username || "",
        candidateEmail: a.candidate?.email || "",
        post: a.post,
        jobTitle: a.post?.jobDetails?.title || "",
        jobStatus: a.post?.status || "",
        interviewData: a.interviewData,
        interviewType: a.interviewData?.interviewType || "HR_INTERVIEW",
        coverageScore: a.interviewData?.finalReport?.coverage?.overall || 0,
        analytics: a.interviewData?.analytics,
        duration: a.interviewData?.analytics?.duration || 0,
        messageCount: a.interviewData?.analytics?.messageCount || 0,
        timestamp: a.createdAt || a.timestamp,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
        summary: a.interviewData?.finalReport?.summary || "",
        recommendations: a.interviewData?.finalReport?.recommendations || [],
        coverageAreas: a.interviewData?.finalReport?.coverage?.areas || {},
        aiAnalysis: a.interviewData?.finalReport?.aiAnalysis || {},
        completed: a.completed,
        candidatePostStepProgress: a.candidatePostStepProgress,
        assessmentsCount: a.assessmentsCount,
      }));

      return {
        items: mappedAssessments,
        pagination: {
          total: data.count || mappedAssessments.length,
          page,
          limit,
          totalPages: Math.ceil((data.count || mappedAssessments.length) / limit),
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || "Error fetching company assessments");
    }
  }
);

// Async thunk to fetch a single post-interview assessment by ID
export const fetchAssessmentDetails = createAsyncThunk<
  { assessment: any; stepsData: any },
  string,
  { rejectValue: string }
>(
  "post/fetchAssessmentDetails",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`post-interview-assessments/${id}`);
      const responseData = response.data.data || response.data;
      const assessment = responseData.assessment || responseData;
      const stepsData = responseData.stepsData || null;
      return { assessment, stepsData };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || "Failed to load assessment");
    }
  }
);

export const fetchPostMetrics = createAsyncThunk(
  "post/fetchPostMetrics",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("post/metrics");
      return res.data.data as PostMetrics;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || "Failed to fetch post metrics");
    }
  }
);


// Post slice
const postSlice = createSlice({
  name: "post",
  initialState,
  reducers: {
    resetSavePost: (state) => {
      state.savePost.loading = false;
      state.savePost.error = null;
      state.savePost.savedPost = null;
    },
    setSavedPost: (state, action: PayloadAction<any>) => {
      state.savePost.savedPost = action.payload;
    },
    clearError: (state) => {
      state.error = null;
      state.postStepsError = null;
      state.currentJobError = null;
      state.recommended.error = null;
    },
    setSteps: (state, action: PayloadAction<any[]>) => {
      state.steps = action.payload;
    },
    addStep: (state, action: PayloadAction<any>) => {
      state.steps.push(action.payload);
    },
    updateStep: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<any> }>
    ) => {
      const { id, updates } = action.payload;
      const stepIndex = state.steps.findIndex((step) => step.id === id);
      if (stepIndex !== -1) {
        state.steps[stepIndex] = { ...state.steps[stepIndex], ...updates };
      }
    },
    removeStep: (state, action: PayloadAction<string>) => {
      state.steps = state.steps.filter((step) => step.id !== action.payload);
    },
    setFlowNodes(state, action) {
      state.recruitmentFlow.nodes = action.payload;
    },
    setFlowEdges(state, action) {
      state.recruitmentFlow.edges = action.payload;
    },
    resetFlow(state) {
      state.recruitmentFlow.nodes = [];
      state.recruitmentFlow.edges = [];
    },

    clearAssessmentDetails(state) {
      state.assessmentDetails = { assessment: null, stepsData: null, loading: false, error: null };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(savePost.pending, (state) => {
        state.savePost.loading = true;
        state.savePost.error = null;
      })
      .addCase(savePost.fulfilled, (state, action) => {
        state.savePost.loading = false;
        state.savePost.error = null;
        state.savePost.savedPost = action.payload;
      })
      .addCase(savePost.rejected, (state, action) => {
        state.savePost.loading = false;
        state.savePost.error = action.payload as string;
      })
      .addCase(updatePost.pending, (state) => {
        state.savePost.loading = true;
        state.savePost.error = null;
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        state.savePost.loading = false;
        state.savePost.error = null;
        state.savePost.savedPost = action.payload;
        state.currentJob = action.payload.jobData || action.payload;
      })
      .addCase(updatePost.rejected, (state, action) => {
        state.savePost.loading = false;
        state.savePost.error = action.payload as string;
      })
      // Post recruitment steps
      .addCase(postRecruitmentSteps.pending, (state) => {
        state.postStepsLoading = true;
        state.postStepsError = null;
      })
      .addCase(postRecruitmentSteps.fulfilled, (state, action) => {
        state.postStepsLoading = false;
        state.postStepsError = null;
        if (action.payload.data) {
          state.steps = action.payload.data;
          if (state.currentJob) {
            state.currentJob.PostSteps = action.payload.data;
          }
        }
      })
      .addCase(postRecruitmentSteps.rejected, (state, action) => {
        state.postStepsLoading = false;
        state.postStepsError = action.payload as string;
      })
      // Fetch my posts
      .addCase(fetchMyPosts.pending, (state) => {
        state.myPostsLoading = true;
        state.myPostsError = null;
      })
      .addCase(fetchMyPosts.fulfilled, (state, action: PayloadAction<any>) => {
        state.myPostsLoading = false;
        state.myPosts = action.payload.posts || [];
        state.myPostsPagination = action.payload.pagination;
      })
      .addCase(fetchMyPosts.rejected, (state, action) => {
        state.myPostsLoading = false;
        state.myPostsError = action.payload as string;
      })
      // Delete post
      .addCase(deletePost.pending, (state) => {
        state.deletePostLoading = true;
        state.deletePostError = null;
      })
      .addCase(deletePost.fulfilled, (state, action: PayloadAction<string>) => {
        state.deletePostLoading = false;
        state.myPosts = state.myPosts.filter(
          (p: any) => (p._id || p.id) !== action.payload
        );
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.deletePostLoading = false;
        state.deletePostError = action.payload as string;
      })
      // Fetch single job by ID
      .addCase(fetchJobById.pending, (state) => {
        state.currentJobLoading = true;
        state.currentJobError = null;
        state.currentJob = null;
      })
      .addCase(fetchJobById.fulfilled, (state, action: PayloadAction<any>) => {
        state.currentJobLoading = false;
        state.currentJob = action.payload;
      })
      .addCase(fetchJobById.rejected, (state, action) => {
        state.currentJobLoading = false;
        state.currentJobError = action.payload as string;
      })
      // ---- RECOMMENDED POSTS ----
      .addCase(fetchRecommendedPosts.pending, (state) => {
        state.recommended.loading = true;
        state.recommended.error = null;
      })
      .addCase(fetchRecommendedPosts.fulfilled, (state, action) => {
        state.recommended.loading = false;
        state.recommended.items = action.payload.data || [];
        state.recommended.pagination = action.payload.pagination;
      })
      .addCase(fetchRecommendedPosts.rejected, (state, action) => {
        state.recommended.loading = false;
        state.recommended.error = action.payload as string;
      })
      // ---- POST PAYMENT ----

      // ---- UPDATE POST STATUS ----
      .addCase(updatePostStatus.pending, (state) => {
        state.updatePostStatus.loading = true;
        state.updatePostStatus.error = null;
      })
      .addCase(updatePostStatus.fulfilled, (state, action) => {
        console.log("updatePostStatus", action.payload)
        state.updatePostStatus.loading = false;
        if(state.currentJob){
          state.currentJob.status = action.payload.data?.status;
        }
      })
      .addCase(updatePostStatus.rejected, (state, action) => {
        state.updatePostStatus.loading = false;
        state.updatePostStatus.error = action.payload as string;
      })
      // ---- CANDIDATE ASSESSMENTS ----
      .addCase(fetchCandidateAssessments.pending, (state) => {
        state.candidateAssessments.loading = true;
        state.candidateAssessments.error = null;
      })
      .addCase(fetchCandidateAssessments.fulfilled, (state, action) => {
        state.candidateAssessments.loading = false;
        state.candidateAssessments.items = action.payload.items;
        state.candidateAssessments.pagination = action.payload.pagination;
      })
      .addCase(fetchCandidateAssessments.rejected, (state, action) => {
        state.candidateAssessments.loading = false;
        state.candidateAssessments.error = action.payload as string;
      })
      // ---- COMPANY ASSESSMENTS ----
      .addCase(fetchCompanyAssessments.pending, (state) => {
        state.companyAssessments.loading = true;
        state.companyAssessments.error = null;
      })
      .addCase(fetchCompanyAssessments.fulfilled, (state, action) => {
        state.companyAssessments.loading = false;
        state.companyAssessments.items = action.payload.items;
        state.companyAssessments.pagination = action.payload.pagination;
      })
      .addCase(fetchCompanyAssessments.rejected, (state, action) => {
        state.companyAssessments.loading = false;
        state.companyAssessments.error = action.payload as string;
      })
      // ---- ASSESSMENT DETAILS ----
      .addCase(fetchAssessmentDetails.pending, (state) => {
        state.assessmentDetails.loading = true;
        state.assessmentDetails.error = null;
      })
      .addCase(fetchAssessmentDetails.fulfilled, (state, action) => {
        state.assessmentDetails.loading = false;
        state.assessmentDetails.assessment = action.payload.assessment;
        state.assessmentDetails.stepsData = action.payload.stepsData;
      })
      .addCase(fetchAssessmentDetails.rejected, (state, action) => {
        state.assessmentDetails.loading = false;
        state.assessmentDetails.error = action.payload as string;
      })
      // ---- POST METRICS ----
      .addCase(fetchPostMetrics.pending, (state) => {
        state.postMetrics.loading = true;
        state.postMetrics.error = null;
      })
      .addCase(fetchPostMetrics.fulfilled, (state, action) => {
        state.postMetrics.loading = false;
        state.postMetrics.data = action.payload;
      })
      .addCase(fetchPostMetrics.rejected, (state, action) => {
        state.postMetrics.loading = false;
        state.postMetrics.error = action.payload as string;
      })
      ;
  },
});

// Export actions
export const {
  resetSavePost,
  setSavedPost,
  clearError,
  setSteps,
  addStep,
  updateStep,
  removeStep,
  setFlowNodes,
  setFlowEdges,
  resetFlow,

  clearAssessmentDetails,
} = postSlice.actions;

// Export reducer
export default postSlice.reducer;

// Selectors
export const selectSteps = (state: { post: PostState }) => state.post.steps;
export const selectPostStepsLoading = (state: { post: PostState }) =>
  state.post.postStepsLoading;
export const selectPostStepsError = (state: { post: PostState }) =>
  state.post.postStepsError;

export const selectMyPosts = (state: { post: PostState }) => state.post.myPosts;
export const selectMyPostsLoading = (state: { post: PostState }) =>
  state.post.myPostsLoading;
export const selectMyPostsError = (state: { post: PostState }) =>
  state.post.myPostsError;

export const selectDeletePostLoading = (state: { post: PostState }) =>
  state.post.deletePostLoading;
export const selectDeletePostError = (state: { post: PostState }) =>
  state.post.deletePostError;

export const selectCurrentJob = (state: { post: PostState }) =>
  state.post.currentJob;
export const selectCurrentJobLoading = (state: { post: PostState }) =>
  state.post.currentJobLoading;
export const selectCurrentJobError = (state: { post: PostState }) =>
  state.post.currentJobError;
export const selectMyPostsPagination = (state: { post: PostState }) =>
  state.post.myPostsPagination;

// Selector to get a job from myPosts by ID (if already loaded)
export const selectJobById = (jobId: string) => (state: { post: PostState }) =>
  state.post.myPosts.find((job: any) => (job._id || job.id) === jobId);

export const selectRecommended = (state: { post: PostState }) => ({
  items: state.post.recommended.items,
  loading: state.post.recommended.loading,
  error: state.post.recommended.error,
  pagination: state.post.recommended.pagination,
});

// Candidate Assessments Selectors
export const selectCandidateAssessments = (state: { post: PostState }) =>
  state.post.candidateAssessments.items;
export const selectCandidateAssessmentsLoading = (state: { post: PostState }) =>
  state.post.candidateAssessments.loading;
export const selectCandidateAssessmentsError = (state: { post: PostState }) =>
  state.post.candidateAssessments.error;
export const selectCandidateAssessmentsPagination = (state: { post: PostState }) =>
  state.post.candidateAssessments.pagination;

// Company Assessments Selectors
export const selectCompanyAssessments = (state: { post: PostState }) =>
  state.post.companyAssessments.items;
export const selectCompanyAssessmentsLoading = (state: { post: PostState }) =>
  state.post.companyAssessments.loading;
export const selectCompanyAssessmentsError = (state: { post: PostState }) =>
  state.post.companyAssessments.error;
export const selectCompanyAssessmentsPagination = (state: { post: PostState }) =>
  state.post.companyAssessments.pagination;

// Assessment Details Selectors
export const selectAssessmentDetails = (state: { post: PostState }) =>
  state.post.assessmentDetails.assessment;
export const selectAssessmentStepsData = (state: { post: PostState }) =>
  state.post.assessmentDetails.stepsData;
export const selectAssessmentDetailsLoading = (state: { post: PostState }) =>
  state.post.assessmentDetails.loading;
export const selectAssessmentDetailsError = (state: { post: PostState }) =>
  state.post.assessmentDetails.error;

// Post Metrics Selectors
export const selectPostMetrics = (state: { post: PostState }) =>
  state.post.postMetrics.data;
export const selectPostMetricsLoading = (state: { post: PostState }) =>
  state.post.postMetrics.loading;
export const selectPostMetricsError = (state: { post: PostState }) =>
  state.post.postMetrics.error;


