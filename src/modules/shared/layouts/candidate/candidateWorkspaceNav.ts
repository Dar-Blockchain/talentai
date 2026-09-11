import type { ElementType } from "react";
import {
  LayoutDashboard, MessageCircle, ClipboardList,
  Brain, GraduationCap, Settings,
} from "lucide-react";
import {
  CANDIDATE_MESSAGES_BASE_PATH,
  isCandidateMessagesPath,
} from "@/modules/chat/candidate-chat/utils/routes";

export interface CandidateWorkspaceNavItem {
  id:          string;
  icon:        ElementType;
  labelKey:    string;
  sublabelKey: string;
  href:        string;
  modal?:      boolean;
}

// ─── Nav items ───────────────────────────────────────────────────────────────
// One shared gray-forward style for every item (see CandidateQuickNav) --
// no per-item accent colors. Keeps the sidebar quiet and consistent with the
// rest of the candidate workspace instead of a different hue per page.

export const candidateWorkspaceNavItems: CandidateWorkspaceNavItem[] = [
  {
    id:          "dashboard",
    icon:        LayoutDashboard,
    labelKey:    "candidate.nav.dashboard",
    sublabelKey: "candidate.nav.overview",
    href:        "/candidate/dashboard",
  },
  {
    id:          "messages",
    icon:        MessageCircle,
    labelKey:    "candidate.nav.messages",
    sublabelKey: "candidate.nav.company_chats",
    href:        CANDIDATE_MESSAGES_BASE_PATH,
  },
  {
    id:          "applications",
    icon:        ClipboardList,
    labelKey:    "candidate.nav.applications",
    sublabelKey: "candidate.nav.your_job_applies",
    href:        "/candidate/applications",
  },
  {
    id:          "skills",
    icon:        Brain,
    labelKey:    "candidate.nav.skills",
    sublabelKey: "candidate.nav.tech_and_soft",
    href:        "/candidate/skills",
  },
  {
    id:          "interviews",
    icon:        GraduationCap,
    labelKey:    "candidate.nav.interviews",
    sublabelKey: "candidate.nav.all_assessments",
    href:        "/candidate/interviews",
  },
  {
    id:          "settings",
    icon:        Settings,
    labelKey:    "candidate.nav.settings",
    sublabelKey: "candidate.nav.manage_profile",
    href:        "/settings",
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
  if (item.id === "settings")      return pathname === "/settings";
  if (item.id === "skills")        return pathname === "/candidate/skills";
  if (item.id === "applications")  return pathname === "/candidate/applications" || pathname.startsWith("/candidate/applications/");
  if (item.id === "interviews")    return pathname === "/candidate/interviews"   || pathname.startsWith("/candidate/interviews/");
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
};
