export interface TopSkill {
  _id: string;
  count: number;
  avgLevel: number;
}

export interface AdminDashboardStats {
  users: number;
  posts: number;
  jobAssessments: number;
  jobAssessmentsWithScore: number;
  jobAssessmentsWithScorePercentage: number;
  feedback: number;
  avgOverallScore: number;
  totalSkills: number;
  totalHardSkills: number;
  totalSoftSkills: number;
  hardSkillsPercentage: number;
  softSkillsPercentage: number;
  topSkills: TopSkill[];
}

export interface AdminMapUser {
  _id: string;
  Localisation?: string;
  ip?: string;
}

export interface UserGrowthPoint {
  day: string;
  users: number;
  posts: number;
  assessments: number;
  fullDate: string;
}
