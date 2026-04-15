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
} from "@mui/icons-material";

export const navigation = [
  {
    id: "dashboard",
    icon: SpaceDashboardOutlined,
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
    icon: WorkOutlineOutlined,
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
  // {
  //   id: "interviews",
  //   icon: HowToRegOutlined,
  //   label: "Interviews",
  //   href: "/company/interviews",
  // },
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