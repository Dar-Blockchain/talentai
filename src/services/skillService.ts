import axiosInstance from '@/utils/axiosInstance';

export interface Skill {
  _id: string;
  kind: 'technical' | 'soft';
  name: string;
  category?: string;
  proficiencyLevel: number;
  experienceLevel: string;
  numberTestPassed: number;
  testScore: number;
  levelConfirmed: number;
  sourceCvAnalyses: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SkillsPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface SkillsResponse {
  success: boolean;
  skills: Skill[];
  pagination: SkillsPagination;
}

export interface SkillsParams {
  kind?: 'technical' | 'soft';
  search?: string;
  verified?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const skillService = {
  getMySkills: async (params: SkillsParams = {}): Promise<SkillsResponse> => {
    const res = await axiosInstance.get('skills', { params });
    return res.data;
  },

  getSkillsByProfile: async (profileId: string, params: SkillsParams = {}): Promise<SkillsResponse> => {
    const res = await axiosInstance.get(`skills/profile/${profileId}`, { params });
    return res.data;
  },
};
