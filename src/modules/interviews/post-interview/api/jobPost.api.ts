import axiosInstance from '@/utils/axiosInstance';
import { JobPost } from '../types/api';

export async function fetchJobPost(jobId: string): Promise<JobPost> {
  try {
    const { data } = await axiosInstance.get(`post/details/${jobId}`);
    const post = data?.data?.data ?? data?.data ?? data?.post ?? data;
    if (!post?._id) throw new Error('Invalid job post response');
    return post as JobPost;
  } catch (err: any) {
    throw new Error(err?.response?.data?.message || err?.message || 'Failed to load job post');
  }
}
