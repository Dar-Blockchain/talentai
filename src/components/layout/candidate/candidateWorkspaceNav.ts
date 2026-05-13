import type { ElementType } from "react";
import AssignmentOutlined from "@mui/icons-material/AssignmentOutlined";
import ChatBubbleOutlineOutlined from "@mui/icons-material/ChatBubbleOutlineOutlined";
import DashboardOutlined from "@mui/icons-material/DashboardOutlined";
import PsychologyOutlined from "@mui/icons-material/PsychologyOutlined";
import SchoolOutlined from "@mui/icons-material/SchoolOutlined";
import {
  CANDIDATE_MESSAGES_BASE_PATH,
  isCandidateMessagesPath,
} from "@/modules/candidate-chat/utils/routes";

export type CandidateWorkspaceView = "applications" | "skills" | "interviews";

export interface CandidateWorkspaceNavItem {
  id: string;
  icon: ElementType;
  labelKey: string;
  sublabelKey: string;
  href: string;
  view?: CandidateWorkspaceView;
  color: string;
  bg: string;
  border: string;
}

const TEAL = "#0D9488";
const TEAL_BG = "#F0FDFA";
const TEAL_BORDER = "#99F6E4";

export const candidateWorkspaceNavItems: CandidateWorkspaceNavItem[] = [
  {
    id: "dashboard",
    icon: DashboardOutlined,
    labelKey: "candidate.nav.dashboard",
    sublabelKey: "candidate.nav.overview",
    href: "/candidate/dashboard",
    color: TEAL,
    bg: TEAL_BG,
    border: TEAL_BORDER,
  },
  {
    id: "messages",
    icon: ChatBubbleOutlineOutlined,
    labelKey: "candidate.nav.messages",
    sublabelKey: "candidate.nav.company_chats",
    href: CANDIDATE_MESSAGES_BASE_PATH,
    color: TEAL,
    bg: TEAL_BG,
    border: TEAL_BORDER,
  },
  {
    id: "applications",
    icon: AssignmentOutlined,
    labelKey: "candidate.nav.applications",
    sublabelKey: "candidate.nav.your_job_applies",
    href: "/candidate/dashboard?view=applications",
    view: "applications",
    color: "#7C3AED",
    bg: "#F5F3FF",
    border: "#DDD6FE",
  },
  {
    id: "skills",
    icon: PsychologyOutlined,
    labelKey: "candidate.nav.skills",
    sublabelKey: "candidate.nav.tech_and_soft",
    href: "/candidate/dashboard?view=skills",
    view: "skills",
    color: "#2563EB",
    bg: "#EFF6FF",
    border: "#BFDBFE",
  },
  {
    id: "interviews",
    icon: SchoolOutlined,
    labelKey: "candidate.nav.interviews",
    sublabelKey: "candidate.nav.all_assessments",
    href: "/candidate/dashboard?view=interviews",
    view: "interviews",
    color: "#D97706",
    bg: "#FFFBEB",
    border: "#FDE68A",
  },
];

export const isCandidateWorkspaceNavActive = (
  item: CandidateWorkspaceNavItem,
  pathname: string,
  viewQuery: string | string[] | undefined,
) => {
  if (item.id === "messages") {
    return isCandidateMessagesPath(pathname) || pathname === "/chat" || pathname.startsWith("/chat/");
  }

  if (item.id === "dashboard") {
    return pathname === "/candidate/dashboard" && !viewQuery;
  }

  if (item.view) {
    return pathname === "/candidate/dashboard" && viewQuery === item.view;
  }

  return pathname === item.href || pathname.startsWith(`${item.href}/`);
};
