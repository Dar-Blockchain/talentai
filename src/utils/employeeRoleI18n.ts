import type { TFunction } from "i18next";
import { ROLES } from "@/constants/employee";

/** Legacy API role strings → canonical key in ROLES */
const LEGACY_ROLE_TO_CANONICAL: Record<string, string> = {
  RH: "hr",
  TechLead: "technical_leader",
  Supervisor: "supervisor",
  Manager: "manager",
  Owner: "owner",
};

const LEGACY_FALLBACK_LABEL: Record<string, string> = {
  RH: "HR",
  TechLead: "Technical Leader",
  Supervisor: "Supervisor",
  Manager: "Manager",
  Owner: "Owner",
};

export function resolveRoleDefinition(roleStr: string | undefined | null) {
  if (roleStr == null || roleStr === "") return undefined;
  const lower = roleStr.toLowerCase();
  const byValue = ROLES.find((r) => r.value === lower);
  if (byValue) return byValue;
  const canon = LEGACY_ROLE_TO_CANONICAL[roleStr];
  if (canon) return ROLES.find((r) => r.value === canon);
  return undefined;
}

/** Role title — keys `pages.employees.roles.{value}` */
export function getRoleLabel(roleStr: string | undefined | null, t: TFunction): string {
  if (roleStr == null || roleStr === "") return "";
  const def = resolveRoleDefinition(roleStr);
  const canonical = def?.value ?? LEGACY_ROLE_TO_CANONICAL[roleStr];
  const fallback = def?.label ?? LEGACY_FALLBACK_LABEL[roleStr] ?? roleStr;
  if (!canonical) return fallback;
  return t(`pages.employees.roles.${canonical}`, { defaultValue: fallback });
}

/** Role subtitle — keys `pages.employees.role_descriptions.{value}` */
export function getRoleDescription(roleStr: string | undefined | null, t: TFunction): string {
  const def = resolveRoleDefinition(roleStr);
  const canonical = def?.value ?? LEGACY_ROLE_TO_CANONICAL[roleStr ?? ""];
  const fallback = def?.description ?? "";
  if (!canonical) return fallback;
  return t(`pages.employees.role_descriptions.${canonical}`, { defaultValue: fallback });
}

/** Filter dropdown search against translated label + description */
export function roleMatchesSearch(roleValue: string, searchTrimmedLower: string, t: TFunction): boolean {
  if (!searchTrimmedLower) return true;
  const label = getRoleLabel(roleValue, t).toLowerCase();
  const desc = getRoleDescription(roleValue, t).toLowerCase();
  return label.includes(searchTrimmedLower) || desc.includes(searchTrimmedLower);
}
