import axiosInstance from "@/utils/axiosInstance";
import type {
  GeneratePostPayload,
  GeneratePostResponse,
  GetPostResponse,
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

  // Format salary range for the prompt using locale-neutral number formatting
  const salaryText = salary.min != null && salary.max != null
    ? `\n\nSalary Range: ${salary.currency} ${new Intl.NumberFormat("en-US").format(salary.min)} - ${salary.currency} ${new Intl.NumberFormat("en-US").format(salary.max)}`
    : "";
  // const contractText = contractType ? `\nContract Type: ${contractType}` : "";
  const workModeText = workMode     ? `\nWork Mode: ${workMode}`         : "";
  // const description  = jobDescription + salaryText + contractText + workModeText;
  const description = jobDescription + salaryText + workModeText;

  const payload: GeneratePostPayload = { description, contractType, workMode, language, interviewLanguages };
  const res = await axiosInstance.post("post/generate-job-post", payload);
  return res.data as GeneratePostResponse;
}

// ── Save ──────────────────────────────────────────────────────────────────────

export async function savePost(jobData: SavePostPayload): Promise<SavePostResponse> {
  const res = await axiosInstance.post("post/save-post", jobData);
  // Backend returns either { data, planUsage } or the payload directly
  const body = res.data as { data?: SavePostResponse["data"]; planUsage?: number };
  return {
    success: true,
    data: (body.data ?? res.data) as SavePostResponse["data"],
    planUsage: body.planUsage ?? null,
  };
}

// ── Get ───────────────────────────────────────────────────────────────────────

export async function getPost(postId: string): Promise<GetPostResponse> {
  const res = await axiosInstance.get(`post/details/${postId}`);
  return (res.data?.data ?? res.data) as GetPostResponse;
}

// ── Update ────────────────────────────────────────────────────────────────────

export async function updatePost(jobId: string, jobData: UpdatePostPayload): Promise<UpdatePostResponse> {
  const res = await axiosInstance.put(`post/updatePost/${jobId}`, jobData);
  // Backend returns either { data } or the payload directly
  const body = res.data as { data?: UpdatePostResponse["data"] };
  return {
    success: true,
    data: (body.data ?? res.data) as UpdatePostResponse["data"],
  };
}

export * from "./types";
