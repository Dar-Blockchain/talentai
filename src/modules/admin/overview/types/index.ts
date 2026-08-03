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

export interface RevenueByPlan {
  planId: string;
  planName: string;
  priceUsd: number;
  activeSubscriptions: number;
  mrr: number;
}

export interface AdminRevenueSummary {
  mrr: number;
  totalActiveSubscriptions: number;
  byPlan: RevenueByPlan[];
}

export interface RecentSignupProfile {
  firstName?: string;
  lastName?: string;
  phone?: string;
  location?: string;
  company?: string;
  position?: string;
}

export interface RecentSignup {
  _id: string;
  username: string;
  email: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
  lastLogin?: string;
  Localisation?: string;
  profile?: RecentSignupProfile;
}
