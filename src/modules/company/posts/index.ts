// ── List sub-module ───────────────────────────────────────────────────────────
export { default as PostsPageContent } from "./list/components/PostsPageContent";
export { useDeletePost }   from "./list/hooks/useDeletePost";
export { useMyPosts }      from "./list/hooks/useMyPosts";
export { usePublishPost }  from "./list/hooks/usePublishPost";
export * from "./list/types";
export * from "./list/utils";

// ── Details sub-module ────────────────────────────────────────────────────────
export { default as JobDetailContent }      from "./details/components/JobDetailContent";
export { default as ApplicationsView }      from "./details/components/ApplicationsView";
export { default as PostBasicDetails }      from "./details/components/PostBasicDetails";
export { default as EditPostDetails, SkillChip } from "./details/components/EditPostDetails";
export type { AssessmentTarget } from "@/modules/company/assessment/modal";
export { default as ContactCandidateModal, type ContactTarget }     from "./details/components/ContactCandidateModal";
export { usePostMetrics }  from "./details/hooks/usePostMetrics";
