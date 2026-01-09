/**
 * Permission types matching the backend PermissionModel
 * Location: Backend/models/PermissionModel.js
 */

export interface Permission {
  _id?: string;
  userId: string;
  profileId: string;

  // Job Post Permissions
  canCreateJobPosts: boolean;

  // Candidate Permissions
  canUnlockCandidates: boolean;
  canViewCandidateProfiles: boolean;
  canContactCandidates: boolean;

  // Matching Permissions
  canAccessMatching: boolean;

  // HR Agent Permissions
  canUseHRAgents: boolean;

  // Team Permissions
  canManageTeam: boolean;
  canInviteMembers: boolean;
  canAssignRoles: boolean;

  // Metadata
  lastModifiedBy?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type PermissionKey = keyof Omit<
  Permission,
  '_id' | 'userId' | 'profileId' | 'lastModifiedBy' | 'notes' | 'createdAt' | 'updatedAt'
>;

export const PERMISSION_CATEGORIES = {
  JOB_POSTS: 'Job Posts',
  CANDIDATES: 'Candidates',
  MATCHING: 'Matching',
  HR_AGENTS: 'HR Agents',
  TEAM: 'Team Management',
} as const;

export interface PermissionGroup {
  category: typeof PERMISSION_CATEGORIES[keyof typeof PERMISSION_CATEGORIES];
  permissions: {
    key: PermissionKey;
    label: string;
    description: string;
  }[];
}

export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    category: PERMISSION_CATEGORIES.JOB_POSTS,
    permissions: [
      {
        key: 'canCreateJobPosts',
        label: 'Create Job Posts',
        description: 'Create, edit, delete, and manage job postings',
      },
    ],
  },
  {
    category: PERMISSION_CATEGORIES.CANDIDATES,
    permissions: [
      {
        key: 'canUnlockCandidates',
        label: 'Unlock Candidates',
        description: 'Purchase and unlock candidate profiles using tokens',
      },
      {
        key: 'canViewCandidateProfiles',
        label: 'View Candidate Profiles',
        description: 'View unlocked candidate profiles, assessments, and resumes',
      },
      {
        key: 'canContactCandidates',
        label: 'Contact Candidates',
        description: 'Send messages and communicate with candidates',
      },
    ],
  },
  {
    category: PERMISSION_CATEGORIES.MATCHING,
    permissions: [
      {
        key: 'canAccessMatching',
        label: 'Access Matching',
        description: 'Access matching algorithm and view candidate matches',
      },
    ],
  },
  {
    category: PERMISSION_CATEGORIES.HR_AGENTS,
    permissions: [
      {
        key: 'canUseHRAgents',
        label: 'Use HR Agents',
        description: 'Create and manage AI HR agents for recruitment automation',
      },
    ],
  },
  {
    category: PERMISSION_CATEGORIES.TEAM,
    permissions: [
      {
        key: 'canManageTeam',
        label: 'Manage Team',
        description: 'Manage team members, view team list, and control team settings',
      },
      {
        key: 'canInviteMembers',
        label: 'Invite Members',
        description: 'Send invitations to new team members to join the company',
      },
      {
        key: 'canAssignRoles',
        label: 'Assign Roles',
        description: 'Assign and update roles for team members',
      },
    ],
  },
];

export const DEFAULT_PERMISSIONS: Omit<Permission, '_id' | 'userId' | 'profileId' | 'createdAt' | 'updatedAt'> = {
  // Job Post Permissions
  canCreateJobPosts: true,

  // Candidate Permissions
  canUnlockCandidates: true,
  canViewCandidateProfiles: true,
  canContactCandidates: true,

  // Matching Permissions
  canAccessMatching: true,

  // HR Agent Permissions
  canUseHRAgents: true,

  // Team Permissions
  canManageTeam: true,
  canInviteMembers: true,
  canAssignRoles: true,
};
