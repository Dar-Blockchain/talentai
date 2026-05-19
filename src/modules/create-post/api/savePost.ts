import axiosInstance from "@/utils/axiosInstance";
import type { SavePostPayload, SavePostResponse } from "../types";

export async function savePost(jobData: SavePostPayload): Promise<SavePostResponse> {
  const res = await axiosInstance.post("post/save-post", jobData);
  const saved = res.data;
  const job = saved.data || saved;
  return { success: true, jobData: job, planUsage: saved.planUsage ?? null };
}

export async function updatePost(jobId: string, jobData: Partial<SavePostPayload>): Promise<SavePostResponse> {
  const res = await axiosInstance.put(`post/updatePost/${jobId}`, jobData);
  const responseData = res.data;
  const job = responseData.data || responseData;
  return { success: true, jobData: job, planUsage: null };
}
