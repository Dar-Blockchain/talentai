// Single source of truth: everything lives in the global slice.
// This file re-exports so module-internal imports keep working.
export {
  // thunks
  fetchMyPosts,
  deletePost,
  updatePostStatus,
  fetchPostMetrics,
  savePost,
  updatePost,
  fetchJobById,
  postRecruitmentSteps,
  fetchRecommendedPosts,
  savePostInterviewAssessment,
  fetchCandidateAssessments,
  fetchCompanyAssessments,
  fetchAssessmentDetails,
  // actions
  resetSavePost,
  clearError,
  setFlowNodes,
  setFlowEdges,
  resetFlow,
  clearAssessmentDetails,
  // selectors
  selectMyPosts,
  selectMyPostsLoading,
  selectMyPostsError,
  selectMyPostsPagination,
  selectDeletePostLoading,
  selectDeletePostError,
  selectPostMetrics,
  selectPostMetricsLoading,
  selectPostMetricsError,
  selectCurrentJob,
  selectCurrentJobLoading,
  selectCurrentJobError,
  selectSavePostLoading,
  selectSavedPostId,
  selectAssessmentDetails,
  selectAssessmentStepsData,
  selectAssessmentDetailsLoading,
  selectAssessmentDetailsError,
  selectCandidateAssessments,
  selectCandidateAssessmentsLoading,
  selectCandidateAssessmentsPagination,
  selectCompanyAssessments,
  selectCompanyAssessmentsLoading,
  selectCompanyAssessmentsPagination,
  selectRecommended,
  selectSteps,
} from "@/store/slices/postSlice";

// Type aliases kept for backwards-compat with ../types/index.ts
export type PostMetrics = { total: number; active: number; draft: number; closed: number };
export type PostsState  = { myPosts: any[]; myPostsLoading: boolean; myPostsError: string | null; myPostsPagination: any; deletePostLoading: boolean; deletePostError: string | null; updatePostStatusLoading: boolean; updatePostStatusError: string | null; postMetrics: { data: PostMetrics | null; loading: boolean; error: string | null } };
