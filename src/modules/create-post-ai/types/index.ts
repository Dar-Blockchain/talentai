import type { JobDetails, SkillAnalysis } from "../store/createPostSlice";

export interface PostJobData {
  _id?: string;
  jobDetails: JobDetails;
  skillAnalysis: SkillAnalysis;
  creationType: "ai" | "manual" | null;
  interviewLanguages: string[];
  expirationDate: string | null;
}

export interface SavePostResponse {
  success: boolean;
  jobData: PostJobData;
  planUsage: number | null;
}
