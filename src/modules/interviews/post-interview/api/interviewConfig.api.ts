import axios, { type AxiosError } from 'axios';
import axiosInstance from '@/utils/axiosInstance';
import { InterviewConfig } from '../types/api';

export async function fetchInterviewConfig(jobId: string): Promise<InterviewConfig> {
  try {
    const { data } = await axiosInstance.get(`post/interview-config/${jobId}`);
    return data;
  } catch (err) {
    const message = axios.isAxiosError(err)
      ? (err as AxiosError<{ message?: string }>).response?.data?.message
      : undefined;
    throw new Error(message || 'Failed to load interview configuration');
  }
}
