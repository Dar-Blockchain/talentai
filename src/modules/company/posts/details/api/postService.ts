import axiosInstance from "@/utils/axiosInstance";
import type { JobDetail } from "../types";

export const postService = {
  updatePost: async (jobId: string | number, jobData: Partial<JobDetail>) => {
    if (!jobData || !jobId) throw new Error("Job ID or data is missing");
    const res = await axiosInstance.put(`post/updatePost/${jobId}`, jobData);
    const job = res.data.data || res.data;
    return { success: true, jobData: job };
  },

  fetchJobById: async (jobId: string) => {
    const res = await axiosInstance.get(`post/details/${jobId}`);
    return res.data?.data;
  },

  fetchAssessmentDetails: async (id: string) => {
    const res = await axiosInstance.get(`post-interview-assessments/${id}`);
    const responseData = res.data.data || res.data;
    return { assessment: responseData.assessment || responseData, stepsData: responseData.stepsData || null };
  },
};
