import axios, { type AxiosError } from 'axios';
import axiosInstance from '@/utils/axiosInstance';
import { EligibilityResponse } from '../types/api';

export async function checkEligibility(postId: string): Promise<EligibilityResponse> {
  try {
    const { data } = await axiosInstance.get<EligibilityResponse>(
      `post-interview-assessments/eligibility/${postId}`,
    );
    return data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      if (axiosErr.response?.status === 404) return { status: 'not_found' };
      throw new Error(axiosErr.response?.data?.message || 'Failed to check eligibility');
    }
    throw new Error('Failed to check eligibility');
  }
}
