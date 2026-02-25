import {
  DashboardOutlined,
  CampaignOutlined,
  ArticleOutlined,
  GroupsOutlined,
  HowToRegOutlined,
  PsychologyOutlined,
  SettingsOutlined,
  ChatOutlined,
} from "@mui/icons-material";

export const navigation = [
  {
    id: "dashboard",
    icon: DashboardOutlined,
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
    icon: ArticleOutlined,
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
    id: "interviews",
    icon: HowToRegOutlined,
    label: "Interviews",
    href: "/company/interviews",
  },
  {
    id: "skills",
    icon: PsychologyOutlined,
    label: "Skills Matrix",
    href: "/company/skills",
  },
  {
    id: "messages",
    icon: ChatOutlined,
    label: "Messages",
    href: "/company/messages",
  },
  {
    id: "settings",
    icon: SettingsOutlined,
    label: "Settings",
    href: "/company/settings",
  },
];