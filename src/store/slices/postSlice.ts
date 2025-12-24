import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

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
}

interface PostPaymentState {
  loading: boolean;
  error: string | null;
  data: any | null;
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
  jobMatches: any[];
  jobMatchesLoading: boolean;
  jobMatchesError: string | null;
  deletePostLoading: boolean;
  deletePostError: string | null;
  currentJob: any | null;
  currentJobLoading: boolean;
  currentJobError: string | null;
  recommended: RecommendedState;
  savePost: SavePostState;
  recruitmentFlow: RecruitmentFlowState;
  postPayment: PostPaymentState;
  updatePostStatus: UpdatePostStatusState;
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
  jobMatches: [],
  jobMatchesLoading: false,
  jobMatchesError: null,
  deletePostLoading: false,
  deletePostError: null,
  currentJob: null,
  currentJobLoading: false,
  currentJobError: null,
  recommended: {
    items: [],
    loading: false,
    error: null,
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
  postPayment: {
    loading: false,
    error: null,
    data: null,
  },
  updatePostStatus: {
    loading: false,
    error: null,
  }
};

export const savePost = createAsyncThunk(
  "post/savePost",
  async (jobData: any, { rejectWithValue }) => {
    try {
      if (!jobData) {
        throw new Error("No job data available");
      }

      const token = Cookies.get("api_token");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}post/save-post`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(jobData),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to save job");
      }

      const saved = await res.json();

      const job = saved.data || saved;
      return {
        success: true,
        jobData: job,
      };
    } catch (err: any) {
      return rejectWithValue(err.message || "Error saving job");
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

      const token = Cookies.get("api_token");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}post/updatePost/${jobId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(jobData),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update job");
      }

      const updated = await res.json();
      const job = updated.data || updated;

      return {
        success: true,
        jobData: job,
      };
    } catch (err: any) {
      return rejectWithValue(err.message || "Error updating job");
    }
  }
);

// Async thunk: Recommended posts
export const fetchRecommendedPosts = createAsyncThunk(
  "post/fetchRecommendedPosts",
  async (_, { rejectWithValue }) => {
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("api_token="))
        ?.split("=")[1];

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}post/adsPost`,
        {
          method: "GET",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Failed to fetch recommended posts"
        );
      }

      const data = await response.json();

      // DEBUG: Log the API response structure
      const posts = Array.isArray(data) ? data : data.data || [];
      console.log("🔍 DEBUG - postSlice fetchRecommendedPosts response:", {
        dataType: Array.isArray(data) ? "array" : typeof data,
        hasDataProperty: !!data.data,
        postsCount: Array.isArray(posts) ? posts.length : 0,
        firstPost: posts[0]
          ? {
              _id: posts[0]._id,
              creationType: posts[0].creationType,
              hasPostSteps: !!posts[0].post_Steps,
              postStepsType: Array.isArray(posts[0].post_Steps)
                ? "array"
                : typeof posts[0].post_Steps,
              postStepsCount: posts[0].post_Steps?.length || 0,
            }
          : null,
      });

      return posts;
    } catch (error: any) {
      return rejectWithValue(
        error.message || "An error occurred while fetching recommended posts"
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
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("api_token="))
        ?.split("=")[1];

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}post-steps/post/${postId}/steps`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(steps),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to post recruitment steps"
        );
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.message || "An error occurred while posting recruitment steps"
      );
    }
  }
);

// Async thunk to fetch company posts (my posts)
export const fetchMyPosts = createAsyncThunk(
  'post/fetchMyPosts',
  async (params: { page?: number; limit?: number; search?: string; sort?: string } = {}, { rejectWithValue }) => {
    try {
      const { page = 1, limit = 10, search = '', sort = 'newest' } = params;
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("api_token="))
        ?.split("=")[1];

      // Build query parameters
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        sort,
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}post/my-posts?${queryParams}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to fetch my posts");
      }

      const data = await response.json();
      return {
        posts: data.results || [],
        pagination: {
          total: data.total || 0,
          page: data.page || 1,
          limit: data.limit || 10,
          totalPages: data.totalPages || 1,
          hasNextPage: data.hasNextPage || false,
          hasPrevPage: data.hasPrevPage || false,
        }
      };
    } catch (error: any) {
      return rejectWithValue(
        error.message || "An error occurred while fetching posts"
      );
    }
  }
);

// Async thunk to fetch matches for a selected job post
export const fetchJobMatches = createAsyncThunk(
  "post/fetchJobMatches",
  async (selectedJobId: string, { rejectWithValue }) => {
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("api_token="))
        ?.split("=")[1];

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}matching/jobs/${selectedJobId}/matches`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to fetch job matches");
      }

      const data = await response.json();
      return data && Array.isArray(data.matches) ? data.matches : [];
    } catch (error: any) {
      return rejectWithValue(
        error.message || "An error occurred while fetching matches"
      );
    }
  }
);

// Async thunk to delete a post by id
export const deletePost = createAsyncThunk(
  "post/deletePost",
  async (jobId: string, { rejectWithValue }) => {
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("api_token="))
        ?.split("=")[1];

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}post/deletePost/${jobId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to delete post");
      }

      return jobId;
    } catch (error: any) {
      return rejectWithValue(
        error.message || "An error occurred while deleting post"
      );
    }
  }
);

// Async thunk to fetch a single job by ID
export const fetchJobById = createAsyncThunk(
  "post/fetchJobById",
  async (jobId: string, { rejectWithValue }) => {
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("api_token="))
        ?.split("=")[1];

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}post/details/${jobId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to fetch job");
      }

      const data = await response.json();
      return data?.data;
    } catch (error: any) {
      return rejectWithValue(
        error.message || "An error occurred while fetching the job"
      );
    }
  }
);

export const processPostPayment = createAsyncThunk(
  "post/processPostPayment",
  async (
    { postId, agentId }: { postId: string; agentId: string },
    { rejectWithValue }
  ) => {
    try {
      const token = Cookies.get("api_token");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}post/payment/process`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            postId,
            agentId,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Payment processing failed");
      }

      return await response.json();
    } catch (error: any) {
      return rejectWithValue(
        error.message || "An error occurred while processing payment"
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
      const token = Cookies.get("api_token");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}post/updatePostStatus/${postId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Failed to update post status"
        );
      }

      const data = await response.json();
      return {
        postId,
        status,
        data,
      };
    } catch (error: any) {
      return rejectWithValue(
        error.message || "Error updating post status"
      );
    }
  }
);


// Post slice
const postSlice = createSlice({
  name: "post",
  initialState,
  reducers: {
    resetSavePost: (state) => {
      state.savePost.loading= false;
    state.savePost.error= null;
    state.savePost.savedPost= null;
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
    resetPostPayment(state) {
      state.postPayment.loading = false;
      state.postPayment.error = null;
      state.postPayment.data = null;
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
        state.currentJob = action.payload; 
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
        if (action.payload.steps) {
          state.steps = action.payload.steps;
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
      // Fetch job matches
      .addCase(fetchJobMatches.pending, (state) => {
        state.jobMatchesLoading = true;
        state.jobMatchesError = null;
        state.jobMatches = [];
      })
      .addCase(
        fetchJobMatches.fulfilled,
        (state, action: PayloadAction<any[]>) => {
          state.jobMatchesLoading = false;
          state.jobMatches = action.payload || [];
        }
      )
      .addCase(fetchJobMatches.rejected, (state, action) => {
        state.jobMatchesLoading = false;
        state.jobMatchesError = action.payload as string;
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
        state.recommended.items = action.payload.posts || [];
      })
      .addCase(fetchRecommendedPosts.rejected, (state, action) => {
        state.recommended.loading = false;
        state.recommended.error = action.payload as string;
      })
      // ---- POST PAYMENT ----
      .addCase(processPostPayment.pending, (state) => {
        state.postPayment.loading = true;
        state.postPayment.error = null;
      })
      .addCase(processPostPayment.fulfilled, (state, action) => {
        state.postPayment.loading = false;
        state.postPayment.data = action.payload;
      })
      .addCase(processPostPayment.rejected, (state, action) => {
        state.postPayment.loading = false;
        state.postPayment.error = action.payload as string;
      })
      // ---- UPDATE POST STATUS ----
    .addCase(updatePostStatus.pending, (state) => {
      state.updatePostStatus.loading = true;
      state.updatePostStatus.error = null;
    })
    .addCase(updatePostStatus.fulfilled, (state, action) => {
      state.updatePostStatus.loading = false;
    })
    .addCase(updatePostStatus.rejected, (state, action) => {
      state.updatePostStatus.loading = false;
      state.updatePostStatus.error = action.payload as string;
    });

  },
});

// Export actions
export const {
  resetSavePost,
  clearError,
  setSteps,
  addStep,
  updateStep,
  removeStep,
  setFlowNodes,
  setFlowEdges,
  resetFlow,
  resetPostPayment,
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

export const selectJobMatches = (state: { post: PostState }) =>
  state.post.jobMatches;
export const selectJobMatchesLoading = (state: { post: PostState }) =>
  state.post.jobMatchesLoading;

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
export const selectMyPostsPagination = (state: { post: PostState }) => state.post.myPostsPagination;

export const selectJobMatchesError = (state: { post: PostState }) => state.post.jobMatchesError;




// Selector to get a job from myPosts by ID (if already loaded)
export const selectJobById = (jobId: string) => (state: { post: PostState }) =>
  state.post.myPosts.find((job: any) => (job._id || job.id) === jobId);

export const selectRecommended = (state: { post: PostState }) => ({
  items: state.post.recommended.items,
  loading: state.post.recommended.loading,
  error: state.post.recommended.error,
})

export const selectPostPayment = (state: { post: PostState }) => ({
  data: state.post.postPayment.data,
  loading: state.post.postPayment.loading,
  error: state.post.postPayment.error,
});