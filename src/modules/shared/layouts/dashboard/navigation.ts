import {
  LayoutDashboard,
  Megaphone,
  Briefcase,
  Users,
  SlidersHorizontal,
  Building2,
  CreditCard,
  MessageCircle,
  Bell,
} from "lucide-react";
import { EmployeePermissionKey } from "@/modules/company/employees/types/permissions";
import { MESSAGES_BASE_PATH } from "@/modules/chat/shared/constants/messagesRoutes";

export const navigation = [
  { id: "dashboard",     icon: LayoutDashboard,   label: "Dashboard",     href: "/company/dashboard" },
  { id: "campaigns",     icon: Megaphone,         label: "Campaigns",     href: "/company/campaigns" },
  { id: "posts",         icon: Briefcase,         label: "Posts",         href: "/company/posts" },
  { id: "employees",     icon: Users,             label: "Employees",     href: "/company/employees" },
  { id: "messages",      icon: MessageCircle,     label: "Messages",      href: MESSAGES_BASE_PATH },
  { id: "notifications", icon: Bell,              label: "Notifications", href: "/notifications" },
  { id: "departments",   icon: Building2,         label: "Departments",   href: "/company/departments" },
  { id: "applications",  icon: Users,             label: "Applications",  href: "/company/applications" },
  { id: "settings",      icon: SlidersHorizontal, label: "Settings",      href: "/settings" },
  { id: "subscription",  icon: CreditCard,        label: "Subscription",  href: "/company/plans" },
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
      { id: "dashboard",     icon: LayoutDashboard,  label: "Dashboard",     href: "/employee/dashboard" },
      { id: "my-campaigns",  icon: Megaphone,         label: "My Campaigns",  href: "/employee/campaigns" },
      { id: "messages",      icon: MessageCircle,     label: "Messages",      href: MESSAGES_BASE_PATH },
      { id: "notifications", icon: Bell,              label: "Notifications", href: "/notifications" },
    ],
  },
  {
    group: "Company",
    items: [
      { id: "campaigns",   icon: Megaphone,         label: "Campaigns",   href: "/company/campaigns",   permission: "canViewCampaigns" },
      { id: "posts",       icon: Briefcase,         label: "Job Posts",   href: "/company/posts",       permission: "canViewJobPosts" },
      { id: "employees",   icon: Users,             label: "Team",        href: "/company/employees",   permission: "canManageTeam" },
      { id: "departments", icon: Building2,         label: "Departments", href: "/company/departments", permission: "canViewDepartments" },
      { id: "settings",    icon: SlidersHorizontal, label: "Settings",    href: "/settings",             permission: "canViewCompanyProfile" },
    ],
  },
];
