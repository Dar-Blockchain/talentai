export {
  clearPost,
  setGeneratedPost,
  setCreationType,
  setPromptDescription,
  setWorkMode,
  setEmploymentType,
  setExpirationDate,
  updateSalaryField,
  updateJobField,
  updateJobSalaryField,
  updateRequirements,
  updateResponsibilities,
  editHardSkill,
  deleteHardSkill,
  addHardSkill,
  editSoftSkill,
  deleteSoftSkill,
  addSoftSkill,
  setInterviewLanguages,
  selectGeneratedPost,
  selectJobDetails,
  selectHardSkills,
  selectSoftSkills,
  selectCreationType,
} from "@/modules/create-post-ai/store/createPostSlice";

export type {
  HardSkill,
  SoftSkill,
  Salary,
  JobDetails,
  SkillAnalysis,
  PostGenerationResponse,
  PostGenerationState,
} from "@/modules/create-post-ai/store/createPostSlice";

export { default } from "@/modules/create-post-ai/store/createPostSlice";
