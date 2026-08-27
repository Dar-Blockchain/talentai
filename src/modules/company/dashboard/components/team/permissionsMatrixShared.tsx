import React from "react";
import { useTranslation } from "react-i18next";
import { Check, X } from "lucide-react";
import axiosInstance from "@/utils/axiosInstance";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/modules/shared/ui/shadcn/hover-card";

const sel = (r: any) => r.data?.data ?? r.data;
export const fetchPermissionsMatrix = (page: number, limit: number, search: string) =>
  axiosInstance.get("company-memberships/memberships/permissions-matrix", { params: { page, limit, search: search || undefined } }).then(sel);

export type PermissionCategory = "jobPosts" | "candidates" | "matching" | "hrAgents" | "team" | "campaigns" | "departments" | "settings";
export type Coverage = "full" | "partial" | "none";

export interface MatrixEmployee {
  userId: string | null;
  name: string;
  role: string;
  categories: Record<PermissionCategory, Coverage>;
  flags: Record<string, boolean>;
}

export interface MatrixPagination { total: number; page: number; limit: number; pages: number }

export const CATEGORY_ORDER: PermissionCategory[] = [
  "jobPosts", "candidates", "matching", "hrAgents", "team", "campaigns", "departments", "settings",
];

export const CATEGORY_META: Record<PermissionCategory, { shortKey: string; shortFallback: string; labelKey: string; labelFallback: string }> = {
  jobPosts:    { shortKey: "pages.permissions_matrix.category_short.jobPosts",    shortFallback: "Posts", labelKey: "pages.permissions_matrix.category.jobPosts",    labelFallback: "Job Posts" },
  candidates:  { shortKey: "pages.permissions_matrix.category_short.candidates",  shortFallback: "Cand.", labelKey: "pages.permissions_matrix.category.candidates",  labelFallback: "Candidates" },
  matching:    { shortKey: "pages.permissions_matrix.category_short.matching",    shortFallback: "Match", labelKey: "pages.permissions_matrix.category.matching",    labelFallback: "Matching" },
  hrAgents:    { shortKey: "pages.permissions_matrix.category_short.hrAgents",    shortFallback: "HR",    labelKey: "pages.permissions_matrix.category.hrAgents",    labelFallback: "HR Agents" },
  team:        { shortKey: "pages.permissions_matrix.category_short.team",       shortFallback: "Team",  labelKey: "pages.permissions_matrix.category.team",        labelFallback: "Team Management" },
  campaigns:   { shortKey: "pages.permissions_matrix.category_short.campaigns",  shortFallback: "Camp.", labelKey: "pages.permissions_matrix.category.campaigns",   labelFallback: "Campaigns" },
  departments: { shortKey: "pages.permissions_matrix.category_short.departments", shortFallback: "Dept.", labelKey: "pages.permissions_matrix.category.departments", labelFallback: "Departments" },
  settings:    { shortKey: "pages.permissions_matrix.category_short.settings",   shortFallback: "Set.",  labelKey: "pages.permissions_matrix.category.settings",    labelFallback: "Settings" },
};

// Mirrors PERMISSION_CATEGORIES in company-membership.service.js — which
// individual EmployeePermissions flags roll up into each category cell.
export const CATEGORY_FLAGS: Record<PermissionCategory, string[]> = {
  jobPosts:    ["canViewJobPosts", "canCreateJobPosts"],
  candidates:  ["canViewCandidates", "canViewInterviewResults", "canContactCandidates"],
  matching:    ["canAccessMatching"],
  hrAgents:    ["canUseHRAgents"],
  team:        ["canManageTeam", "canInviteMembers", "canAssignRoles", "canRemoveEmployee", "canUpdateEmployeeDepartment", "canManagePermissions"],
  campaigns:   ["canViewCampaigns", "canCreateCampaign", "canEditCampaign", "canDeleteCampaign", "canPublishCampaign"],
  departments: ["canViewDepartments", "canCreateDepartment", "canEditDepartment", "canDeleteDepartment"],
  settings:    ["canViewCompanyProfile", "canEditCompanyProfile", "canManageSettings", "canManageBilling", "canManageIntegrations"],
};

const FLAG_LABEL_KEY = (flag: string) => `pages.permissions_matrix.flag.${flag}`;
// Readable fallback if a translation is missing — "canCreateJobPosts" -> "Create Job Posts"
const flagFallback = (flag: string) => flag.replace(/^can/, "").replace(/([A-Z])/g, " $1").trim();

const COVERAGE_COLOR: Record<Coverage, string> = {
  full: "#34D399",
  partial: "#FBBF24",
  none: "#E2E8F0",
};

export const CoverageCell: React.FC<{ category: PermissionCategory; coverage: Coverage; flags: Record<string, boolean> }> = ({ category, coverage, flags }) => {
  const { t } = useTranslation("dashboard");
  const flagKeys = CATEGORY_FLAGS[category];

  return (
    <HoverCard openDelay={120} closeDelay={60}>
      <HoverCardTrigger asChild>
        <div
          className="w-5 h-5 rounded-[5px] shrink-0 cursor-default"
          style={{ background: COVERAGE_COLOR[coverage] }}
        />
      </HoverCardTrigger>
      <HoverCardContent className="w-56 p-2.5">
        <div className="text-[11px] font-bold text-slate-800 mb-1.5">
          {t(CATEGORY_META[category].labelKey, CATEGORY_META[category].labelFallback)}
        </div>
        <div className="space-y-1">
          {flagKeys.map((flag) => {
            const granted = !!flags[flag];
            return (
              <div key={flag} className="flex items-center gap-1.5">
                {granted
                  ? <Check size={12} className="text-emerald-500 shrink-0" />
                  : <X size={12} className="text-slate-300 shrink-0" />}
                <span className={granted ? "text-[11px] text-slate-700" : "text-[11px] text-slate-400"}>
                  {t(FLAG_LABEL_KEY(flag), flagFallback(flag))}
                </span>
              </div>
            );
          })}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};
