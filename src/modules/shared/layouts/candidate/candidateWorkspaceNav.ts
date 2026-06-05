import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  MessageCircle,
  ClipboardList,
  Brain,
  GraduationCap,
  Bell,
  Settings,
} from "lucide-react";
import {
  CANDIDATE_MESSAGES_BASE_PATH,
  isCandidateMessagesPath,
} from "@/modules/chat/candidate-chat/utils/routes";

export type CandidateWorkspaceView = "applications" | "skills" | "interviews";

export interface CandidateWorkspaceNavItem {
  id:          string;
  icon:        LucideIcon;
  labelKey:    string;
  sublabelKey: string;
  href:        string;
  view?:       CandidateWorkspaceView;
  modal?:      boolean;
  color:       string;
  bg:          string;
  border:      string;
}

const TEAL        = "#0D9488";
const TEAL_BG     = "#F0FDFA";
const TEAL_BORDER = "#99F6E4";

export const candidateWorkspaceNavItems: CandidateWorkspaceNavItem[] = [
  { id: "dashboard",     icon: LayoutDashboard, labelKey: "candidate.nav.dashboard",     sublabelKey: "candidate.nav.overview",           href: "/candidate/dashboard",                    color: TEAL,      bg: TEAL_BG,   border: TEAL_BORDER },
  { id: "messages",      icon: MessageCircle,   labelKey: "candidate.nav.messages",      sublabelKey: "candidate.nav.company_chats",      href: CANDIDATE_MESSAGES_BASE_PATH,              color: TEAL,      bg: TEAL_BG,   border: TEAL_BORDER },
  { id: "applications",  icon: ClipboardList,   labelKey: "candidate.nav.applications",  sublabelKey: "candidate.nav.your_job_applies",   href: "/candidate/dashboard?view=applications",  view: "applications", color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" },
  { id: "skills",        icon: Brain,           labelKey: "candidate.nav.skills",        sublabelKey: "candidate.nav.tech_and_soft",      href: "/candidate/dashboard?view=skills",        view: "skills",   color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE" },
  { id: "interviews",    icon: GraduationCap,   labelKey: "candidate.nav.interviews",    sublabelKey: "candidate.nav.all_assessments",    href: "/candidate/dashboard?view=interviews",    view: "interviews", color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
  { id: "notifications", icon: Bell,            labelKey: "candidate.nav.notifications", sublabelKey: "candidate.nav.your_notifications", href: "/notifications",                          color: "#0891B2", bg: "#ECFEFF",  border: "#A5F3FC" },
  { id: "settings",      icon: Settings,        labelKey: "candidate.nav.settings",      sublabelKey: "candidate.nav.manage_profile",     href: "/settings",                               color: "#8B5CF6", bg: "#F5F3FF",  border: "#EDE9FE" },
];

export const isCandidateWorkspaceNavActive = (
  item: CandidateWorkspaceNavItem,
  pathname: string,
  viewQuery: string | string[] | undefined,
) => {
  if (item.id === "messages")      return isCandidateMessagesPath(pathname);
  if (item.id === "dashboard")     return pathname === "/candidate/dashboard" && !viewQuery;
  if (item.id === "notifications") return pathname === "/notifications";
  if (item.id === "settings")      return pathname === "/settings";
  if (item.view)                   return pathname === "/candidate/dashboard" && viewQuery === item.view;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
};
