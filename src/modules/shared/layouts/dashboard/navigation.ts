import {
  SpaceDashboardOutlined,
  CampaignOutlined,
  WorkOutlineOutlined,
  GroupsOutlined,
  TuneOutlined,
  CorporateFareOutlined,
  DashboardOutlined,
  SettingsOutlined,
  CreditCardOutlined,
  ChatBubbleOutlineOutlined,
  NotificationsNoneOutlined,
  PeopleAltOutlined,
} from "@mui/icons-material";
import { EmployeePermissionKey } from "@/types/employeePermissions";
import { MESSAGES_BASE_PATH } from "@/modules/chat/shared/constants/messagesRoutes";

export const navigation = [
  { id: "dashboard",     icon: SpaceDashboardOutlined,    label: "Dashboard",     href: "/company/dashboard" },
  { id: "campaigns",     icon: CampaignOutlined,          label: "Campaigns",     href: "/company/campaigns" },
  { id: "posts",         icon: WorkOutlineOutlined,       label: "Posts",         href: "/company/posts" },
  { id: "employees",     icon: GroupsOutlined,            label: "Employees",     href: "/company/employees" },
  { id: "messages",      icon: ChatBubbleOutlineOutlined, label: "Messages",      href: MESSAGES_BASE_PATH },
  { id: "notifications", icon: NotificationsNoneOutlined, label: "Notifications", href: "/notifications" },
  { id: "departments",   icon: CorporateFareOutlined,     label: "Departments",   href: "/company/departments" },
  { id: "applications",  icon: PeopleAltOutlined,         label: "Applications",  href: "/company/applications" },
  { id: "settings",      icon: TuneOutlined,              label: "Settings",      href: "/settings" },
  { id: "subscription",  icon: CreditCardOutlined,        label: "Subscription",  href: "/company/plans" },
];

export interface EmployeeNavItem {
  id:          string;
  icon:        React.ElementType;
  permission?: EmployeePermissionKey;
  label:       string;
  href:        string;
}

export interface EmployeeNavGroup {
  group: string;
  items: EmployeeNavItem[];
}

export const employeeNavGroups: EmployeeNavGroup[] = [
  {
    group: "Personal",
    items: [
      { id: "dashboard",     icon: DashboardOutlined,          label: "Dashboard",     href: "/employee/dashboard" },
      { id: "my-campaigns",  icon: CampaignOutlined,           label: "My Campaigns",  href: "/employee/campaigns" },
      { id: "messages",      icon: ChatBubbleOutlineOutlined,  label: "Messages",      href: MESSAGES_BASE_PATH },
      { id: "notifications", icon: NotificationsNoneOutlined,  label: "Notifications", href: "/notifications" },
    ],
  },
  {
    group: "Company",
    items: [
      { id: "campaigns",   icon: CampaignOutlined,      label: "Campaigns",   href: "/company/campaigns",   permission: "canViewCampaigns" },
      { id: "posts",       icon: WorkOutlineOutlined,   label: "Job Posts",   href: "/company/posts",       permission: "canViewJobPosts" },
      { id: "employees",   icon: GroupsOutlined,        label: "Team",        href: "/company/employees",   permission: "canManageTeam" },
      { id: "departments", icon: CorporateFareOutlined, label: "Departments", href: "/company/departments", permission: "canViewDepartments" },
      { id: "settings",    icon: SettingsOutlined,      label: "Settings",    href: "/settings",            permission: "canViewCompanyProfile" },
    ],
  },
];
