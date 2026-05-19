// Types
export type {
  SalaryRange,
  HardSkill,
  SoftSkill,
  JobDetails,
  SkillAnalysis,
  GeneratePostPayload,
  GeneratePostResponse,
  SavePostPayload,
  SavePostResponse,
} from "./types";

// API
export { generatePost, savePost, updatePost } from "./api";

// Main page content
export { default as CreatePostPageContent } from "./components/CreatePostPageContent";

// Stepper hook
export { useCreatePostStepper } from "./hooks/useCreatePostStepper";

// Components
export { default as CreateStepper } from "./CreateStepper";
export { default as InterviewLanguagesModal } from "./InterviewLanguagesModal";

// Post-details step
export {
  PostDetailsStep,
  PostDescription,
  PostPreview,
} from "./steps/post-details-step";
