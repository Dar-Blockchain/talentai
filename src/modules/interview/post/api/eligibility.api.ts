import axiosInstance from '@/utils/axiosInstance';
import { EligibilityResponse } from '../types/api';

export async function checkEligibility(postId: string): Promise<EligibilityResponse> {
  const { data } = await axiosInstance.get<EligibilityResponse>(
    `post-interview-assessments/eligibility/${postId}`,
  );
  return data;
}
