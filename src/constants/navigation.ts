import {
  DashboardOutlined,
  CampaignOutlined,
  ArticleOutlined,
  GroupsOutlined,
  HowToRegOutlined,
  PsychologyOutlined,
  SettingsOutlined,
  CorporateFareOutlined,
  AssignmentIndOutlined,
} from "@mui/icons-material";

export const navigation = [
  {
    id: "dashboard",
    icon: DashboardOutlined,
    label: "Dashboard",
    href: "/company/dashboard",
  },
  // {
  //   id: "campaigns",
  //   icon: CampaignOutlined,
  //   label: "Campaigns",
  //   href: "/company/campaigns",
  // },
  {
    id: "posts",
    icon: ArticleOutlined,
    label: "Posts",
    href: "/company/posts",
  },
  // {
  //   id: "employees",
  //   icon: GroupsOutlined,
  //   label: "Employees",
  //   href: "/company/employees",
  // },
  // {
  //   id: "departments",
  //   icon: CorporateFareOutlined,
  //   label: "Departments",
  //   href: "/company/departments",
  // },
  {
    id: "interviews",
    icon: HowToRegOutlined,
    label: "Interviews",
    href: "/company/interviews",
  },
  {
    id: "applications",
    icon: AssignmentIndOutlined,
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
    icon: SettingsOutlined,
    label: "Settings",
    href: "/company/settings",
  },
];