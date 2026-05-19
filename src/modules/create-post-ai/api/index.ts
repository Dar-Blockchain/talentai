import axiosInstance from "@/utils/axiosInstance";
import { SavePostResponse } from "@/types/post";
import { PostGenerationResponse } from "@/store/slices/postGenerationSlice";

export async function savePost(jobData: PostGenerationResponse & { interviewLanguages: string[] }): Promise<SavePostResponse> {
  const res = await axiosInstance.post("post/save-post", jobData);
  const saved = res.data;
  const job = saved.data || saved;
  return { success: true, jobData: job, planUsage: saved.planUsage ?? null };
}

export async function updatePost(jobId: string, jobData: PostGenerationResponse & { interviewLanguages: string[] }): Promise<SavePostResponse> {
  const res = await axiosInstance.put(`post/updatePost/${jobId}`, jobData);
  const data = res.data;
  const job = data.data || data;
  return { success: true, jobData: job, planUsage: null };
}
