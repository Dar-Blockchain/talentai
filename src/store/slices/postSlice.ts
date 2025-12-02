import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Types
interface Step {
  id: string;
  title: string;
  description: string;
  order: number;
  isCompleted: boolean;
  // Add other step properties as needed
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
  jobMatches: any[];
  jobMatchesLoading: boolean;
  jobMatchesError: string | null;
  deletePostLoading: boolean;
  deletePostError: string | null;
  currentJob: any | null;
  currentJobLoading: boolean;
  currentJobError: string | null;
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
  jobMatches: [],
  jobMatchesLoading: false,
  jobMatchesError: null,
  deletePostLoading: false,
  deletePostError: null,
  currentJob: null,
  currentJobLoading: false,
  currentJobError: null,
};

// Async thunk for posting recruitment steps
export const postRecruitmentSteps = createAsyncThunk(
  'post/postRecruitmentSteps',
  async (
    { postId, steps }: { postId: string; steps: any[] },
    { rejectWithValue }
  ) => {
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('api_token='))
        ?.split('=')[1];

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}post-steps/post/${postId}/steps`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(steps),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to post recruitment steps');
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred while posting recruitment steps');
    }
  }
);

// Async thunk to fetch company posts (my posts)
export const fetchMyPosts = createAsyncThunk(
  'post/fetchMyPosts',
  async (_, { rejectWithValue }) => {
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('api_token='))
        ?.split('=')[1];

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}post/my-posts`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch my posts');
      }

      const data = await response.json();
      return Array.isArray(data) ? data : (data.data || []);
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred while fetching posts');
    }
  }
);

// Async thunk to fetch matches for a selected job post
export const fetchJobMatches = createAsyncThunk(
  'post/fetchJobMatches',
  async (selectedJobId: string, { rejectWithValue }) => {
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('api_token='))
        ?.split('=')[1];

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}matching/jobs/${selectedJobId}/matches`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch job matches');
      }

      const data = await response.json();
      return data && Array.isArray(data.matches) ? data.matches : [];
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred while fetching matches');
    }
  }
);

// Async thunk to delete a post by id
export const deletePost = createAsyncThunk(
  'post/deletePost',
  async (jobId: string, { rejectWithValue }) => {
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('api_token='))
        ?.split('=')[1];

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}post/deletePost/${jobId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete post');
      }

      return jobId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred while deleting post');
    }
  }
);

// Async thunk to fetch a single job by ID
export const fetchJobById = createAsyncThunk(
  'post/fetchJobById',
  async (jobId: string, { rejectWithValue }) => {
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('api_token='))
        ?.split('=')[1];

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}post/details/${jobId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch job');
      }

      const data = await response.json();
      return data?.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred while fetching the job');
    }
  }
);

// Post slice
const postSlice = createSlice({
  name: 'post',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.postStepsError = null;
      state.currentJobError = null;
    },
    setSteps: (state, action: PayloadAction<any[]>) => {
      state.steps = action.payload;
    },
    addStep: (state, action: PayloadAction<any>) => {
      state.steps.push(action.payload);
    },
    updateStep: (state, action: PayloadAction<{ id: string; updates: Partial<any> }>) => {
      const { id, updates } = action.payload;
      const stepIndex = state.steps.findIndex(step => step.id === id);
      if (stepIndex !== -1) {
        state.steps[stepIndex] = { ...state.steps[stepIndex], ...updates };
      }
    },
    removeStep: (state, action: PayloadAction<string>) => {
      state.steps = state.steps.filter(step => step.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
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
      .addCase(fetchMyPosts.fulfilled, (state, action: PayloadAction<any[]>) => {
        state.myPostsLoading = false;
        state.myPosts = action.payload || [];
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
      .addCase(fetchJobMatches.fulfilled, (state, action: PayloadAction<any[]>) => {
        state.jobMatchesLoading = false;
        state.jobMatches = action.payload || [];
      })
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
        state.myPosts = state.myPosts.filter((p: any) => (p._id || p.id) !== action.payload);
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
      });
  },
});

// Export actions
export const { clearError, setSteps, addStep, updateStep, removeStep } = postSlice.actions;

// Export reducer
export default postSlice.reducer;

// Selectors
export const selectSteps = (state: { post: PostState }) => state.post.steps;
export const selectPostStepsLoading = (state: { post: PostState }) => state.post.postStepsLoading;
export const selectPostStepsError = (state: { post: PostState }) => state.post.postStepsError;

export const selectMyPosts = (state: { post: PostState }) => state.post.myPosts;
export const selectMyPostsLoading = (state: { post: PostState }) => state.post.myPostsLoading;
export const selectMyPostsError = (state: { post: PostState }) => state.post.myPostsError;

export const selectJobMatches = (state: { post: PostState }) => state.post.jobMatches;
export const selectJobMatchesLoading = (state: { post: PostState }) => state.post.jobMatchesLoading;
export const selectJobMatchesError = (state: { post: PostState }) => state.post.jobMatchesError;

export const selectDeletePostLoading = (state: { post: PostState }) => state.post.deletePostLoading;
export const selectDeletePostError = (state: { post: PostState }) => state.post.deletePostError;

export const selectCurrentJob = (state: { post: PostState }) => state.post.currentJob;
export const selectCurrentJobLoading = (state: { post: PostState }) => state.post.currentJobLoading;
export const selectCurrentJobError = (state: { post: PostState }) => state.post.currentJobError;

// Selector to get a job from myPosts by ID (if already loaded)
export const selectJobById = (jobId: string) => (state: { post: PostState }) =>
  state.post.myPosts.find((job: any) => (job._id || job.id) === jobId);
