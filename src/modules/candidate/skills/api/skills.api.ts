import axiosInstance from '@/utils/axiosInstance';
import type { SkillsParams, SkillsResponse } from '../types/skill.types';

export async function fetchMySkills(params: SkillsParams = {}): Promise<SkillsResponse> {
  const res = await axiosInstance.get<SkillsResponse>('skills', { params });
  return res.data;
}
