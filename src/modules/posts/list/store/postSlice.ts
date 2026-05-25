import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { postService } from "../api/postService";

// ── Types ─────────────────────────────────────────────────────────────────────

interface PaginationState {
  total: number; page: number; limit: number;
  totalPages: number; hasNextPage: boolean; hasPrevPage: boolean;
}

export interface PostMetrics {
  total: number; active: number; draft: number; closed: number;
}

interface PostListState {
  myPosts: any[];
  myPostsLoading: boolean;
  myPostsError: string | null;
  myPostsPagination: PaginationState;
  deletePostLoading: boolean;
  deletePostError: string | null;
  updatePostStatus: { loading: boolean; error: string | null };
  savePost: { loading: boolean; error: string | null; savedPost: any };
  recommended: { items: any[]; loading: boolean; error: string | null; pagination: PaginationState };
  postMetrics: { data: PostMetrics | null; loading: boolean; error: string | null };
}

// ── Initial state ─────────────────────────────────────────────────────────────

const defaultPagination: PaginationState = {
  total: 0, page: 1, limit: 10, totalPages: 0, hasNextPage: false, hasPrevPage: false,
};

const initialState: PostListState = {
  myPosts: [],
  myPostsLoading: false,
  myPostsError: null,
  myPostsPagination: { ...defaultPagination },
  deletePostLoading: false,
  deletePostError: null,
  updatePostStatus: { loading: false, error: null },
  savePost: { loading: false, error: null, savedPost: null },
  recommended: { items: [], loading: false, error: null, pagination: { ...defaultPagination, limit: 3 } },
  postMetrics: { data: null, loading: false, error: null },
};

// ── Thunks ────────────────────────────────────────────────────────────────────

export const fetchMyPosts = createAsyncThunk(
  "postList/fetchMyPosts",
  async (params: { page?: number; limit?: number; search?: string; sort?: string; status?: string; creationType?: string } = {}, { rejectWithValue }) => {
    try { return await postService.fetchMyPosts(params); }
    catch (err: any) { return rejectWithValue(err.response?.data?.message || err.message || "Error fetching posts"); }
  }
);

export const deletePost = createAsyncThunk(
  "postList/deletePost",
  async (jobId: string, { rejectWithValue }) => {
    try { return await postService.deletePost(jobId); }
    catch (err: any) { return rejectWithValue(err.response?.data?.message || err.message || "Error deleting post"); }
  }
);

export const updatePostStatus = createAsyncThunk(
  "postList/updatePostStatus",
  async ({ postId, status }: { postId: string; status: string }, { rejectWithValue }) => {
    try { return await postService.updatePostStatus(postId, status); }
    catch (err: any) { return rejectWithValue(err.response?.data?.message || err.message || "Error updating post status"); }
  }
);

export const fetchPostMetrics = createAsyncThunk(
  "postList/fetchPostMetrics",
  async (_, { rejectWithValue }) => {
    try { return await postService.fetchPostMetrics() as PostMetrics; }
    catch (err: any) { return rejectWithValue(err.response?.data?.message || err.message || "Error fetching metrics"); }
  }
);

export const savePost = createAsyncThunk(
  "postList/savePost",
  async (jobData: any, { rejectWithValue }) => {
    try { return await postService.savePost(jobData); }
    catch (err: any) { return rejectWithValue(err.response?.data?.message || err.message || "Error saving post"); }
  }
);

export const updatePost = createAsyncThunk(
  "postList/updatePost",
  async ({ jobId, jobData }: { jobId: string | number; jobData: any }, { rejectWithValue }) => {
    try { return await postService.updatePost(jobId, jobData); }
    catch (err: any) { return rejectWithValue(err.response?.data?.message || err.message || "Error updating post"); }
  }
);

export const fetchRecommendedPosts = createAsyncThunk(
  "postList/fetchRecommendedPosts",
  async (params: { page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try { return await postService.fetchRecommendedPosts(params); }
    catch (err: any) { return rejectWithValue(err.response?.data?.message || err.message || "Error fetching recommended posts"); }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const postListSlice = createSlice({
  name: "postList",
  initialState,
  reducers: {
    resetSavePost: (state) => { state.savePost = { loading: false, error: null, savedPost: null }; },
    clearError:    (state) => { state.myPostsError = null; state.deletePostError = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyPosts.pending,   (state) => { state.myPostsLoading = true;  state.myPostsError = null; })
      .addCase(fetchMyPosts.fulfilled, (state, action: PayloadAction<any>) => { state.myPostsLoading = false; state.myPosts = action.payload.posts || []; state.myPostsPagination = action.payload.pagination; })
      .addCase(fetchMyPosts.rejected,  (state, action) => { state.myPostsLoading = false; state.myPostsError = action.payload as string; })

      .addCase(deletePost.pending,   (state) => { state.deletePostLoading = true;  state.deletePostError = null; })
      .addCase(deletePost.fulfilled, (state, action: PayloadAction<string>) => { state.deletePostLoading = false; state.myPosts = state.myPosts.filter((p: any) => (p._id || p.id) !== action.payload); })
      .addCase(deletePost.rejected,  (state, action) => { state.deletePostLoading = false; state.deletePostError = action.payload as string; })

      .addCase(updatePostStatus.pending,   (state) => { state.updatePostStatus.loading = true;  state.updatePostStatus.error = null; })
      .addCase(updatePostStatus.fulfilled, (state) => { state.updatePostStatus.loading = false; })
      .addCase(updatePostStatus.rejected,  (state, action) => { state.updatePostStatus.loading = false; state.updatePostStatus.error = action.payload as string; })

      .addCase(fetchPostMetrics.pending,   (state) => { state.postMetrics.loading = true;  state.postMetrics.error = null; })
      .addCase(fetchPostMetrics.fulfilled, (state, action) => { state.postMetrics.loading = false; state.postMetrics.data = action.payload; })
      .addCase(fetchPostMetrics.rejected,  (state, action) => { state.postMetrics.loading = false; state.postMetrics.error = action.payload as string; })

      .addCase(savePost.pending,   (state) => { state.savePost.loading = true;  state.savePost.error = null; })
      .addCase(savePost.fulfilled, (state, action) => { state.savePost.loading = false; state.savePost.savedPost = action.payload; })
      .addCase(savePost.rejected,  (state, action) => { state.savePost.loading = false; state.savePost.error = action.payload as string; })

      .addCase(updatePost.pending,   (state) => { state.savePost.loading = true;  state.savePost.error = null; })
      .addCase(updatePost.fulfilled, (state, action) => { state.savePost.loading = false; state.savePost.savedPost = action.payload; })
      .addCase(updatePost.rejected,  (state, action) => { state.savePost.loading = false; state.savePost.error = action.payload as string; })

      .addCase(fetchRecommendedPosts.pending,   (state) => { state.recommended.loading = true;  state.recommended.error = null; })
      .addCase(fetchRecommendedPosts.fulfilled, (state, action) => { state.recommended.loading = false; state.recommended.items = action.payload.data || []; state.recommended.pagination = action.payload.pagination; })
      .addCase(fetchRecommendedPosts.rejected,  (state, action) => { state.recommended.loading = false; state.recommended.error = action.payload as string; });
  },
});

export const { resetSavePost, clearError } = postListSlice.actions;
export default postListSlice.reducer;

// ── Selectors ─────────────────────────────────────────────────────────────────

type S = { postList: PostListState };

export const selectMyPosts             = (s: S) => s.postList.myPosts;
export const selectMyPostsLoading      = (s: S) => s.postList.myPostsLoading;
export const selectMyPostsError        = (s: S) => s.postList.myPostsError;
export const selectMyPostsPagination   = (s: S) => s.postList.myPostsPagination;
export const selectDeletePostLoading   = (s: S) => s.postList.deletePostLoading;
export const selectDeletePostError     = (s: S) => s.postList.deletePostError;
export const selectPostMetrics         = (s: S) => s.postList.postMetrics.data;
export const selectPostMetricsLoading  = (s: S) => s.postList.postMetrics.loading;
export const selectPostMetricsError    = (s: S) => s.postList.postMetrics.error;
export const selectSavePostLoading     = (s: S) => s.postList.savePost.loading;
export const selectSavedPostId         = (s: S) => (s.postList.savePost.savedPost?.data?._id as string) ?? null;
export const selectRecommended         = (s: S) => s.postList.recommended;
