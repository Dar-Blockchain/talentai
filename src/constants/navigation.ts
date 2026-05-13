import {
  SpaceDashboardOutlined,
  CampaignOutlined,
  WorkOutlineOutlined,
  GroupsOutlined,
  TuneOutlined,
  CorporateFareOutlined,
  PeopleAltOutlined,
  DashboardOutlined,
  SettingsOutlined,
  CreditCardOutlined,
  ChatBubbleOutlineOutlined,
} from "@mui/icons-material";
import { EmployeePermissionKey } from "@/types/employeePermissions";
import { CANDIDATE_MESSAGES_BASE_PATH } from "@/modules/candidate-chat/utils/routes";
import { MESSAGES_BASE_PATH } from "@/modules/shared/chat/constants/messagesRoutes";

export const navigation = [
  { id: "dashboard",    icon: SpaceDashboardOutlined, label: "Dashboard",    href: "/company/dashboard" },
  { id: "campaigns",    icon: CampaignOutlined,       label: "Campaigns",    href: "/company/campaigns" },
  { id: "posts",        icon: WorkOutlineOutlined,    label: "Posts",        href: "/company/posts" },
  { id: "employees",    icon: GroupsOutlined,         label: "Employees",    href: "/company/employees" },
  { id: "messages", icon: ChatBubbleOutlineOutlined, label: "Messages", href: MESSAGES_BASE_PATH },
  { id: "departments",  icon: CorporateFareOutlined,  label: "Departments",  href: "/company/departments" },
  { id: "applications", icon: PeopleAltOutlined,      label: "Applications", href: "/company/applications" },
  { id: "settings",     icon: TuneOutlined,           label: "Settings",     href: "/company/settings" },
  { id: "subscription", icon: CreditCardOutlined,     label: "Subscription", href: "/company/plans" },
];

// ─── Candidate navigation ──────────────────────────────────────────────────────

export interface CandidateNavItem {
  id:    string;
  icon:  React.ElementType;
  label: string;
  href:  string;
}

export interface CandidateNavGroup {
  group: string;
  items: CandidateNavItem[];
}

export const candidateNavGroups: CandidateNavGroup[] = [
  {
    group: "Overview",
    items: [
      { id: "candidate-dashboard", icon: DashboardOutlined, label: "Dashboard", href: "/candidate/dashboard" },
      { id: "candidate-messages", icon: ChatBubbleOutlineOutlined, label: "Messages", href: CANDIDATE_MESSAGES_BASE_PATH },
    ],
  },
];

// ─── Employee grouped navigation ──────────────────────────────────────────────

export interface EmployeeNavItem {
  id:          string;
  icon:        React.ElementType;
  label:       string;
  href:        string;
  permission?: EmployeePermissionKey;
}

export interface EmployeeNavGroup {
  group: string;
  items: EmployeeNavItem[];
}

export const employeeNavGroups: EmployeeNavGroup[] = [
  {
    group: "Personal",
    items: [
      { id: "dashboard",    icon: DashboardOutlined, label: "Dashboard",    href: "/employee/dashboard" },
      { id: "my-campaigns", icon: CampaignOutlined,  label: "My Campaigns", href: "/employee/campaigns" },
      { id: "messages", icon: ChatBubbleOutlineOutlined, label: "Messages", href: MESSAGES_BASE_PATH },
    ],
  },
  {
    group: "Company",
    items: [
      { id: "campaigns",   icon: CampaignOutlined,      label: "Campaigns",   href: "/company/campaigns",   permission: "canViewCampaigns" },
      { id: "posts",       icon: WorkOutlineOutlined,   label: "Job Posts",   href: "/company/posts",       permission: "canViewJobPosts" },
      { id: "employees",   icon: GroupsOutlined,        label: "Team",        href: "/company/employees",   permission: "canManageTeam" },
      { id: "departments", icon: CorporateFareOutlined, label: "Departments", href: "/company/departments", permission: "canViewDepartments" },
      { id: "settings",    icon: SettingsOutlined,      label: "Settings",    href: "/company/settings",    permission: "canViewCompanyProfile" },
    ],
  },
];
