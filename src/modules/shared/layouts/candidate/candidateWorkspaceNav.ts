import type { ElementType } from "react";
import {
  LayoutDashboard, MessageCircle, ClipboardList,
  Brain, GraduationCap, Bell, Settings,
} from "lucide-react";
import {
  CANDIDATE_MESSAGES_BASE_PATH,
  isCandidateMessagesPath,
} from "@/modules/chat/candidate-chat/utils/routes";

export interface NavClasses {
  text:     string; // active text color   e.g. "text-teal-600"
  activeBg: string; // active button bg+border   e.g. "bg-teal-600/10 border-teal-600/30"
  iconBg:   string; // active icon box bg+border e.g. "bg-teal-600/15 border-teal-600/40"
  dot:      string; // active indicator dot      e.g. "bg-teal-600"
}

export interface CandidateWorkspaceNavItem {
  id:          string;
  icon:        ElementType;
  labelKey:    string;
  sublabelKey: string;
  href:        string;
  modal?:      boolean;
  classes:     NavClasses;
}

// ─── Theme-token palettes ────────────────────────────────────────────────────

const TEAL: NavClasses = {
  text:     "text-teal-600",
  activeBg: "bg-teal-600/10 border-teal-600/30",
  iconBg:   "bg-teal-600/15 border-teal-600/40",
  dot:      "bg-teal-600",
};

const PURPLE: NavClasses = {
  text:     "text-secondary-dark",
  activeBg: "bg-secondary-dark/10 border-secondary-dark/30",
  iconBg:   "bg-secondary-dark/15 border-secondary-dark/40",
  dot:      "bg-secondary-dark",
};

const BLUE: NavClasses = {
  text:     "text-info",
  activeBg: "bg-info/10 border-info/30",
  iconBg:   "bg-info/15 border-info/40",
  dot:      "bg-info",
};

const AMBER: NavClasses = {
  text:     "text-warning",
  activeBg: "bg-warning/10 border-warning/30",
  iconBg:   "bg-warning/15 border-warning/40",
  dot:      "bg-warning",
};

// ─── Nav items ───────────────────────────────────────────────────────────────

export const candidateWorkspaceNavItems: CandidateWorkspaceNavItem[] = [
  {
    id:          "dashboard",
    icon:        LayoutDashboard,
    labelKey:    "candidate.nav.dashboard",
    sublabelKey: "candidate.nav.overview",
    href:        "/candidate/dashboard",
    classes:     TEAL,
  },
  {
    id:          "messages",
    icon:        MessageCircle,
    labelKey:    "candidate.nav.messages",
    sublabelKey: "candidate.nav.company_chats",
    href:        CANDIDATE_MESSAGES_BASE_PATH,
    classes:     TEAL,
  },
  {
    id:          "applications",
    icon:        ClipboardList,
    labelKey:    "candidate.nav.applications",
    sublabelKey: "candidate.nav.your_job_applies",
    href:        "/candidate/applications",
    classes:     PURPLE,
  },
  {
    id:          "skills",
    icon:        Brain,
    labelKey:    "candidate.nav.skills",
    sublabelKey: "candidate.nav.tech_and_soft",
    href:        "/candidate/skills",
    classes:     BLUE,
  },
  {
    id:          "interviews",
    icon:        GraduationCap,
    labelKey:    "candidate.nav.interviews",
    sublabelKey: "candidate.nav.all_assessments",
    href:        "/candidate/interviews",
    classes:     AMBER,
  },
  {
    id:          "notifications",
    icon:        Bell,
    labelKey:    "candidate.nav.notifications",
    sublabelKey: "candidate.nav.your_notifications",
    href:        "/notifications",
    classes:     TEAL,
  },
  {
    id:          "settings",
    icon:        Settings,
    labelKey:    "candidate.nav.settings",
    sublabelKey: "candidate.nav.manage_profile",
    href:        "/settings",
    classes:     PURPLE,
  },
];

// ─── Active check ────────────────────────────────────────────────────────────

export const isCandidateWorkspaceNavActive = (
  item: CandidateWorkspaceNavItem,
  pathname: string,
  viewQuery: string | string[] | undefined,
): boolean => {
  if (item.id === "messages")      return isCandidateMessagesPath(pathname);
  if (item.id === "dashboard")     return pathname === "/candidate/dashboard" && !viewQuery;
  if (item.id === "notifications") return pathname === "/notifications";
  if (item.id === "settings")      return pathname === "/settings";
  if (item.id === "skills")        return pathname === "/candidate/skills";
  if (item.id === "applications")  return pathname === "/candidate/applications" || pathname.startsWith("/candidate/applications/");
  if (item.id === "interviews")    return pathname === "/candidate/interviews"   || pathname.startsWith("/candidate/interviews/");
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
};
