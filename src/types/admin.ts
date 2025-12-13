/**
 * Type definitions for Admin Dashboard
 * Extracted from admin.tsx for better maintainability
 */

export interface User {
  _id: string;
  username: string;
  email: string;
  role: 'admin' | 'company' | 'candidate';
  isVerified: boolean;
  createdAt: string;
  lastLogin?: string;
  ip?: string;
  Localisation?: string;
  profile?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    location?: string;
    company?: string;
    position?: string;
  };
}

export interface Assessment {
  _id: string;
  title: string;
  type: 'technical' | 'soft' | 'personality';
  status: 'active' | 'inactive' | 'draft';
  totalQuestions: number;
  duration: number;
  createdAt: string;
  updatedAt: string;
  attempts?: number;
  averageScore?: number;
}

export interface AssessmentResult {
  _id: string;
  userId: string;
  assessmentId: string;
  score: number;
  completedAt: string;
  timeSpent: number;
  answers: any[];
  user?: User;
  assessment?: Assessment;
}

export interface Log {
  _id: string;
  type: string;
  method: string;
  url: string;
  ip: string;
  referer: string;
  statusCode: number;
  user_id: string;
  user_nom: string;
  headers: string;
  executionTime: number;
  body: string;
  timestamp: string;
  __v: number;
}

export interface DashboardStats {
  totalUsers: number;
  totalAssessments: number;
  activeAssessments: number;
  totalAttempts: number;
  averageScore: number;
  userGrowth: number;
  assessmentGrowth: number;
  totalSkills: number;
  posts: number;
  jobAssessmentsWithScorePercentage: number;
}

export interface UserFilters {
  username: string;
  email: string;
  role: string;
  status: string;
}

export interface AssessmentFilters {
  search: string;
  type: string;
  status: string;
}

export interface AssessmentResultFilters {
  skill: string;
  scoreRange: string;
  dateRange: string;
}

export interface LogFilters {
  action: string;
  userId: string;
  dateRange: string;
}

export interface FetchUsersParams {
  page?: number;
  limit?: number;
  username?: string;
  email?: string;
  role?: string;
  status?: string;
}

export interface FetchUsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

export interface FetchLogsResponse {
  logs: Log[];
  total: number;
}
