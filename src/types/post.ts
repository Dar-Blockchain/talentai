export type {
  HardSkill,
  SoftSkill,
  Salary,
  JobDetails,
  SkillAnalysis,
  PostGenerationResponse,
  PostGenerationState,
} from "@/store/slices/postGenerationSlice";

export interface SavePostResponse {
  success: boolean;
  jobData: PostJobData;
  planUsage: number | null;
}

export interface PostJobData {
  _id?: string;
  jobDetails: import("@/store/slices/postGenerationSlice").JobDetails;
  skillAnalysis: import("@/store/slices/postGenerationSlice").SkillAnalysis;
  creationType: "ai" | "manual" | null;
  interviewLanguages: string[];
  expirationDate: string | null;
}
