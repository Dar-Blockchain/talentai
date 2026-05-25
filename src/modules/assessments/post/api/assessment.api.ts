import axiosInstance from '@/utils/axiosInstance';
import { PostAssessmentData } from '../types';

export async function fetchPostAssessment(
  postId: string,
  candidateUserId: string,
): Promise<PostAssessmentData> {
  try {
    const { data } = await axiosInstance.get(
      `post-interview-assessments/post/${postId}/candidate/${candidateUserId}`,
    );
    const assessment = data?.data ?? null;
    if (!assessment) throw new Error('No assessment found');
    return assessment as PostAssessmentData;
  } catch (err: any) {
    throw new Error(
      err?.response?.data?.message || err?.message || 'Failed to load assessment',
    );
  }
}
