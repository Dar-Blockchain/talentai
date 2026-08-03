export interface User {
  _id: string;
  username: string;
  email: string;
  role: "Admin" | "Company" | "Candidate" | "jury";
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

export interface UserFilters {
  username: string;
  email: string;
  role: string;
  status: string;
}

export interface FetchUsersParams {
  page?: number;
  limit?: number;
  username?: string;
  email?: string;
  role?: string;
  status?: string;
}

export interface UserStats {
  total: number;
  candidates: number;
  companies: number;
  admins: number;
  verified: number;
  pending: number;
}

export interface FetchUsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  stats?: UserStats;
}
