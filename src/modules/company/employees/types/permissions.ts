/**
 * Permission types for individual employee access control.
 * Kept separate from permissions.ts to avoid coupling.
 */

export interface EmployeePermission {
  _id?: string;
  userId: string;
  profileId: string;

  // Job Post Permissions
  canViewJobPosts: boolean;
  canCreateJobPosts: boolean;

  // Candidate Permissions
  canViewCandidates: boolean;
  canViewInterviewResults: boolean;
  canContactCandidates: boolean;

  // Matching Permissions
  canAccessMatching: boolean;

  // HR Agent Permissions
  canUseHRAgents: boolean;

  // Team Permissions
  canManageTeam: boolean;
  canInviteMembers: boolean;
  canAssignRoles: boolean;
  canRemoveEmployee: boolean;
  canUpdateEmployeeDepartment: boolean;
  canManagePermissions: boolean;

  // Campaign Permissions
  canViewCampaigns: boolean;
  canCreateCampaign: boolean;
  canEditCampaign: boolean;
  canDeleteCampaign: boolean;
  canPublishCampaign: boolean;

  // Department Permissions
  canViewDepartments: boolean;
  canCreateDepartment: boolean;
  canEditDepartment: boolean;
  canDeleteDepartment: boolean;

  // Settings Permissions
  canViewCompanyProfile: boolean;
  canEditCompanyProfile: boolean;
  canManageSettings: boolean;
  canManageBilling: boolean;
  canManageIntegrations: boolean;

  // Metadata
  lastModifiedBy?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type EmployeePermissionKey = keyof Omit<
  EmployeePermission,
  '_id' | 'userId' | 'profileId' | 'lastModifiedBy' | 'notes' | 'createdAt' | 'updatedAt'
>;

export const EMPLOYEE_PERMISSION_CATEGORIES = {
  JOB_POSTS:   'Job Posts',
  CANDIDATES:  'Candidates',
  CAMPAIGNS:   'Campaigns',
  TEAM:        'Team Management',
  DEPARTMENTS: 'Departments',
  SETTINGS:    'Settings',
} as const;

export interface EmployeePermissionGroup {
  category: typeof EMPLOYEE_PERMISSION_CATEGORIES[keyof typeof EMPLOYEE_PERMISSION_CATEGORIES];
  permissions: {
    key: EmployeePermissionKey;
    label: string;
    description: string;
  }[];
}

export const EMPLOYEE_PERMISSION_GROUPS: EmployeePermissionGroup[] = [
  {
    category: EMPLOYEE_PERMISSION_CATEGORIES.JOB_POSTS,
    permissions: [
      {
        key: 'canViewJobPosts',
        label: 'View Job Posts',
        description: 'Browse and read all published job postings',
      },
      {
        key: 'canCreateJobPosts',
        label: 'Create Job Posts',
        description: 'Create, edit, delete, and manage job postings',
      },
    ],
  },
  {
    category: EMPLOYEE_PERMISSION_CATEGORIES.CANDIDATES,
    permissions: [
      {
        key: 'canViewCandidates',
        label: 'View Candidates',
        description: 'View the list of candidates who applied to job posts',
      },
      {
        key: 'canViewInterviewResults',
        label: 'View Interview Results',
        description: 'Access candidate interview results and evaluations',
      },
      {
        key: 'canContactCandidates',
        label: 'Contact Candidates',
        description: 'Send messages and communicate with candidates',
      },
    ],
  },
  {
    category: EMPLOYEE_PERMISSION_CATEGORIES.CAMPAIGNS,
    permissions: [
      {
        key: 'canViewCampaigns',
        label: 'View Campaigns',
        description: 'Browse the list of campaigns and their details',
      },
      {
        key: 'canCreateCampaign',
        label: 'Create Campaign',
        description: 'Create new marketing or recruitment campaigns',
      },
      {
        key: 'canEditCampaign',
        label: 'Edit Campaign',
        description: 'Modify campaign content, settings, and targeting',
      },
      {
        key: 'canDeleteCampaign',
        label: 'Delete Campaign',
        description: 'Permanently remove campaigns from the workspace',
      },
      {
        key: 'canPublishCampaign',
        label: 'Publish Campaign',
        description: 'Launch and activate campaigns for distribution',
      },
    ],
  },
  {
    category: EMPLOYEE_PERMISSION_CATEGORIES.TEAM,
    permissions: [
      {
        key: 'canManageTeam',
        label: 'View Team',
        description: 'View the list of team members and their profiles',
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
      {
        key: 'canRemoveEmployee',
        label: 'Remove Employee',
        description: 'Remove members from the workspace permanently',
      },
      {
        key: 'canUpdateEmployeeDepartment',
        label: 'Update Employee Department',
        description: "Change a team member's assigned department",
      },
      {
        key: 'canManagePermissions',
        label: 'Manage Permissions',
        description: 'View and edit permissions for other team members',
      },
    ],
  },
  {
    category: EMPLOYEE_PERMISSION_CATEGORIES.DEPARTMENTS,
    permissions: [
      {
        key: 'canViewDepartments',
        label: 'View Departments',
        description: 'Browse the list of departments and their members',
      },
      {
        key: 'canCreateDepartment',
        label: 'Create Department',
        description: 'Add new departments to the organisation structure',
      },
      {
        key: 'canEditDepartment',
        label: 'Edit Department',
        description: 'Rename departments and update their details',
      },
      {
        key: 'canDeleteDepartment',
        label: 'Delete Department',
        description: 'Permanently remove departments from the organisation',
      },
    ],
  },
  {
    category: EMPLOYEE_PERMISSION_CATEGORIES.SETTINGS,
    permissions: [
      {
        key: 'canViewCompanyProfile',
        label: 'View Company Profile',
        description: 'View the company name, logo, and public profile details',
      },
      {
        key: 'canEditCompanyProfile',
        label: 'Edit Company Profile',
        description: 'Update company name, logo, description, and contact info',
      },
      {
        key: 'canManageSettings',
        label: 'Manage Settings',
        description: 'Access and modify general workspace settings',
      },
    ],
  },
];

export const DEFAULT_EMPLOYEE_PERMISSIONS: Omit<EmployeePermission, '_id' | 'userId' | 'profileId' | 'createdAt' | 'updatedAt'> = {
  // Job Posts
  canViewJobPosts: true,
  canCreateJobPosts: false,

  // Candidates
  canViewCandidates: true,
  canViewInterviewResults: false,
  canContactCandidates: false,

  // Matching
  canAccessMatching: false,

  // HR Agents
  canUseHRAgents: false,

  // Team
  canManageTeam: false,
  canInviteMembers: false,
  canAssignRoles: false,
  canRemoveEmployee: false,
  canUpdateEmployeeDepartment: false,
  canManagePermissions: false,

  // Campaigns
  canViewCampaigns: true,
  canCreateCampaign: false,
  canEditCampaign: false,
  canDeleteCampaign: false,
  canPublishCampaign: false,

  // Departments
  canViewDepartments: true,
  canCreateDepartment: false,
  canEditDepartment: false,
  canDeleteDepartment: false,

  // Settings
  canViewCompanyProfile: true,
  canEditCompanyProfile: false,
  canManageSettings: false,
  canManageBilling: false,
  canManageIntegrations: false,
};
