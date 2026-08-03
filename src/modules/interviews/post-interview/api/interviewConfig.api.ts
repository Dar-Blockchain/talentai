import axiosInstance from '@/utils/axiosInstance';
import { InterviewConfig } from '../types/api';

export async function fetchInterviewConfig(jobId: string): Promise<InterviewConfig> {
  try {
    const { data } = await axiosInstance.get(`post/interview-config/${jobId}`);
    return data;
  } catch (err: any) {
    throw new Error(err?.response?.data?.message || 'Failed to load interview configuration');
  }
}
