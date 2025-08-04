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
}

// Initial state
const initialState: PostState = {
  steps: [],
  loading: false,
  error: null,
  postStepsLoading: false,
  postStepsError: null,
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

// Post slice
const postSlice = createSlice({
  name: 'post',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.postStepsError = null;
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
        // Update steps if the response contains updated steps
        if (action.payload.steps) {
          state.steps = action.payload.steps;
        }
      })
      .addCase(postRecruitmentSteps.rejected, (state, action) => {
        state.postStepsLoading = false;
        state.postStepsError = action.payload as string;
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
