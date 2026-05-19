import axiosInstance from "@/utils/axiosInstance";
import { SavePostResponse } from "@/types/post";
import { PostGenerationResponse, Salary } from "../store/createPostSlice";

export interface GeneratePostPayload {
  jobDescription: string;
  salary: Salary;
  contractType?: string;
  workMode?: string;
  language?: string;
  interviewLanguages?: string[];
}

export async function generatePost(payload: GeneratePostPayload): Promise<PostGenerationResponse> {
  const { jobDescription, salary, contractType, workMode, language, interviewLanguages } = payload;

  const salaryText = `\n\nSalary Range: ${salary.currency}${salary.min?.toLocaleString()} - ${salary.currency}${salary.max?.toLocaleString()}`;
  const contractTypeText = contractType ? `\nContract Type: ${contractType}` : "";
  const workModeText = workMode ? `\nWork Mode: ${workMode}` : "";
  const description = jobDescription + salaryText + contractTypeText + workModeText;

  const res = await axiosInstance.post("post/generate-job-post", {
    description,
    contractType,
    workMode,
    language,
    interviewLanguages,
  });
  return res.data;
}

export async function savePost(
  jobData: PostGenerationResponse & { interviewLanguages: string[] },
): Promise<SavePostResponse> {
  const res = await axiosInstance.post("post/save-post", jobData);
  const saved = res.data;
  const job = saved.data || saved;
  return { success: true, jobData: job, planUsage: saved.planUsage ?? null };
}

export async function updatePost(
  jobId: string,
  jobData: PostGenerationResponse & { interviewLanguages: string[] },
): Promise<SavePostResponse> {
  const res = await axiosInstance.put(`post/updatePost/${jobId}`, jobData);
  const data = res.data;
  const job = data.data || data;
  return { success: true, jobData: job, planUsage: null };
}
