export type SkillKind = 'technical' | 'soft';

export interface Skill {
  _id: string;
  kind: SkillKind;
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
  kind?: SkillKind;
  search?: string;
  verified?: boolean;
  /** 1-5 (entry..expert); server filters to tested skills in that score band. */
  level?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
