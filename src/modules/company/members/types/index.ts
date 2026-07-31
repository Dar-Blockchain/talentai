export type MemberRole   = "RH" | "TechLead" | "Supervisor" | "Manager" | "Owner";
export type MemberStatus = "active" | "pending" | "inactive";

export interface Member {
  _id: string;
  userId: string;
  company: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: MemberRole;
  status: MemberStatus;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface MemberResponse {
  success: boolean;
  members: Member[];
}

export interface AddMemberPayload {
  accountId?: string;
  email: string;
  role: string;
  departmentId?: string;
}

export interface UpdateRolePayload {
  membershipId: string;
  role: string;
  departmentId?: string;
}

export interface DeleteMemberPayload {
  membershipId: string;
}

export interface Invitation {
  _id: string;
  email: string;
  company?: unknown;
  user?: {
    _id: string;
    username: string;
    email: string;
  };
  role: string;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled' | 'active' | 'revoked';
  invitedBy: {
    _id: string;
    username: string;
    email: string;
  };
  token?: string;
  createdAt: string;
  expiresAt?: string;
  acceptedAt?: string;
}

export interface MemberStats {
  total: number;
  memberships: { total: number; trend?: { date: string; count: number }[] };
  invitations: { total: number };
}

export interface FetchMembersParams {
  page: number;
  limit: number;
  search?: string;
  departmentIds?: string[];
}

export interface FetchMembersFilters {
  search?: string;
  departmentId?: string;
  role?: string;
  sortBy?: "name" | "date";
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}
