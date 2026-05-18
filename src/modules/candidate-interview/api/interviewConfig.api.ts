import axiosInstance from '@/utils/axiosInstance';
import { InterviewConfig } from '../types/api';

export async function fetchInterviewConfig(jobId: string): Promise<InterviewConfig> {
  const { data } = await axiosInstance.get(`post/interview-config/${jobId}`);
  return data;
}
