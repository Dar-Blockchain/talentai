import axiosInstance from '@/utils/axiosInstance';
import { getToken } from '@/utils/tokenUtils';
import { JobPost } from '../types/api';

export async function fetchJobPost(jobId: string): Promise<JobPost> {
  try {
    const url = getToken() ? `post/getPostById/${jobId}` : `post/details/${jobId}`;
    const { data } = await axiosInstance.get(url);
    const post = data?.data?.data ?? data?.data ?? data?.post ?? data;
    if (!post?._id) throw new Error('Invalid job post response');
    return post as JobPost;
  } catch (err: any) {
    throw new Error(err?.response?.data?.message || err?.message || 'Failed to load job post');
  }
}
