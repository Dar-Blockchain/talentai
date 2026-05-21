import axiosInstance from "@/utils/axiosInstance";
import type {
  GeneratePostPayload,
  GeneratePostResponse,
  SavePostPayload,
  SavePostResponse,
  UpdatePostPayload,
  UpdatePostResponse,
} from "./types";
import type { Salary } from "./types";

// ── Generate ──────────────────────────────────────────────────────────────────

export interface GeneratePostInput {
  jobDescription: string;
  salary: Salary;
  contractType?: string;
  workMode?: string;
  language?: string;
  interviewLanguages?: string[];
}

export async function generatePost(input: GeneratePostInput): Promise<GeneratePostResponse> {
  const { jobDescription, salary, contractType, workMode, language, interviewLanguages } = input;

  const salaryText   = salary.min != null && salary.max != null
    ? `\n\nSalary Range: ${salary.currency}${salary.min.toLocaleString()} - ${salary.currency}${salary.max.toLocaleString()}`
    : "";
  const contractText = contractType ? `\nContract Type: ${contractType}` : "";
  const workModeText = workMode     ? `\nWork Mode: ${workMode}`         : "";
  const description  = jobDescription + salaryText + contractText + workModeText;

  const payload: GeneratePostPayload = { description, contractType, workMode, language, interviewLanguages };
  const res = await axiosInstance.post("post/generate-job-post", payload);
  return res.data as GeneratePostResponse;
}

// ── Save ──────────────────────────────────────────────────────────────────────

export async function savePost(jobData: SavePostPayload): Promise<SavePostResponse> {
  const res = await axiosInstance.post("post/save-post", jobData);
  const body = res.data;
  return {
    success: true,
    data: body.data || body,
    planUsage: body.planUsage ?? null,
  };
}

// ── Update ────────────────────────────────────────────────────────────────────

export async function updatePost(jobId: string, jobData: UpdatePostPayload): Promise<UpdatePostResponse> {
  const res = await axiosInstance.put(`post/updatePost/${jobId}`, jobData);
  const body = res.data;
  return {
    success: true,
    data: body.data || body,
  };
}

export type { GeneratePostInput as GeneratePostPayload };
export * from "./types";
