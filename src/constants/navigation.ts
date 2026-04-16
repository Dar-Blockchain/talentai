import {
  SpaceDashboardOutlined,
  CampaignOutlined,
  WorkOutlineOutlined,
  GroupsOutlined,
  HowToRegOutlined,
  PsychologyOutlined,
  TuneOutlined,
  CorporateFareOutlined,
  PeopleAltOutlined,
  DashboardOutlined,
  SettingsOutlined,
} from "@mui/icons-material";
import { EmployeePermissionKey } from "@/types/employeePermissions";

export const navigation = [
  {
    id: "dashboard",
    icon: SpaceDashboardOutlined,
    label: "Dashboard",
    href: "/company/dashboard",
  },
  {
    id: "campaigns",
    icon: CampaignOutlined,
    label: "Campaigns",
    href: "/company/campaigns",
  },
  {
    id: "posts",
    icon: WorkOutlineOutlined,
    label: "Posts",
    href: "/company/posts",
  },
  {
    id: "employees",
    icon: GroupsOutlined,
    label: "Employees",
    href: "/company/employees",
  },
  {
    id: "departments",
    icon: CorporateFareOutlined,
    label: "Departments",
    href: "/company/departments",
  },
  {
    id: "interviews",
    icon: HowToRegOutlined,
    label: "Interviews",
    href: "/company/interviews",
  },
  {
    id: "applications",
    icon: PeopleAltOutlined,
    label: "Applications",
    href: "/company/applications",
  },
  // {
  //   id: "skills",
  //   icon: PsychologyOutlined,
  //   label: "Skills Matrix",
  //   href: "/company/skills",
  // },
  {
    id: "settings",
    icon: TuneOutlined,
    label: "Settings",
    href: "/company/settings",
  },
];

// ─── Employee grouped navigation ──────────────────────────────────────────────

export interface EmployeeNavItem {
  id: string;
  icon: React.ElementType;
  label: string;
  href: string;
  permission?: EmployeePermissionKey; // undefined = always visible
}

export interface EmployeeNavGroup {
  group: string;
  items: EmployeeNavItem[];
}

export const employeeNavGroups: EmployeeNavGroup[] = [
  {
    group: "Personal",
    items: [
      {
        id: "dashboard",
        icon: DashboardOutlined,
        label: "Dashboard",
        href: "/employee/dashboard",
      },
      {
        id: "my-campaigns",
        icon: CampaignOutlined,
        label: "My Campaigns",
        href: "/employee/campaigns",
      },
      // {
      //   id: "my-skills",
      //   icon: PsychologyOutlined,
      //   label: "My Skills",
      //   href: "/employee/skills",
      // },
      // {
      //   id: "my-interviews",
      //   icon: HowToRegOutlined,
      //   label: "My Interviews",
      //   href: "/employee/interviews",
      // },
    ],
  },
  {
    group: "Company",
    items: [
      {
        id: "campaigns",
        icon: CampaignOutlined,
        label: "Campaigns",
        href: "/company/campaigns",
        permission: "canViewCampaigns",
      },
      {
        id: "posts",
        icon: WorkOutlineOutlined,
        label: "Job Posts",
        href: "/company/posts",
        permission: "canViewJobPosts",
      },
      {
        id: "interviews",
        icon: HowToRegOutlined,
        label: "Interviews",
        href: "/company/interviews",
        permission: "canViewInterviewResults",
      },
      {
        id: "employees",
        icon: GroupsOutlined,
        label: "Team",
        href: "/company/employees",
        permission: "canManageTeam",
      },
      {
        id: "departments",
        icon: CorporateFareOutlined,
        label: "Departments",
        href: "/company/departments",
        permission: "canViewDepartments",
      },
      {
        id: "settings",
        icon: SettingsOutlined,
        label: "Settings",
        href: "/company/settings",
        permission: "canViewCompanyProfile",
      },
    ],
  },
];