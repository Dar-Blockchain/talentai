import type {
  JobDetails,
  SkillAnalysis,
  HardSkill,
  SoftSkill,
  Salary,
} from "../store/createPostSlice";

// re-export so consumers can import from the api layer
export type { JobDetails, SkillAnalysis, HardSkill, SoftSkill, Salary };

// ── POST /post/generate-job-post ──────────────────────────────────────────────

export interface GeneratePostPayload {
  description: string;
  contractType?: string;
  workMode?: string;
  language?: string;
  interviewLanguages?: string[];
}

export interface GeneratePostResponse extends JobDetails {
  requiredSkills: HardSkill[];
  softSkills: SoftSkill[];
}

// ── POST /post/save-post ──────────────────────────────────────────────────────

export interface SavePostPayload extends JobDetails {
  requiredSkills: HardSkill[];
  softSkills: SoftSkill[];
  creationType: "ai" | "manual" | null;
  interviewLanguages: string[];
  expirationDate: string | null;
}

export interface SavePostResponse {
  success: boolean;
  planUsage: number | null;
  data: SavePostPayload & { _id: string };
}

// ── PUT /post/updatePost/:id ──────────────────────────────────────────────────

export type UpdatePostPayload = SavePostPayload;

export interface UpdatePostResponse {
  success: boolean;
  data: SavePostPayload & { _id: string };
}
