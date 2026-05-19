import axiosInstance from '@/utils/axiosInstance';
import { getToken } from '@/utils/tokenUtils';
import { JobPost } from '../types/api';

export async function fetchJobPost(jobId: string): Promise<JobPost> {
  const url = getToken() ? `post/getPostById/${jobId}` : `post/details/${jobId}`;
  const { data } = await axiosInstance.get(url);
  return data.data?.data || data.data || data.post || data;
}
