import axiosInstance from '@/utils/axiosInstance';
import { EligibilityResponse } from '../types/api';

export async function checkEligibility(postId: string): Promise<EligibilityResponse> {
  try {
    const { data } = await axiosInstance.get<EligibilityResponse>(
      `post-interview-assessments/eligibility/${postId}`,
    );
    return data;
  } catch (err: any) {
    const status = err?.response?.status;
    if (status === 404) return { status: 'not_found' };
    throw new Error(err?.response?.data?.message || 'Failed to check eligibility');
  }
}
