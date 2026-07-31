import axios, { type AxiosError } from 'axios';
import axiosInstance from '@/utils/axiosInstance';
import { JobPost } from '../types/api';

export async function fetchJobPost(jobId: string): Promise<JobPost> {
  try {
    const { data } = await axiosInstance.get(`post/details/${jobId}`);
    const post = data?.data?.data ?? data?.data ?? data?.post ?? data;
    if (!post?._id) throw new Error('Invalid job post response');
    return post as JobPost;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      throw new Error(axiosErr.response?.data?.message || axiosErr.message || 'Failed to load job post');
    }
    throw err instanceof Error ? err : new Error('Failed to load job post');
  }
}
